import { v4 as uuidv4 } from 'uuid';
import { LoadingIndicator } from './LoadingIndicator';
import { useErrorContext } from '../error-context';
import { useState } from 'react';
import { StreamFlatFeedClient } from '@stream-io/feeds-client';

export function ActivityComposer({ feed }: { feed: StreamFlatFeedClient }) {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [post, setPost] = useState<string>('');

  const sendPost = async () => {
    setIsSending(true);
    try {
      await feed.addActivity({
        verb: 'post',
        object: uuidv4(),
        // TODO: we don't yet have enrichment, so we just store data in custom property
        custom: {
          text: post,
        },
      });
      setPost('');
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
    <div className="w-full">
      <textarea
        id="question"
        name="question"
        value={[post]}
        onChange={(e) => setPost(e.target.value)}
        rows={5}
        placeholder="Write your post here..."
        className="w-full p-3 border border-gray-300 rounded-md resize-none"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        onClick={() => sendPost()}
        disabled={isSending || post === ''}
      >
        {isSending ? <LoadingIndicator></LoadingIndicator> : 'Post'}
      </button>
    </div>
  );
}
