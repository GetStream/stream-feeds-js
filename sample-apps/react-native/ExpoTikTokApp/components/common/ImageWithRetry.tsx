import type { FastImageProps } from 'react-native-fast-image';
import FastImage from 'react-native-fast-image';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useState } from 'react';
import { generateUUID } from '@/utils/generateUUID';

export const ImageWithRetry = (props: FastImageProps) => {
  const { onError, ...restProps } = props;
  const [retries, setRetries] = useState(0);

  const [uuid] = useState(() => generateUUID());

  const retry = useStableCallback(() => {
    if (onError) {
      onError();
    }
    setRetries((prevRetries) => prevRetries + 1);
  });

  return (
    <FastImage key={`${uuid}_${retries}`} onError={retry} {...restProps} />
  );
};
