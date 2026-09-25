'use client';

import { useEffect } from 'react';
import {
  EMBED_MESSAGE_SOURCE,
  isEmbedMessage,
  isEmbedded,
  isFromHost,
  postToHost,
} from '../../utility/embed';

/** Posts the `session` message once mounted, and again on `ready?`. */
export const EmbedSession = ({ userId }: { userId: string }) => {
  useEffect(() => {
    if (!isEmbedded()) return;

    let session: string | undefined;
    const controller = new AbortController();

    const announce = () => {
      if (session) {
        postToHost({ source: EMBED_MESSAGE_SOURCE, type: 'session', session });
      }
    };

    fetch(`/api/session?user_id=${encodeURIComponent(userId)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session request failed');
        return res.json();
      })
      .then((data: { session: string }) => {
        session = data.session;
        announce();
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Could not issue embed session:', err);
        }
      });

    const handleMessage = (event: MessageEvent) => {
      if (
        isFromHost(event) &&
        isEmbedMessage(event.data) &&
        event.data.type === 'ready?'
      ) {
        announce();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      controller.abort();
      window.removeEventListener('message', handleMessage);
    };
  }, [userId]);

  return null;
};
