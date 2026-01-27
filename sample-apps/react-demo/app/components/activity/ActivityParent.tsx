import { type ActivityResponse } from "@stream-io/feeds-react-sdk";
import { Activity } from "./Activity";

export const ActivityParent = ({ activity }: { activity: ActivityResponse }) => {
  return (
    <>
      {
        activity.parent && (
          <div className="w-full min-w-0 max-w-full">
            <div className="text-xs text-base-content/60 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[0.75rem]">repeat</span>
              <span>Reposted</span>
            </div>
            <div className="border border-base-300 rounded-lg p-3 bg-base-200/50 hover:bg-base-200 transition-colors cursor-pointer mb-2"><Activity activity={activity.parent} location="preview" /></div>
          </div>
        )
      }
    </>
  );
};