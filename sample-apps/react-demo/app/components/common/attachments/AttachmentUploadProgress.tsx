import { LoadingIndicator } from '../../utility/LoadingIndicator';
import { SIZE_CLASSES } from './sizes';

export type AttachmentUploadProgressProps = {
  file: File;
  status: 'loading' | 'error';
  previewUrl: string;
  onUpload: () => void;
  onDelete?: () => void;
  size?: 'small' | 'medium' | 'large';
};

export const AttachmentUploadProgress = ({
  file,
  status,
  previewUrl,
  onUpload,
  onDelete,
  size = 'medium',
}: AttachmentUploadProgressProps) => {
  const buttonPosition = size === 'small' ? 'top-1 right-1' : 'top-2 right-2';
  const buttonSize = size === 'small' ? 'btn-xs' : 'btn-sm';
  const iconSize = size === 'small' ? 'text-sm' : '';

  const isVideo = file.type.startsWith('video/');

  return (
    <div className="relative flex-shrink-0">
      {isVideo ? (
        <video
          src={previewUrl}
          controls={false}
          autoPlay={false}
          className={`${SIZE_CLASSES[size]} object-cover rounded-lg`}
        />
      ) : (
        <img
          src={previewUrl}
          alt="Upload preview"
          className={`${SIZE_CLASSES[size]} object-cover rounded-lg`}
        />
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 bg-neutral/50 flex items-center justify-center rounded-lg">
          <LoadingIndicator className="loading-lg text-neutral-content" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 bg-error/30 flex flex-col items-center justify-center gap-2 rounded-lg">
          <button className="btn btn-error btn-xs btn-circle" onClick={onUpload}>
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      )}

      {onDelete && (
        <button
          className={`absolute ${buttonPosition} btn ${buttonSize} btn-circle`}
          onClick={onDelete}
          aria-label="Delete attachment"
        >
          <span className={`material-symbols-outlined ${iconSize}`}>close</span>
        </button>
      )}
    </div>
  );
};
