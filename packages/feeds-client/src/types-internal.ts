import type { WSEvent } from './gen/models';

export type UpdateStateResult<T> = T & {
  changed: boolean;
};

export type FromArray<T> = T extends Array<infer L> ? L : never;

export type EventPayload<T extends WSEvent['type']> = Extract<
  WSEvent,
  { type: T }
>;

export type PartializeAllBut<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & { [P in Exclude<keyof T, K>]?: T[P] };

export type CommonProps<A, B> = {
  [K in keyof A & keyof B]: A[K] & B[K];
};
