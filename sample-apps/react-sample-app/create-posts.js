const { StreamClient } = require('@stream-io/node-sdk');
const fs = require('node:fs/promises');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

(async () => {
  const key = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const secret = process.env.NEXT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_API_URL;

  const users = JSON.parse(
    await fs.readFile(path.resolve('users.json'), 'utf-8'),
  );
  const posts = JSON.parse(
    await fs.readFile(path.resolve('posts.json'), 'utf-8'),
  );
  const polls = JSON.parse(
    await fs.readFile(path.resolve('polls.json'), 'utf-8'),
  );

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating activities for users...');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const user = users[Math.floor(Math.random() * users.length)];

    const userFeed = client.feeds.feed('user', user.id);

    await client.feeds.addActivity({
      type: 'post',
      fids: [userFeed.fid],
      text: post,
      user_id: user.id,
    });
  }

  console.log('Creating activities with polls for users...');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const user = users[Math.floor(Math.random() * users.length)];
    const poll = polls[Math.floor(Math.random() * polls.length)];

    const createdPoll = await client.createPoll({ ...poll, user_id: user.id });
    const userFeed = client.feeds.feed('user', user.id);

    const createdActivity = await client.feeds.addActivity({
      type: 'post',
      fids: [userFeed.fid],
      text: post,
      user_id: user.id,
    })

    // Currently there's a BE bug with adding an activity with a poll_id serverside, so we use this workaround.
    // This can be moved into activity creation when the bug is fixed.

    await client.feeds.updateActivity({
      activity_id: createdActivity.activity.id,
      poll_id: createdPoll.poll.id,
      user_id: user.id,
    })
  }

  console.log('Finished');
})();
