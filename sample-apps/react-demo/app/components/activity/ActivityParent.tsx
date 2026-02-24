import { type ActivityResponse } from "@stream-io/feeds-react-sdk";
import { Activity } from "./Activity";

export const ActivityParent = ({ activity }: { activity: ActivityResponse }) => {
  return (
    <>
      {
        activity.parent && (
          <div className="w-full min-w-0 max-w-full border border-base-content/10 rounded-xl bg-base-200/30 hover:bg-base-200/60 transition-colors cursor-pointer mb-2 overflow-hidden p-4 flex flex-col gap-3">
            <div className="text-[13px] text-base-content/70 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]!">repeat</span>
              <span>Reposted</span>
            </div>
            <Activity activity={activity.parent} location="preview" />
          </div>
        )
      }
    </>
  );
};