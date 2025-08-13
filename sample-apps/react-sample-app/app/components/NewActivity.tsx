import {
  Feed,
  FeedState,
  isImageFile,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useErrorContext } from '../error-context';
import { FormEvent, useState } from 'react';
import { ActivityComposer } from './ActivityComposer';
import { LoadingIndicator } from './LoadingIndicator';
import { useUserContext } from '../user-context';

const selector = ({ own_capabilities = [] }: FeedState) => ({
  canPost: own_capabilities.includes('add-activity'),
});

export const NewActivity = ({ feed }: { feed: Feed }) => {
  const { client } = useUserContext();
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activityText, setActivityText] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const { canPost } = useStateStore(feed.state, selector);

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
        disabled={isSending || activityText === ''}
      >
        {isSending ? <LoadingIndicator /> : 'Post'}
      </button>
    </form>
  );
};
