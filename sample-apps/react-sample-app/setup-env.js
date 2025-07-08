/* eslint-disable @typescript-eslint/no-floating-promises */
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

  console.log('Creating feeds for users...');
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    const userFeed = client.feeds.feed('user', user.id);
    await userFeed.getOrCreate({
      visibility_level: user.visibility_level,
      user: { id: user.id },
    });

    const timeline = client.feeds.feed('timeline', user.id);
    await timeline.getOrCreate({
      visibility_level: 'private',
      user: { id: user.id },
    });

    // user's timeline follows user's post feed
    await client.feeds.follow({
      target: userFeed.fid,
      source: timeline.fid,
    });

    // TODO
    // await client.feeds.feed('notification', user.id).getOrCreate({
    //   visibility_level: 'private',
    //   user_id: user.id,
    // });
  }

  console.log('Finished initialization');
})();
