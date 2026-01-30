import { useEffect, useRef } from 'react';

export const buildImageUrl = (
  baseUrl: string | undefined | null,
  width: number,
  height: number,
): string | null => {
  if (!baseUrl) return null;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}w=${width}&h=${height}`;
};

export const useImagePreloader = (urls: Array<string | undefined | null>) => {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    urls.forEach((url) => {
      if (url && !preloadedRef.current.has(url)) {
        const img = new Image();
        img.src = url;
        preloadedRef.current.add(url);
      }
    });
  }, [urls]);
};
