import { StreamClient, type Attachment, type ActivityRequest } from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { File } from 'node:buffer';
import 'dotenv/config';

import type { User } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

// Story expiration time in days
const STORY_EXPIRATION_DAYS = 5;

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getExpirationDate(): string {
  const now = new Date();
  now.setDate(now.getDate() + STORY_EXPIRATION_DAYS);
  return now.toISOString();
}

async function main(): Promise<void> {
  const key = process.env.STREAM_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.API_URL;

  if (!key || !secret) {
    console.error('Missing STREAM_API_KEY or API_SECRET environment variables');
    process.exit(1);
  }

  // Load users
  const users: User[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'users.json'), 'utf-8'),
  );

  // Get list of images from images folder
  const imagesDir = path.resolve(dataDir, 'images');
  const imageFiles = (await fs.readdir(imagesDir)).filter((f) =>
    f.endsWith('.jpg'),
  );

  if (imageFiles.length === 0) {
    console.error('No images found in images folder');
    process.exit(1);
  }

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating stories for users...');
  console.log(`Story expiration: ${STORY_EXPIRATION_DAYS} days`);

  let totalStories = 0;

  for (const user of users) {
    // Each user gets 2-4 stories
    const numStories = getRandomInt(2, 4);
    const selectedImages = getRandomItems(imageFiles, numStories);

    console.log(`Creating ${numStories} stories for user ${user.name}...`);

    for (let i = 0; i < numStories; i++) {
      const imageFile = selectedImages[i];
      const storyFeed = client.feeds.feed('story', user.id);

      // Upload the image
      const imagePath = path.join(imagesDir, imageFile);
      const imageBuffer = await fs.readFile(imagePath);
      const file = new File([imageBuffer], imageFile, {
        type: 'image/jpeg',
      });
      const uploadResponse = await client.uploadImage({
        file,
        user: { id: user.id },
        upload_sizes: [],
      });

      const attachment: Attachment = {
        type: 'image',
        image_url: uploadResponse.file,
        custom: {},
      };

      const activity: ActivityRequest = {
        type: 'story',
        feeds: [storyFeed.feed],
        user_id: user.id,
        attachments: [attachment],
        expires_at: getExpirationDate(),
      };

      await client.feeds.addActivity(activity);
      totalStories++;

      console.log(`  Created story ${i + 1}/${numStories} for ${user.name}`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`Finished creating ${totalStories} stories for ${users.length} users`);
}

main().catch(console.error);
