import { ActivityResponse, useFeedContext } from '@stream-io/feeds-react-sdk';
import { useState, useEffect, useCallback } from 'react';

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
  const [progress, setProgress] = useState(0);

  const currentStory = activities[currentIndex];
  const totalStories = activities.length;

  useEffect(() => {
    const activity = activities[currentIndex];
    if (!activity.is_watched) {
      void feed?.markActivity({ mark_watched: [activity.id] });
    }
  }, [currentIndex, feed, activities]);

  const STORY_DURATION = 5000; // 5 seconds per story

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

  // Auto-advance to next story
  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= STORY_DURATION) {
        clearInterval(interval);
        goToNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, goToNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {activities.map((_, index) => (
          <div
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            key={index}
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index === currentIndex
                    ? `${progress}%`
                    : index < currentIndex
                      ? '100%'
                      : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-2 right-2 flex items-center gap-3 z-10 mt-4">
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-lg font-semibold">
            <span>{currentStory?.user?.name?.[0]}</span>
          </div>
        </div>
        <div className="flex-1 text-white">
          <div className="font-semibold text-sm drop-shadow-lg">
            {currentStory?.user?.name}
          </div>
          <div className="text-xs opacity-80 drop-shadow-lg">
            {currentStory?.created_at?.toLocaleString()}
          </div>
        </div>
      </div>

      <button
        className="absolute top-4 right-2 z-10 w-10 h-10 flex items-center justify-center text-white text-3xl font-light hover:bg-white/10 rounded-full transition-colors mt-4"
        onClick={onClose}
      >
        ×
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
          <img
            src={currentStory?.attachments?.[0]?.image_url}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
