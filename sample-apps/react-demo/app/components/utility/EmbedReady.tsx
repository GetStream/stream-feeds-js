'use client';

import { useEffect } from 'react';
import {
  EMBED_MESSAGE_SOURCE,
  isEmbedMessage,
  isEmbedded,
  isFromHost,
  postToHost,
} from '../../utility/embed';

/** Once per page load, across remounts. */
let announced = false;

/**
 * Posts the `ready` message on mount, and again on `ready?`. Mount it where
 * real content renders in place of a loading skeleton.
 */
export const EmbedReady = () => {
  useEffect(() => {
    if (!isEmbedded()) return;

    if (!announced) {
      announced = true;
      announce();
    }

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
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
};

function announce() {
  postToHost({ source: EMBED_MESSAGE_SOURCE, type: 'ready' });
}
