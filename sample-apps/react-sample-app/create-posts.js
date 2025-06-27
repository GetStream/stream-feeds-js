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
  const pages = JSON.parse(
    await fs.readFile(path.resolve('pages.json'), 'utf-8'),
  );

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating activities for users...');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const user = users[Math.floor(Math.random() * users.length)];

    await client.feeds.feed('user', user.id).addActivity({
      verb: 'post',
      object: uuidv4(),
      custom: {
        text: post,
      },
      user: { id: user.id },
    });
  }

  console.log('Creating activities for pages...');

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const page = pages[Math.floor(Math.random() * pages.length)];

    await client.feeds.feed('page', page.id).addActivity({
      verb: 'post',
      object: uuidv4(),
      custom: {
        text: post,
      },
      user_id: page.owner_id,
    });
  }

  console.log('Finished');
})();
