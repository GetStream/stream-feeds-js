import type { Feed } from '../..';
import type {
  ActivityResponse,
  AggregatedActivityResponse,
  GetOrCreateFeedRequest,
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';
import { filterAggregatedActivities } from '../../activity-filter';
import { addAggregatedActivitiesToState } from '../add-aggregated-activities-to-state';

export const updateNotificationStatus = (
  newNotificationStatus?: NotificationStatusResponse,
  currentNotificationStatus?: NotificationStatusResponse,
) => {
  if (!newNotificationStatus && !currentNotificationStatus) {
    return {
      changed: false,
      notification_status: undefined,
    };
  } else if (!newNotificationStatus) {
    return {
      changed: false,
      notification_status: currentNotificationStatus,
    };
  } else {
    return {
      changed: true,
      notification_status: {
        ...newNotificationStatus,
      },
    };
  }
};

const countGroupsWithFlag = (
  groups: AggregatedActivityResponse[],
  flag: 'is_read' | 'is_seen',
  value: boolean,
) => groups.reduce((n, g) => (g[flag] === value ? n + 1 : n), 0);

export const updateNotificationFeedFromEvent = (
  event: NotificationFeedUpdatedEvent,
  currentAggregatedActivities?: AggregatedActivityResponse[],
  currentNotificationStatus?: NotificationStatusResponse,
  currentActivities?: ActivityResponse[],
  requestConfig?: GetOrCreateFeedRequest,
): UpdateStateResult<{
  data?: {
    notification_status?: NotificationStatusResponse;
    aggregated_activities?: AggregatedActivityResponse[];
    activities?: ActivityResponse[];
  };
}> => {
  const updates: {
    notification_status?: NotificationStatusResponse;
    aggregated_activities?: AggregatedActivityResponse[];
    activities?: ActivityResponse[];
  } = {};

  // Determine effective notification status (prefer new from event, fall back to current)
  const effectiveStatus =
    event.notification_status ?? currentNotificationStatus;
  const lastReadAt = effectiveStatus?.last_read_at;
  const lastSeenAt = effectiveStatus?.last_seen_at;
  const readActivities = effectiveStatus?.read_activities ?? [];
  const seenActivities = effectiveStatus?.seen_activities ?? [];

  // For flat feeds — update currentActivities with is_read/is_seen
  if (currentActivities?.length && effectiveStatus) {
    let anyChanged = false;
    const updatedActivities = currentActivities.map((activity) => {
      const isRead =
        (lastReadAt != null &&
          activity.updated_at.getTime() < lastReadAt.getTime()) ||
        readActivities.includes(activity.id);
      const isSeen =
        (lastSeenAt != null &&
          activity.updated_at.getTime() < lastSeenAt.getTime()) ||
        seenActivities.includes(activity.id);
      if (activity.is_read !== isRead || activity.is_seen !== isSeen) {
        anyChanged = true;
        return { ...activity, is_read: isRead, is_seen: isSeen };
      }
      return activity;
    });
    if (anyChanged) {
      updates.activities = updatedActivities;
    }
  }

  // For aggregated feeds — update aggregated_activities with is_read/is_seen
  if (currentAggregatedActivities?.length && effectiveStatus) {
    const baseAggregated = currentAggregatedActivities;
    let anyChanged = false;
    const updatedAggregated = baseAggregated.map((group) => {
      const isRead =
        (lastReadAt != null &&
          group.updated_at.getTime() < lastReadAt.getTime()) ||
        readActivities.includes(group.group);
      const isSeen =
        (lastSeenAt != null &&
          group.updated_at.getTime() < lastSeenAt.getTime()) ||
        seenActivities.includes(group.group);
      if (group.is_read !== isRead || group.is_seen !== isSeen) {
        anyChanged = true;
        return { ...group, is_read: isRead, is_seen: isSeen };
      }
      return group;
    });
    if (anyChanged) {
      updates.aggregated_activities = updatedAggregated;
    }
  }

  if (event.aggregated_activities && currentAggregatedActivities) {
    const filteredAggregated = filterAggregatedActivities(
      event.aggregated_activities,
      requestConfig,
    );
    const aggregatedActivitiesResult = addAggregatedActivitiesToState(
      filteredAggregated,
      updates.aggregated_activities ?? currentAggregatedActivities,
      'replace-then-start',
    );

    if (aggregatedActivitiesResult.changed) {
      updates.aggregated_activities =
        aggregatedActivitiesResult.aggregated_activities;
    }
  }

  // Update notification_status. For filtered aggregated feeds, derive unread/unseen
  // by delta from aggregated_activities changes — the server's counts are computed
  // across all groups regardless of client-side filtering.
  if (event.notification_status) {
    const filter = requestConfig?.filter;
    const hasFilter =
      !!filter && typeof filter === 'object' && Object.keys(filter).length > 0;
    const isAggregatedFeed = currentAggregatedActivities !== undefined;

    if (hasFilter && isAggregatedFeed && currentNotificationStatus) {
      const finalAggregated =
        updates.aggregated_activities ?? currentAggregatedActivities ?? [];
      const before = currentAggregatedActivities ?? [];

      const eventUnread = event.notification_status.unread;
      const eventUnseen = event.notification_status.unseen;

      // Server-side 0 → filtered count is also 0 (filtering can only remove groups).
      const unread =
        eventUnread === 0
          ? 0
          : Math.max(
              0,
              currentNotificationStatus.unread +
                (countGroupsWithFlag(finalAggregated, 'is_read', false) -
                  countGroupsWithFlag(before, 'is_read', false)),
            );
      const unseen =
        eventUnseen === 0
          ? 0
          : Math.max(
              0,
              currentNotificationStatus.unseen +
                (countGroupsWithFlag(finalAggregated, 'is_seen', false) -
                  countGroupsWithFlag(before, 'is_seen', false)),
            );

      updates.notification_status = {
        ...event.notification_status,
        unread,
        unseen,
      };
    } else {
      const notificationStatusResult = updateNotificationStatus(
        event.notification_status,
        currentNotificationStatus,
      );

      if (notificationStatusResult.changed) {
        updates.notification_status =
          notificationStatusResult.notification_status;
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    return {
      changed: true,
      data: updates,
    };
  }

  return {
    changed: false,
  };
};

export function handleNotificationFeedUpdated(
  this: Feed,
  event: EventPayload<'feeds.notification_feed.updated'>,
) {
  const result = updateNotificationFeedFromEvent(
    event,
    this.currentState.aggregated_activities,
    this.currentState.notification_status,
    this.currentState.activities,
    this.currentState.last_get_or_create_request_config,
  );
  if (result.changed) {
    this.state.partialNext({
      notification_status: result.data?.notification_status,
      aggregated_activities:
        result.data?.aggregated_activities ??
        this.currentState.aggregated_activities,
      activities: result.data?.activities ?? this.currentState.activities,
    });
  }
}
