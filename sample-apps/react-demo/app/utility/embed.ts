/** Namespace for every postMessage the demo sends to (or accepts from) an embedding page. */
export const EMBED_MESSAGE_SOURCE = 'stream-feeds-demo';

/**
 * Sent once the demo user is seeded, before the client connects. Passed back
 * as `?session=`, it resumes that user.
 */
export interface EmbedSessionMessage {
  source: typeof EMBED_MESSAGE_SOURCE;
  type: 'session';
  session: string;
}

/** Sent once the home page renders real content in place of its loading skeleton. */
export interface EmbedReadyMessage {
  source: typeof EMBED_MESSAGE_SOURCE;
  type: 'ready';
}

/** Sent by the host; answered by re-sending `session` and, once sent, `ready`. */
export interface EmbedReadyQueryMessage {
  source: typeof EMBED_MESSAGE_SOURCE;
  type: 'ready?';
}

export type EmbedMessage =
  | EmbedSessionMessage
  | EmbedReadyMessage
  | EmbedReadyQueryMessage;

export function isEmbedMessage(data: unknown): data is EmbedMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { source?: unknown }).source === EMBED_MESSAGE_SOURCE
  );
}

export function isEmbedded(): boolean {
  return typeof window !== 'undefined' && window.parent !== window;
}

export function isFromHost(event: MessageEvent): boolean {
  return event.source === window.parent;
}

/**
 * Target origin `'*'`: any origin may embed the demo, and a page only ever
 * receives a session for a user it created or already held.
 */
export function postToHost(message: EmbedMessage) {
  window.parent.postMessage(message, '*');
}
