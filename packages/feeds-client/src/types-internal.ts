export type UpdateStateResult<T> = T & {
  changed: boolean;
};
