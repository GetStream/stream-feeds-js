const { StreamClient } = require('@stream-io/node-sdk');
const { kMaxLength } = require('node:buffer');
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

  console.log('Creating feed groups...');
  await client['sendRequest'](
    'POST',
    '/api/v2/feeds/feedgroups/{group}',
    undefined,
    undefined,
    {
      feed_group: {
        app_pk: 31264,
        slug: 'user',
        type: 'flat',
        max_length: 500,
      },
    },
  );

  await client['sendRequest'](
    'POST',
    '/api/v2/feeds/feedgroups/{group}',
    undefined,
    undefined,
    {
      feed_group: {
        app_pk: 31264,
        slug: 'notification',
        type: 'notification',
        aggregation_format: '{{verb.id}}',
        max_length: 3600,
      },
    },
  );

  console.log('Finished initialization');
})();
