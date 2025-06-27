'use client';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

export type AppNotificationType = 'info' | 'success' | 'warning' | 'error';

export type AppNotificaion = {
  message: string;
  type: AppNotificationType;
  hide: () => void;
  action?: {
    label: string;
    onClick?: () => void;
  };
};

type AppNotificationsContextValue = {
  notifications: AppNotificaion[];
  showNotification: (
    notification: Omit<AppNotificaion, 'hide'>,
    options?: {
      hideTimeout?: number;
    },
  ) => AppNotificaion;
  resetNotifications: () => void;
};

const AppNotificationsContext = createContext<AppNotificationsContextValue>({
  notifications: [],
  showNotification: () => ({ message: '', type: 'info', hide: () => {} }),
  resetNotifications: () => {},
});

export const AppNotificationsContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<AppNotificaion[]>([]);
  const [timeouts, setTimeouts] = useState<
    Array<ReturnType<typeof setTimeout>>
  >([]);

  const showNotification = (
    notification: Omit<AppNotificaion, 'hide'>,
    options?: {
      hideTimeout?: number;
    },
  ) => {
    const appNotficiation = { ...notification, hide: () => {} };
    const hide = () => {
      const updatedNotifications = [...notifications];
      const index = updatedNotifications.indexOf(appNotficiation);
      if (index !== -1) {
        updatedNotifications.splice(index, 1);
      }
      setNotifications(updatedNotifications);
    };
    appNotficiation.hide = hide;
    if (options?.hideTimeout) {
      const timeout = setTimeout(() => {
        hide();
        const updatedTimeouts = [...timeouts];
        const index = updatedTimeouts.indexOf(timeout);
        if (index !== -1) {
          updatedTimeouts.splice(index, 1);
        }
        setTimeouts(updatedTimeouts);
      }, 10000);
      setTimeouts([...timeouts, timeout]);
    }
    setNotifications([...notifications, appNotficiation]);

    return appNotficiation;
  };

  const resetNotifications = () => {
    notifications.forEach((n) => n.hide());
    timeouts.forEach((t) => clearTimeout(t));
    setTimeouts([]);
  };

  return (
    <AppNotificationsContext.Provider
      value={{ notifications, showNotification, resetNotifications }}
    >
      {children}
    </AppNotificationsContext.Provider>
  );
};

export const useAppNotificationsContext = () =>
  useContext(AppNotificationsContext);
