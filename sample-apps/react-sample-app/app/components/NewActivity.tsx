import {
  FeedOwnCapability,
  isImageFile,
  useFeedContext,
  useFeedsClient,
  useOwnCapabilities,
} from '@stream-io/feeds-react-sdk';
import { useErrorContext } from '../error-context';
import type { FormEvent} from 'react';
import { useMemo, useState } from 'react';
import { ActivityComposer } from './activity/ActivityComposer';
import { LoadingIndicator } from './LoadingIndicator';

export const NewActivity = () => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activityText, setActivityText] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const ownCapabilities = useOwnCapabilities();
  const canPost = useMemo(
    () => ownCapabilities.includes(FeedOwnCapability.ADD_ACTIVITY),
    [ownCapabilities],
  );

  const sendActivity = async (event: FormEvent) => {
    const currentTarget = event.currentTarget as HTMLFormElement;
    event.preventDefault();
    setIsSending(true);
    try {
      const requests = [];
      for (const file of [...(files ?? [])]) {
        if (isImageFile(file)) {
          requests.push(
            client?.uploadImage({
              file,
            }),
          );
        } else {
          requests.push(
            client?.uploadFile({
              file,
            }),
          );
        }
      }
      const fileResponses = await Promise.all(requests);

      await feed?.addActivity({
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
      setFiles(null);
      setActivityText('');
      currentTarget.reset();
    } catch (error) {
      logErrorAndDisplayNotification(error);
    } finally {
      setIsSending(false);
    }
  };

  if (!canPost) {
    return null;
  }

  return (
    <form
      className="w-full flex flex-col items-start gap-1"
      onSubmit={sendActivity}
    >
      <ActivityComposer text={activityText} onChange={setActivityText} />
      <input
        type="file"
        name="file"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            setFiles(e.target.files);
          }
        }}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        disabled={isSending || (activityText === '' && !files?.length)}
      >
        {isSending ? <LoadingIndicator /> : 'Post'}
      </button>
    </form>
  );
};
