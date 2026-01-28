import { StreamClient, type Attachment, type ActivityRequest } from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { File } from 'node:buffer';
import 'dotenv/config';

import type { User, Poll, Feature, FeatureProbabilities } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

// Available features for post generation
const AVAILABLE_FEATURES: Feature[] = [
  'link',
  'attachment',
  'mention',
  'poll',
  'reaction',
  'comment',
  'bookmark',
  'repost',
];

// Feature probabilities
const FEATURE_PROBABILITIES: FeatureProbabilities = {
  link: 0.4,
  attachment: 0.4,
  mention: 0.15,
  poll: 0.05,
  reaction: 0.7,
  comment: 0.7,
  bookmark: 0.2,
  repost: 0.05,
};

function parseFeatures(featuresArg: string | null): Feature[] {
  if (!featuresArg) {
    return [];
  }

  const features = featuresArg
    .split(',')
    .map((f) => f.trim().toLowerCase()) as Feature[];

  const invalidFeatures = features.filter(
    (f) => !AVAILABLE_FEATURES.includes(f),
  );
  if (invalidFeatures.length > 0) {
    console.error(`Invalid features: ${invalidFeatures.join(', ')}`);
    console.error(`Available features: ${AVAILABLE_FEATURES.join(', ')}`);
    process.exit(1);
  }

  return features;
}

function printUsage(): void {
  console.log(
    'Usage: tsx src/create-posts.ts [--features <feature1,feature2,...>]',
  );
  console.log('');
  console.log('Options:');
  console.log(
    '  --features  Comma-separated list of features to include in posts',
  );
  console.log('');
  console.log(`Available features: ${AVAILABLE_FEATURES.join(', ')}`);
  console.log('');
  console.log('Examples:');
  console.log('  yarn create-posts');
  console.log('  yarn create-posts --features poll,reaction');
  console.log(
    '  yarn create-posts --features link,attachment,mention,poll,reaction,comment',
  );
}

