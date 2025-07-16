import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { useVideoPlayer, VideoPlayer } from 'expo-video';

type VideoPlayerContextValue = {
  player: VideoPlayer
};

const VideoPlayerContext = createContext<VideoPlayerContextValue>({});

export const VideoPlayerContextProvider = ({ children }: PropsWithChildren) => {
  const player = useVideoPlayer('https://frankfurt.stream-io-cdn.com/1364594/attachments/cbe91118-5b14-416a-a372-7307376f54f0.273883_small-E5B85661-D04F-461F-81DC-15.mp4?Expires=1753907468&Signature=T48xKwui86TXszm-U6IiPuGLcEUdyGzu2z1lzQK6gV6qCtcRp23hnsBMsCDRIGeWtLp4U4QtSXk7n6CXjgMNygOJn9dERF8nOlDQa32tuQZMHJ-CfiYLset4WyQDCAkpHbGIwGMYf~~O6gyFCmPG-SWl3RA7L4M3fhxDa9VSjzJ07i9lHSFuaIslU-79j9wZkbd017-0GmnURVT~MRXRO~w9fR9QGglCHWIbK3mQh3WG7BlBVlW3VKGMUSo8bkFXV2orLY72MBoz7L4vzdr3RtiW9wyLZqfLkFExoDMFkV3Vy3DdUj4wcvk6-BhUe7ciTFMqBZb7SnJj3jxrrAsPFA__&Key-Pair-Id=APKAIHG36VEWPDULE23Q');
  const ctx = useMemo(() => ({ player }), [player]);
  return (
    <VideoPlayerContext.Provider
      value={ctx}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayerContext = () => useContext(VideoPlayerContext);
