import { type ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActivityHeader } from './ActivityHeader';
import { ActivityInteractions } from './activity-interactions/ActivityInteractions';
import { ActivityContent } from './ActivityContent';
import { NavLink } from '../utility/NavLink';

const ParentActivityPreview = ({ parent }: { parent: ActivityResponse }) => {
  return (
    <NavLink href={`/activity/${parent.id}`}>
      <div className="border border-base-300 rounded-lg p-3 bg-base-200/50 hover:bg-base-200 transition-colors cursor-pointer mb-2">
        <div className="flex items-center gap-2 mb-1">
          {parent.user.image && (
            <img
              src={parent.user.image}
              alt={parent.user.name || parent.user.id}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span className="text-xs font-medium text-base-content/80">
            {parent.user.name || parent.user.id}
          </span>
        </div>
        {parent.text && (
          <p className="text-sm text-base-content/70 line-clamp-2">{parent.text}</p>
        )}
        {!parent.text && parent.attachments.length > 0 && (
          <p className="text-sm text-base-content/50 italic">Media attachment</p>
        )}
      </div>
    </NavLink>
  );
};

export const Activity = ({
  activity,
  location,
}: {
  activity: ActivityResponse;
  location: 'timeline' | 'profile' | 'foryou' | 'preview' | 'search';
}) => {
  const showParentPreview = activity.parent && location !== 'preview';

  return (
    <div className="w-full flex flex-col items-start gap-4">
      <ActivityHeader
        activity={activity}
        withFollowButton={location === 'foryou'}
        withLink={location === 'timeline' || location === 'profile' || location === 'search'}
        withActions={location === 'timeline' || location === 'profile'}
      />
      <ActivityContent activity={activity} />
      {showParentPreview && activity.parent && (
        <div className="w-full">
          <div className="text-xs text-base-content/60 mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.75rem]">repeat</span>
            <span>Reposted</span>
          </div>
          <ParentActivityPreview parent={activity.parent} />
        </div>
      )}
      {location !== 'preview' && <ActivityInteractions activity={activity} />}
    </div>
  );
};