function shouldIncludeFeature(
  feature: Feature,
  enabledFeatures: Feature[],
): boolean {
  if (!enabledFeatures.includes(feature)) {
    return false;
  }
  return Math.random() < FEATURE_PROBABILITIES[feature];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main(): Promise<void> {
  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const featuresIndex = args.indexOf('--features');
  const featuresArg = featuresIndex !== -1 ? args[featuresIndex + 1] : null;
  const features = parseFeatures(featuresArg);

  if (features.length > 0) {
    console.log(`Enabled features: ${features.join(', ')}`);
  } else {
    console.log('No features specified, creating basic posts only');
  }

  const key = process.env.STREAM_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.API_URL;

  if (!key || !secret) {
    console.error('Missing STREAM_API_KEY or API_SECRET environment variables');
    process.exit(1);
  }

  // Load data files
  const users: User[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'users.json'), 'utf-8'),
  );
  const texts: string[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'texts.json'), 'utf-8'),
  );
  const polls: Poll[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'polls.json'), 'utf-8'),
  );
  const links: string[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'links.json'), 'utf-8'),
  );
  const reactionTypes: string[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'reactions.json'), 'utf-8'),
  );

  // Get list of images from images folder
  const imagesDir = path.resolve(dataDir, 'images');
  const imageFiles = (await fs.readdir(imagesDir)).filter((f) =>
    f.endsWith('.jpg'),
  );

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating activities for users...');

  // Track created activity IDs for reposts
  const createdActivityIds: string[] = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const user = users[Math.floor(Math.random() * users.length)];
    const userFeed = client.feeds.feed('user', user.id);

    // Feature: repost - check if this should be a repost (only if we have existing activities)
    const isRepost =
      createdActivityIds.length > 0 && shouldIncludeFeature('repost', features);

    const activity: ActivityRequest = {
      type: 'post',
      feeds: [userFeed.feed],
      text: text,
      user_id: user.id,
    };

    // If this is a repost, set parent_id and skip other content features
    if (isRepost) {
      const parentId =
        createdActivityIds[
          Math.floor(Math.random() * createdActivityIds.length)
        ];
      activity.parent_id = parentId;
      console.log(`  -> Repost of activity ${parentId}`);
    } else {
      // Only add content features (link, attachment, poll) for non-reposts

      // Feature: mention - add mentioned user to start of text
      if (shouldIncludeFeature('mention', features)) {
        const mentionedUser = users[Math.floor(Math.random() * users.length)];
        activity.text = `@${mentionedUser.name} ${text}`;
        activity.mentioned_user_ids = [mentionedUser.id];
      }

      // Feature: link and attachment are mutually exclusive
      // First determine which features would be included, then pick at most one
      const wouldIncludeLink = shouldIncludeFeature('link', features);
      const wouldIncludeAttachment = shouldIncludeFeature(
        'attachment',
        features,
      );

      let includeLink = false;
      let includeAttachment = false;

      if (wouldIncludeLink && wouldIncludeAttachment) {
        // Both would be included, randomly pick one
        if (Math.random() < 0.5) {
          includeLink = true;
        } else {
          includeAttachment = true;
        }
      } else {
        includeLink = wouldIncludeLink;
        includeAttachment = wouldIncludeAttachment;
      }

      // Feature: link - add a random link
      if (includeLink) {
        const link = links[Math.floor(Math.random() * links.length)];
        activity.text = `${activity.text}. Check out this link: ${link}`;
      }

      // Feature: attachment - add 1-3 random photos
      if (includeAttachment) {
        const numPhotos = getRandomInt(1, 3);
        const selectedImages = getRandomItems(imageFiles, numPhotos);
        const attachments: Attachment[] = [];

        for (const imageFile of selectedImages) {
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
          attachments.push({
            type: 'image',
            image_url: uploadResponse.file,
            custom: {},
          });
        }

        activity.attachments = attachments;
      }

      // Feature: poll - create and add a random poll
      if (shouldIncludeFeature('poll', features)) {
        const pollData = polls[Math.floor(Math.random() * polls.length)];
        const createdPoll = await client.createPoll({
          ...pollData,
          user_id: user.id,
        });
        if (createdPoll.poll.id) {
          activity.poll_id = createdPoll.poll.id;
        }
      }
    }

    // Create the activity
    const createdActivity = await client.feeds.addActivity(activity);

    // Track the activity ID for potential reposts
    createdActivityIds.push(createdActivity.activity.id);

    // Feature: reaction - add 1-5 reactions after activity is created
    if (shouldIncludeFeature('reaction', features)) {
      const numReactions = getRandomInt(1, 5);
      const reactingUsers = getRandomItems(users, numReactions);

      for (const reactingUser of reactingUsers) {
        const reactionType =
          reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        await client.feeds.addActivityReaction({
          type: reactionType,
          activity_id: createdActivity.activity.id,
          user_id: reactingUser.id,
        });
      }
    }

    // Feature: comment - add 1-5 comments after activity is created
    if (shouldIncludeFeature('comment', features)) {
      const numComments = getRandomInt(1, 5);
      const commentingUsers = getRandomItems(users, numComments);

      for (const commentingUser of commentingUsers) {
        const commentText = texts[Math.floor(Math.random() * texts.length)];
        await client.feeds.addComment({
          comment: commentText,
          object_id: createdActivity.activity.id,
          object_type: 'activity',
          user_id: commentingUser.id,
        });
      }
    }

    // Feature: bookmark - bookmark the activity by a random user
    if (shouldIncludeFeature('bookmark', features)) {
      const bookmarkingUser = users[Math.floor(Math.random() * users.length)];
      await client.feeds.addBookmark({
        activity_id: createdActivity.activity.id,
        user_id: bookmarkingUser.id,
      });
      console.log(`  -> Bookmarked by ${bookmarkingUser.name}`);
    }

    console.log(`Created activity ${i + 1}/${texts.length}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('Finished');
}

main().catch(console.error);
