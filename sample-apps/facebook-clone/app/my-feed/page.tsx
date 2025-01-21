'use client';
import { useState } from 'react';
import { ActivityComposer } from '../components/ActivityComposer';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useErrorContext } from '../error-context';
import { useFeedContext } from '../feed-context';
import { v4 as uuidv4 } from 'uuid';

export default function MyFeed() {
  const { ownFeed } = useFeedContext();
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activityText, setActivityText] = useState('');

  if (!ownFeed) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  const sendActivity = async () => {
    setIsSending(true);
    try {
      await ownFeed.addActivity({
        verb: 'post',
        object: uuidv4(),
        // TODO: we don't yet have enrichment, so we just store data in custom property
        custom: {
          text: activityText,
        },
      });
      setActivityText('');
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to send post, this could've been a temporary issue, try again`,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <ActivityComposer
        text={activityText}
        onChange={setActivityText}
      ></ActivityComposer>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        onClick={() => sendActivity()}
        disabled={isSending || activityText === ''}
      >
        {isSending ? <LoadingIndicator></LoadingIndicator> : 'Post'}
      </button>
      <Feed feed={ownFeed} onNewPost="show-immediately"></Feed>
    </div>
  );
}
