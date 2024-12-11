const { StreamClient } = require('@stream-io/node-sdk');
const fs = require('node:fs/promises');
const path = require('node:path');

require('dotenv').config();

(async () => {
  const key = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const secret = process.env.NEXT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_API_URL;

  const users = JSON.parse(
    await fs.readFile(path.resolve('users.json'), 'utf-8'),
  );

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating users...');
  await client.upsertUsers(users);

  console.log('Creating feed groups...');
  await client.feeds.upsertFeedGroup({
    feed_group: {
      app_pk: 31264,
      slug: 'user',
      type: 'flat',
      max_length: 500,
    },
  });

  await client.feeds.upsertFeedGroup({
    feed_group: {
      app_pk: 31264,
      slug: 'timeline',
      type: 'flat',
      max_length: 500,
    },
  });

  await client.feeds.upsertFeedGroup({
    feed_group: {
      app_pk: 31264,
      slug: 'notification',
      type: 'notification',
      aggregation_format: '{{verb.id}}',
      max_length: 3600,
    },
  });

  console.log('Creating user feeds for users...');
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    await client.feeds.feed('user', user.id).getOrCreate({
      visibility_level: 'visible',
      user_id: user.id,
    });

    await client.feeds.feed('timeline', user.id).getOrCreate({
      visibility_level: 'visible',
      user_id: user.id,
    });
  }

  console.log('Finished initialization');
})();
