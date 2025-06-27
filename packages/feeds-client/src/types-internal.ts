export type UpdateStateResult<T> = T & {
  changed: boolean;
};

export type FromArray<T> = T extends Array<infer L> ? L : never;
