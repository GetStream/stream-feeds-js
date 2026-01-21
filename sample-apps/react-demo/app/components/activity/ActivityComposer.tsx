import type { FeedState } from '@stream-io/feeds-react-sdk';
import { useFeedContext, useStateStore } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { FileUpload } from './FileUpload';
import { Avatar } from '../utility/Avatar';

const selector = (state: FeedState) => ({
  createdBy: state.created_by,
});

export const ActivityComposer = () => {
  const feed = useFeedContext();
  const [newText, setNewText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const { createdBy } = useStateStore(feed?.state, selector) ?? {
    createdBy: undefined,
  };

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
        <div className="size-10 md:size-12">
          <Avatar user={createdBy} />
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
            <FileUpload onImageUploaded={setImageUrl} />
            <button
              className="btn btn-primary flex-shrink-0"
              onClick={sendActivity}
              disabled={!newText}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
