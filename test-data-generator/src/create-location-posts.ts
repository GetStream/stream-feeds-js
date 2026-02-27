import {
  StreamClient,
  type ActivityRequest,
  type Attachment,
} from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { File } from 'node:buffer';
import 'dotenv/config';

import type { User } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

/** Subfolder name under images/location/ for each city */
const LOCATION_IMAGE_FOLDERS: Record<string, string> = {
  'Amsterdam': 'amsterdam',
  'Boulder, Colorado': 'boulder',
};

const LOCATION_POSTS: Array<{
  city: string;
  lat: number;
  lng: number;
  funFacts: string[];
}> = [
  {
    city: 'Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    funFacts: [
      'Amsterdam has more canals than Venice and over 1,500 bridges.',
      "The city is built on 11 million wooden poles that support the buildings.",
    ],
  },
  {
    city: 'Boulder, Colorado',
    lat: 40.015,
    lng: -105.2705,
    funFacts: [
      "Boulder has more than 300 days of sunshine per year.",
      "The Flatirons are Boulder's iconic rock formations, over 299 million years old.",
    ],
  },
];

function getRandomUser(users: User[]): User {
  return users[Math.floor(Math.random() * users.length)];
}

async function getLocationImageFiles(
  dataDirPath: string,
  city: string,
): Promise<string[]> {
  const folder = LOCATION_IMAGE_FOLDERS[city];
  if (!folder) return [];
  const locationImagesDir = path.resolve(dataDirPath, 'images', 'location', folder);
  try {
    const files = await fs.readdir(locationImagesDir);
    return files.filter(
      (f) => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'),
    );
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const key = process.env.STREAM_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.API_URL;

  if (!key || !secret) {
    console.error('Missing STREAM_API_KEY or API_SECRET environment variables');
    process.exit(1);
  }

  const users: User[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'users.json'), 'utf-8'),
  );

  if (users.length === 0) {
    console.error('No users found in users.json');
    process.exit(1);
  }

  const client = new StreamClient(key, secret, { basePath: url });

  // Load image file names per location (images/location/amsterdam, images/location/boulder)
  const locationImageFiles: Record<string, string[]> = {};
  for (const location of LOCATION_POSTS) {
    const files = await getLocationImageFiles(dataDir, location.city);
    locationImageFiles[location.city] = files;
    if (files.length > 0) {
      console.log(`  Found ${files.length} image(s) for ${location.city}`);
    }
  }

  const locationImagesDir = path.resolve(dataDir, 'images', 'location');
  console.log('Creating location posts (4 activities: 2 Amsterdam, 2 Boulder)...');

  let activityIndex = 0;
  for (const location of LOCATION_POSTS) {
    const cityImageFiles = locationImageFiles[location.city] ?? [];
    const cityFolder = LOCATION_IMAGE_FOLDERS[location.city];

    for (let i = 0; i < location.funFacts.length; i++) {
      const funFact = location.funFacts[i];
      const user = getRandomUser(users);
      const userFeed = client.feeds.feed('user', user.id);

      const activity: ActivityRequest = {
        type: 'post',
        feeds: [userFeed.feed],
        text: funFact,
        user_id: user.id,
        location: {
          lat: location.lat,
          lng: location.lng,
        },
        custom: { location_city: location.city },
      };

      // Assign one image per post by index (wraps if fewer images than posts)
      const imageFile =
        cityImageFiles.length > 0
          ? cityImageFiles[i % cityImageFiles.length]
          : undefined;
      if (imageFile && cityFolder) {
        const imagePath = path.join(locationImagesDir, cityFolder, imageFile);
        const imageBuffer = await fs.readFile(imagePath);
        const mime =
          imageFile.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const file = new File([imageBuffer], imageFile, { type: mime });
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
        activity.attachments = [attachment];
      }

      await client.feeds.addActivity(activity);
      activityIndex++;
      console.log(
        `  ${activityIndex}/4 Created post for ${user.name} @ ${location.city} (${location.lat}, ${location.lng})${imageFile ? ' with image' : ''}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log('Finished creating location posts.');
}

main().catch(console.error);
