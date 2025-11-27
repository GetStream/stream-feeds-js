import { useState } from 'react';

type Action = 'null';

export const FeedMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [enabledActions] = useState<Action[]>([]);
  const actionMapping: {
    [key in Action]: { label: string; icon: string; handler: () => void };
  } = {
    null: {
      label: '',
      icon: '',
      handler: function (): void {
        throw new Error('Function not implemented.');
      },
    },
  };

  if (enabledActions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          className="text-gray-400 flex"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
        <div
          className={`absolute rounded-md right-0 w-48 bg-white shadow-lg flex flex-col items-stretch ${isMenuOpen ? '' : 'hidden'}`}
        >
          {enabledActions.map((a) => (
            <button
              key={a}
              className="text-gray-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
              onClick={() => {
                actionMapping[a].handler();
                setIsMenuOpen(false);
              }}
            >
              <span className="material-symbols-outlined">
                {actionMapping[a].icon}
              </span>
              <div>{actionMapping[a].label}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
