import {
  FeedState,
  useFeedContext,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';

const selector = (state: FeedState) => ({
  createdBy: state.created_by,
});

export const ActivityComposer = () => {
  const feed = useFeedContext();
  const [newText, setNewText] = useState('');

  const { createdBy } = useStateStore(feed?.state, selector) ?? {
    createdBy: undefined,
  };

  const sendActivity = useCallback(async () => {
    await feed?.addActivity({
      text: newText,
      type: 'post',
    });
    setNewText('');
  }, [feed, newText]);

  return (
    <div className="w-full p-4 bg-base-100 card border border-base-300">
      <div className="w-full flex items-start gap-4">
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-lg font-semibold">
            <span>{createdBy?.name?.[0]}</span>
          </div>
        </div>
        <div className="w-full flex flex-col items-end gap-2">
          <textarea
            className="w-full textarea textarea-ghost flex-1 min-h-[60px] text-base"
            rows={3}
            placeholder="What is happening?"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={{ resize: 'none' }}
          />
          <button
            className="btn btn-primary flex-shrink-0"
            onClick={sendActivity}
            disabled={!newText.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};
