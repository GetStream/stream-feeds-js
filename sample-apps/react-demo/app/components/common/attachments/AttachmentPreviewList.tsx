import { useFeedsClient, type Attachment } from '@stream-io/feeds-react-sdk';
import { forwardRef, useCallback, useState, useEffect, useMemo, useRef, useImperativeHandle } from 'react';
import { AttachmentPreview } from './AttachmentPreview';
import { AttachmentUploadProgress } from './AttachmentUploadProgress';

type AttachmentState =
  | { status: 'uploading'; file: File; previewUrl: string; id: string }
  | { status: 'error'; file: File; previewUrl: string; error: Error; id: string }
  | { status: 'completed'; attachment: Attachment; id: string };

export type AttachmentPreviewListHandle = {
  uploadFiles: (files: File[]) => void;
  reset: () => void;
};

export type AttachmentPreviewListProps = {
  initialAttachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  onHasInFlightUploadsChange?: (hasUploads: boolean) => void;
  size?: 'small' | 'medium' | 'large';
};

export const AttachmentPreviewList = forwardRef<AttachmentPreviewListHandle, AttachmentPreviewListProps>(
  ({ initialAttachments = [], onAttachmentsChange, onHasInFlightUploadsChange, size = 'medium' }, ref) => {
    const client = useFeedsClient();
    const [attachmentStates, setAttachmentStates] = useState<AttachmentState[]>(
      initialAttachments.map((a) => ({
        status: 'completed' as const,
        attachment: a,
        id: crypto.randomUUID(),
      })),
    );

    useEffect(() => {
      setAttachmentStates(
        initialAttachments.map((a) => ({
          status: 'completed' as const,
          attachment: a,
          id: crypto.randomUUID(),
        })),
      );
    }, [initialAttachments]);

    const completedAttachments = useMemo(
      () =>
        attachmentStates
          .filter(
            (state): state is Extract<AttachmentState, { status: 'completed' }> =>
              state.status === 'completed',
          )
          .map((state) => state.attachment),
      [attachmentStates],
    );

    const prevCompletedRef = useRef<Attachment[]>(completedAttachments);
    useEffect(() => {
      if (prevCompletedRef.current !== completedAttachments) {
        prevCompletedRef.current = completedAttachments;
        onAttachmentsChange?.(completedAttachments);
      }
    }, [completedAttachments, onAttachmentsChange]);

    const hasInFlightUploads = attachmentStates.some((s) => s.status === 'uploading');
    const prevHasInFlightRef = useRef<boolean>(hasInFlightUploads);
    useEffect(() => {
      if (prevHasInFlightRef.current !== hasInFlightUploads) {
        prevHasInFlightRef.current = hasInFlightUploads;
        onHasInFlightUploadsChange?.(hasInFlightUploads);
      }
    }, [hasInFlightUploads, onHasInFlightUploadsChange]);

    const uploadFile = useCallback(
      async (file: File, fileId: string) => {
        if (!client) return;

        setAttachmentStates((prev) =>
          prev.map((state) => {
            if (state.id === fileId && state.status !== 'completed') {
              return { ...state, status: 'uploading' as const };
            }
            return state;
          }),
        );

        try {
          const fileType = file.type.startsWith('video/') ? 'video' : 'image';
          const uploadResponse = await (fileType === 'video'
            ? client.uploadFile({ file })
            : client.uploadImage({ file }));

          if (uploadResponse?.file) {
            const attachment: Attachment = {
              type: fileType,
              ...(fileType === 'image'
                ? { image_url: uploadResponse.file }
                : { asset_url: uploadResponse.file }),
              custom: {},
            };

            setAttachmentStates((prev) => {
              const updatedStates = prev.map((state) => {
                if (state.id === fileId) {
                  if (state.status !== 'completed') {
                    URL.revokeObjectURL(state.previewUrl);
                  }
                  return { status: 'completed' as const, attachment, id: fileId };
                }
                return state;
              });
              return updatedStates;
            });
          }
        } catch (error) {
          setAttachmentStates((prev) =>
            prev.map((state) =>
              state.id === fileId && state.status === 'uploading'
                ? { ...state, status: 'error' as const, error: error as Error }
                : state,
            ),
          );
        }
      },
      [client],
    );

    const uploadFiles = useCallback(
      (files: File[]) => {
        files.forEach((file) => {
          const fileId = crypto.randomUUID();
          const previewUrl = URL.createObjectURL(file);

          setAttachmentStates((prev) => [
            ...prev,
            {
              status: 'uploading' as const,
              file,
              previewUrl,
              id: fileId,
            },
          ]);

          void uploadFile(file, fileId);
        });
      },
      [uploadFile],
    );

    const reset = useCallback(() => {
      setAttachmentStates([]);
    }, []);

    useImperativeHandle(ref, () => ({ reset, uploadFiles }), [reset, uploadFiles]);

    const handleUpload = useCallback(
      (id: string) => {
        const state = attachmentStates.find((s) => s.id === id);
        if (state && (state.status === 'uploading' || state.status === 'error')) {
          void uploadFile(state.file, id);
        }
      },
      [attachmentStates, uploadFile],
    );

    const handleDelete = useCallback(
      (id: string) => {
        const state = attachmentStates.find((s) => s.id === id);

        if (state) {
          if (state.status !== 'completed') {
            URL.revokeObjectURL(state.previewUrl);
          } else {
            const attachment = state.attachment;
            if (attachment.type === 'image' && attachment.image_url) {
              void client?.deleteImage({ url: attachment.image_url });
            } else if (attachment.asset_url) {
              void client?.deleteFile({ url: attachment.asset_url });
            }
          }
        }

        setAttachmentStates((prev) => prev.filter((s) => s.id !== id));
      },
      [attachmentStates, client],
    );

    useEffect(() => {
      return () => {
        attachmentStates.forEach((state) => {
          if (state.status !== 'completed') {
            URL.revokeObjectURL(state.previewUrl);
          }
        });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only cleanup on unmount, not on attachmentStates changes

    if (attachmentStates.length === 0) {
      return null;
    }

    return (
      <div className="flex overflow-x-auto gap-2">
        {attachmentStates.map((state) => {
          if (state.status === 'completed') {
            return (
              <AttachmentPreview
                key={state.id}
                attachment={state.attachment}
                onDelete={() => handleDelete(state.id)}
                size={size}
              />
            );
          }
          return (
            <AttachmentUploadProgress
              key={state.id}
              file={state.file}
              status={state.status === 'error' ? 'error' : 'loading'}
              previewUrl={state.previewUrl}
              onUpload={() => handleUpload(state.id)}
              onDelete={() => handleDelete(state.id)}
              size={size}
            />
          );
        })}
      </div>
    );
  },
);

AttachmentPreviewList.displayName = 'AttachmentPreviewList';
