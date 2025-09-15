import { WSEvent } from './gen/models';

export type UpdateStateResult<T> = T & {
  changed: boolean;
};

export type FromArray<T> = T extends Array<infer L> ? L : never;

export type EventPayload<T extends WSEvent['type']> = Extract<
  WSEvent,
  { type: T }
>;

export type PartializeAllBut<T, K extends keyof T> = Pick<T, K> & {
  [key in K]?: T[key];
};

export type CommonProps<A, B> = {
  [K in keyof A & keyof B]: A[K] & B[K]
};
