import { useCallback } from 'react';

export type FileUploadProps = {
  onFileSelected: (files: File[]) => void;
  className?: string;
  multiple?: boolean;
};

export const FileUpload = ({
  onFileSelected,
  className,
  multiple = false,
}: FileUploadProps) => {
  const fileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Emit files array to parent
      onFileSelected(Array.from(files));

      // Clear input to allow re-selecting same files
      e.target.value = '';
    },
    [onFileSelected],
  );

  return (
    <label className="cursor-pointer">
      <div className={className ?? 'btn btn-secondary'}>
        <span className="material-symbols-outlined">image</span>
      </div>
      <input
        type="file"
        accept="image/*,video/*"
        multiple={multiple}
        className="hidden"
        onChange={fileSelected}
      />
    </label>
  );
};
