import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/FeedsClient';
import { Feed } from '../../src/Feed';
import { UserRequest } from '../../src/gen/models';
import fs from 'fs';
import path from 'path';
import { isImageFile } from '../../src/utils';

describe('File uploads page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let imageUrl: string;
  let fileUrl: string;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it('How to upload a file or image', async () => {
    const imageFileBuffer = fs.readFileSync(
      path.join(__dirname, 'assets', 'test-image.jpg'),
    );
    const dataFileBuffer = fs.readFileSync(
      path.join(__dirname, 'assets', 'test-file.pdf'),
    );

    const files = [
      new File([imageFileBuffer], 'test-image.png'),
      new File([dataFileBuffer], 'test-file.txt'),
    ];

    const activityText = 'This is a test activity';

    const requests = [];
    for (const file of [...(files ?? [])]) {
      if (isImageFile(file)) {
        requests.push(
          client.uploadImage({
            file,
            // Optionally provide resize params
            upload_sizes: [
              {
                width: 100,
                height: 100,
                resize: 'scale',
                crop: 'center',
              },
            ],
          }),
        );
      } else {
        requests.push(
          client.uploadFile({
            file,
          }),
        );
      }
    }
    const fileResponses = await Promise.all(requests);

    imageUrl = fileResponses[0]?.file ?? '';
    fileUrl = fileResponses[1]?.file ?? '';

    await feed.addActivity({
      type: 'post',
      text: activityText,
      attachments: fileResponses.map((response, index) => {
        const isImage = isImageFile(files![index]);
        return {
          type: isImage ? 'image' : 'file',
          [isImage ? 'image_url' : 'asset_url']: response?.file,
          custom: {},
        };
      }),
    });
  });

  it('Deleting Files and Images', async () => {
    await client.deleteImage({
      url: imageUrl,
    });
    await client.deleteFile({
      url: fileUrl,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});
