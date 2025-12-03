import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useState, useCallback } from 'react';

export const FileUpload = ({
  onImageUploaded,
}: {
  onImageUploaded: (imageUrl: string) => void;
}) => {
  const client = useFeedsClient();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!client) {
        return;
      }
      setIsUploading(true);
      try {
        const { file: image_url } = await client.uploadImage({ file });
        if (image_url) {
          onImageUploaded(image_url);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [client, onImageUploaded],
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

  return (
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
  );
};
