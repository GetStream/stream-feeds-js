const { StreamClient } = require('@stream-io/node-sdk');
const fs = require('node:fs/promises');
const path = require('node:path');

require('dotenv').config();

(async () => {
  const key = process.env.VITE_STREAM_API_KEY;
  const secret = process.env.VITE_STREAM_API_SECRET;
  const url = process.env.VITE_API_URL;

  const users = JSON.parse(
    await fs.readFile(path.resolve('__test__', 'users.json'), 'utf-8'),
  );

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating users...');
  await client.upsertUsers(users);

  console.log('Finished initialization');
})();
