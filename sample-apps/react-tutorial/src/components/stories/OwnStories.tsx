import {
  FeedState,
  useFeedActivities,
  useFeedContext,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { StoryViewer } from './StoryViewer';
import { StoryCircle } from './StoryCircle';

const selector = (state: FeedState) => ({
  createdBy: state.created_by,
});

export const OwnStories = () => {
  const ownStoryFeed = useFeedContext();
  const client = useFeedsClient();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);

  const { activities } = useFeedActivities();

  const { createdBy } = useStateStore(ownStoryFeed?.state, selector) ?? {
    createdBy: undefined,
  };

  const addActivity = useCallback(
    async (file: File) => {
      if (!client) {
        return;
      }
      const { file: image_url } = await client.uploadImage({ file });
      await ownStoryFeed?.addActivity({
        type: 'post',
        attachments: [{ type: 'image', image_url, custom: {} }],
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      });
    },
    [ownStoryFeed, client],
  );

  if (!ownStoryFeed) {
    return null;
  }

  return (
    <>
      <div className="relative inline-block">
        <StoryCircle
          isActive={(activities?.length ?? 0) > 0}
          onClick={() => setIsStoryViewerOpen(true)}
          disabled={activities?.length === 0}
          user={createdBy}
        />

        <label className="absolute bottom-6 right-0 cursor-pointer">
          <div className="btn btn-xs btn-primary btn-circle">+</div>
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                return;
              }
              void addActivity(file);
            }}
          />
        </label>
      </div>

      {isStoryViewerOpen && activities && (
        <StoryViewer
          activities={activities}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      )}
    </>
  );
};
