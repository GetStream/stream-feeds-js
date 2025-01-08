'use client';
import React from 'react';
import {
  AppNotificationType,
  useAppNotificationsContext,
} from '../app-notifications-context';

const AppNotifications = () => {
  const backgroundColors: { [key in AppNotificationType]: string } = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const { notifications } = useAppNotificationsContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 w-full items-center flex flex-col gap-3">
      {notifications.map((n, i) => (
        <div
          key={`app-notification-${i}`}
          className={`p-4 rounded w-fit shadow-lg text-white ${
            backgroundColors[n.type]
          }`}
        >
          <span>{n.message}</span>
        </div>
      ))}
    </div>
  );
};

export default AppNotifications;
