'use client';

import { useClientConnectedUser, useWsConnectionState } from '@stream-io/feeds-react-sdk';

export const ConnectionAlert = () => {
  const { is_healthy } = useWsConnectionState();
  const connectedUser = useClientConnectedUser();

  if (is_healthy !== false || !connectedUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2">
      <div role="alert" className="alert alert-warning shadow-lg max-w-md">
        <span className="material-symbols-outlined">warning</span>
        <span>Offline, reconnecting...</span>
      </div>
    </div>
  );
};
