import { Feed, FeedState } from '@stream-io/feeds-client';
import { useErrorContext } from '../error-context';
import { useState } from 'react';
import { ActivityComposer } from './ActivityComposer';
import { LoadingIndicator } from './LoadingIndicator';
import { useStateStore } from '../hooks/useStateStore';

const selector = ({ own_capabilities = [] }: FeedState) => ({
  canPost: own_capabilities.includes('add-activity'),
});

export const NewActivity = ({ feed }: { feed: Feed }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activityText, setActivityText] = useState('');

  const { canPost } = useStateStore(feed.state, selector);

  const sendActivity = async () => {
    setIsSending(true);
    try {
      await feed.addActivity({
        type: 'post',
        text: activityText,
      });
      setActivityText('');
    } catch (error) {
      if (error instanceof Error) {
        logErrorAndDisplayNotification(error, error.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!canPost) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-start gap-1">
      <ActivityComposer text={activityText} onChange={setActivityText} />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        onClick={() => sendActivity()}
        disabled={isSending || activityText === ''}
      >
        {isSending ? <LoadingIndicator /> : 'Post'}
      </button>
    </div>
  );
};
