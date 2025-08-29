const { StreamClient } = require('@stream-io/node-sdk');
const fs = require('node:fs/promises');
const path = require('node:path');

require('dotenv').config();

(async () => {
  const key = 'ccqysy8u2tm6';
  const secret = process.env.STREAM_API_SECRET;

  const users = JSON.parse(
    await fs.readFile(path.resolve('users.json'), 'utf-8'),
  );
  const nodeClient = new StreamClient(key, secret);

  console.log('Creating users...');
  await nodeClient.upsertUsers(users);

  console.log('Creating custom feed groups...');
  await nodeClient.feeds.createFeedGroup({ id: 'hashtag' });

  console.log('Creating feeds for users...');
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    const userFeed = nodeClient.feeds.feed('user', user.id);
    await userFeed.getOrCreate({
      visibility_level: user.visibility_level,
      user: { id: user.id },
    });

    const timeline = nodeClient.feeds.feed('timeline', user.id);
    await timeline.getOrCreate({
      visibility_level: 'private',
      user: { id: user.id },
    });

    // user's timeline follows user's post feed
    await nodeClient.feeds.follow({
      target: userFeed.feed,
      source: timeline.feed,
    });

    await nodeClient.feeds.feed('notification', user.id).getOrCreate({
      visibility_level: 'private',
      user_id: user.id,
    });
  }

  console.log('Finished initialization');
})();
