import type { FeedState } from '@stream-io/feeds-react-sdk';
import {
  useFeedContext,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';

const selector = (state: FeedState) => ({
  createdBy: state.created_by,
});

export const ActivityComposer = () => {
  const feed = useFeedContext();
  const [newText, setNewText] = useState('');
  const client = useFeedsClient();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const { createdBy } = useStateStore(feed?.state, selector) ?? {
    createdBy: undefined,
  };

  const uploadImage = useCallback(
    async (file: File) => {
      if (!client) {
        return;
      }
      setIsUploading(true);
      try {
        const { file: image_url } = await client.uploadImage({ file });
        setImageUrl(image_url);
      } finally {
        setIsUploading(false);
      }
    },
    [client],
  );

  const fileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      void uploadImage(file);
    },
    [uploadImage],
  );

  const sendActivity = useCallback(async () => {
    await feed?.addActivity({
      text: newText,
      type: 'post',
      attachments: imageUrl
        ? [{ type: 'image', image_url: imageUrl, custom: {} }]
        : [],
    });
    setNewText('');
    setImageUrl(undefined);
  }, [feed, newText, imageUrl]);

  return (
    <div className="w-full p-4 bg-base-100 card border border-base-300">
      <div className="w-full flex items-start gap-4">
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-lg font-semibold">
            <span>{createdBy?.name?.[0]}</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <textarea
            className="w-full textarea textarea-ghost flex-1 min-h-[60px] text-base"
            rows={3}
            placeholder="What is happening?"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={{ resize: 'none' }}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Uploaded image"
              className="w-50 h-50 object-cover rounded-lg"
            />
          )}
          <div className="w-full flex justify-end items-center gap-2">
            <label className="cursor-pointer">
              <div className="btn btn-secondary">
                {isUploading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={fileSelected}
              />
            </label>
            <button
              className="btn btn-primary flex-shrink-0"
              onClick={sendActivity}
              disabled={!newText && !isUploading}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
