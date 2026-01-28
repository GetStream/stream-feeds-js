import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage } from 'node:http';

import type { DownloadResult } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

const TOTAL_IMAGES = 100;
const IMAGE_SIZE = 1000;
const IMAGES_DIR = path.join(dataDir, 'images');
const CONCURRENCY = 5; // Number of concurrent downloads

// Create images directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`Created directory: ${IMAGES_DIR}`);
}

function downloadImage(index: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const filename = path.join(
      IMAGES_DIR,
      `image-${String(index).padStart(4, '0')}.jpg`,
    );

    // Skip if file already exists
    if (fs.existsSync(filename)) {
      console.log(
        `[${index}/${TOTAL_IMAGES}] Skipped (already exists): ${path.basename(filename)}`,
      );
      resolve(filename);
      return;
    }

    const url = `https://picsum.photos/${IMAGE_SIZE}`;

    const handleImageResponse = (imgResponse: IncomingMessage): void => {
      if (imgResponse.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download image ${index}: HTTP ${imgResponse.statusCode}`,
          ),
        );
        return;
      }

      const fileStream = fs.createWriteStream(filename);
      imgResponse.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(
          `[${index}/${TOTAL_IMAGES}] Downloaded: ${path.basename(filename)}`,
        );
        resolve(filename);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filename, () => {}); // Delete partial file
        reject(err);
      });
    };

    https
      .get(url, (response) => {
        // Handle redirect (picsum.photos redirects to the actual image)
        if (response.statusCode === 302 || response.statusCode === 301) {
          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            reject(new Error(`No redirect URL for image ${index}`));
            return;
          }
          https.get(redirectUrl, handleImageResponse).on('error', reject);
        } else if (response.statusCode === 200) {
          // Direct response (no redirect)
          handleImageResponse(response);
        } else {
          reject(
            new Error(
              `Failed to download image ${index}: HTTP ${response.statusCode}`,
            ),
          );
        }
      })
      .on('error', reject);
  });
}

async function downloadWithRetry(index: number, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await downloadImage(index);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `[${index}/${TOTAL_IMAGES}] Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`,
      );
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error(`Failed to download image ${index} after ${maxRetries} attempts`);
}

async function downloadBatch(startIndex: number, endIndex: number): Promise<DownloadResult[]> {
  const results: DownloadResult[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    try {
      const result = await downloadWithRetry(i);
      results.push({ index: i, success: true, file: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ index: i, success: false, error: errorMessage });
    }
    // Small delay between downloads to be nice to the server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return results;
}

async function downloadAllImages(): Promise<void> {
  console.log(
    `Starting download of ${TOTAL_IMAGES} images from picsum.photos...`,
  );
  console.log(`Images will be saved to: ${IMAGES_DIR}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log('---');

  const startTime = Date.now();
  const batchSize = Math.ceil(TOTAL_IMAGES / CONCURRENCY);
  const batches: Array<Promise<DownloadResult[]>> = [];

  // Create batches for concurrent processing
  for (let i = 0; i < CONCURRENCY; i++) {
    const start = i * batchSize + 1;
    const end = Math.min((i + 1) * batchSize, TOTAL_IMAGES);
    if (start <= TOTAL_IMAGES) {
      batches.push(downloadBatch(start, end));
    }
  }

  // Run all batches concurrently
  const allResults = await Promise.all(batches);
  const results = allResults.flat();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  console.log('---');
  console.log(`Download complete in ${duration} seconds`);
  console.log(`Successful: ${successful}/${TOTAL_IMAGES}`);

  if (failed.length > 0) {
    console.log(`Failed: ${failed.length}`);
    failed.forEach((f) => console.log(`  - Image ${f.index}: ${f.error}`));
  }
}

downloadAllImages().catch(console.error);
