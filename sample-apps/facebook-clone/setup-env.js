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
  const pages = JSON.parse(
    await fs.readFile(path.resolve('pages.json'), 'utf-8'),
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
      slug: 'page',
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
      aggregation_format:
        '{% if verb == "follow-request" %}{{ actor }}_{{ verb }}_{{ time.strftime("%Y-%m-%d") }}{% elif verb == "invite" %}{{ actor }}_{{ verb }}_{{ time.strftime("%Y-%m-%d") }}{% elif verb == "like" %}{{ verb }}_{{object}}_{{ time.strftime("%Y-%m-%d") }}{% else %}{{ verb }}_{{ time.strftime("%Y-%m-%d") }}{% endif %}',
      max_length: 3600,
    },
  });

  console.log('Creating feeds for users...');
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    await client.feeds.feed('user', user.id).getOrCreate({
      visibility_level: user.visibility_level,
      user_id: user.id,
    });

    const timeline = client.feeds.feed('timeline', user.id);
    await timeline.getOrCreate({
      visibility_level: 'private',
      user_id: user.id,
    });

    // user's timeline follows user's post feed
    await timeline.follow({
      target_group: 'user',
      target_id: user.id,
      user_id: user.id,
    });

    await client.feeds.feed('notification', user.id).getOrCreate({
      visibility_level: 'private',
      user_id: user.id,
    });
  }

  console.log('Creating pages...');
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    await client.feeds.feed('page', page.id).getOrCreate({
      visibility_level: page.visibility_level,
      user_id: page.owner_id,
      custom: {
        name: page.name,
        description: page.description,
        image: page.image,
      },
    });
  }

  console.log('Finished initialization');
})();
