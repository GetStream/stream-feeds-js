import {
  FeedOwnCapability,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useErrorContext } from '../error-context';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ActivityComposer } from './ActivityComposer';
import { LoadingIndicator } from './LoadingIndicator';

export const NewActivity = ({ feed }: { feed: StreamFlatFeedClient }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activityText, setActivityText] = useState('');
  const [canPost, setCanPost] = useState(false);

  useEffect(() => {
    return feed.state.subscribeWithSelector(
      (s) => ({
        isAllowedToPost: !!s.own_capabilities?.includes(
          FeedOwnCapability.ADD_ACTIVITY,
        ),
      }),
      ({ isAllowedToPost }) => setCanPost(isAllowedToPost),
    );
  }, [feed]);

  const sendActivity = async () => {
    setIsSending(true);
    try {
      await feed.addActivity({
        verb: 'post',
        object: uuidv4(),
        // TODO: we don't yet have enrichment, so we just store data in custom property
        custom: {
          text: activityText,
        },
      });
      setActivityText('');
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  if (!canPost) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-start gap-1">
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
    </div>
  );
};
