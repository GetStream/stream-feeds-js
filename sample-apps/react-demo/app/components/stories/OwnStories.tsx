import type { FeedState } from '@stream-io/feeds-react-sdk';
import {
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
  const [isLoading, setIsLoading] = useState(false);

  const { activities } = useFeedActivities();

  const { createdBy } = useStateStore(ownStoryFeed?.state, selector) ?? {
    createdBy: undefined,
  };

  const addActivity = useCallback(
    async (file: File) => {
      if (!client) {
        return;
      }
      setIsLoading(true);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const uploadResponse = await (type === 'video' ? client.uploadFile({ file }) : client.uploadImage({ file }));
      try {
        await ownStoryFeed?.addActivity({
          type: 'post',
          attachments: [{ type, [type === 'image' ? 'image_url' : 'asset_url']: uploadResponse?.file, custom: {} }],
          // Expires after 24h
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
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
          <div className="size-5 rounded-full bg-primary text-primary-content flex items-center justify-center">
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <span className="material-symbols-outlined text-[14px]!">add</span>
            )}
          </div>
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

      {isStoryViewerOpen && activities && activities.length > 0 && (
        <StoryViewer
          activities={activities}
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      )}
    </>
  );
};
