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
          <span className="material-symbols-outlined">image</span>
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
