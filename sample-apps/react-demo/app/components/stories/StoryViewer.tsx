import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useFeedContext } from '@stream-io/feeds-react-sdk';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar } from '../utility/Avatar';
import { formatDistanceToNow } from 'date-fns';

const IMAGE_DURATION = 5000; // 5 seconds per image story

export const StoryViewer = ({
  activities,
  onClose,
}: {
  activities: ActivityResponse[];
  onClose: () => void;
}) => {
  const feed = useFeedContext();
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(
      activities.findIndex((a) => !a.is_watched),
      0,
    ),
  );
  const [duration, setDuration] = useState(IMAGE_DURATION);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = activities[currentIndex];
  const totalStories = activities.length;

  const isVideo = currentStory?.attachments?.[0]?.type === 'video';
  const mediaUrl = isVideo
    ? currentStory?.attachments?.[0]?.asset_url
    : currentStory?.attachments?.[0]?.image_url;

  useEffect(() => {
    const activity = activities[currentIndex];
    if (!activity.is_watched) {
      void feed?.markActivity({ mark_watched: [activity.id] });
    }
  }, [currentIndex, feed, activities]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  }, [currentIndex, totalStories, onClose]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleVideoLoaded = useCallback(() => {
    setDuration((videoRef.current?.duration ?? 0) * 1000);
    videoRef.current?.play();
  }, []);

  // Auto-advance to next story (only for images)
  useEffect(() => {
    if (isVideo) return;

    setDuration(IMAGE_DURATION);
    const timeout = setTimeout(() => {
      goToNext();
    }, IMAGE_DURATION);

    return () => clearTimeout(timeout);
  }, [currentIndex, isVideo, goToNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {activities.map((_, index) => (
          <div
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            key={index}
          >
            {index === currentIndex ? (
              <div key={currentIndex}
                className="h-full bg-white animate-progress"
                style={
                  {
                    '--progress-duration': `${duration}ms`,
                  } as React.CSSProperties
                }
              />
            ) : (
              <div
                className="h-full bg-white"
                style={{ width: index < currentIndex ? '100%' : '0%' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-2 right-2 flex items-center gap-3 z-10 mt-4">
        <Avatar user={currentStory?.user} className="size-15 md:size-18" />
        <div className="flex-1 text-white">
          <div className="font-semibold text-sm drop-shadow-lg">
            {currentStory?.user?.name}
          </div>
          <div className="text-xs opacity-80 drop-shadow-lg">
            {formatDistanceToNow(currentStory?.created_at, { addSuffix: true })}
          </div>
        </div>
      </div>

      <button
        className="absolute cursor-pointer top-4 right-2 z-10 w-10 h-10 flex items-center justify-center text-white text-3xl font-light hover:bg-white/10 rounded-full transition-colors mt-4"
        onClick={onClose}
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="relative w-full h-full max-w-md mx-auto">
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer active:bg-black/10"
          onClick={goToPrevious}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer active:bg-black/10"
          onClick={goToNext}
        />

        <div className="w-full h-full flex items-center justify-center p-2">
          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="max-w-full max-h-full object-contain rounded-lg"
              autoPlay
              playsInline
              muted
              onEnded={goToNext}
              onLoadedMetadata={handleVideoLoaded}
            />
          ) : (
            <img
              src={mediaUrl}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};
