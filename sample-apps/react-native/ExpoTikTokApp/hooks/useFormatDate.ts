import { useMemo } from 'react';

export const useFormatDate = ({ date }: { date: Date }) => {
  return useMemo(() => `${date.getMonth()}-${date.getDate()}`, [date]);
};
