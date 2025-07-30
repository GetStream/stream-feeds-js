import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Place } from '@/components/PlaceSearchDropdown';
import type { Attachment } from '@stream-io/feeds-react-native-sdk';

type PostCreationContextValue = {
  location?: Place;
  media?: Attachment[];
  setLocation: React.Dispatch<React.SetStateAction<Place | undefined>>;
  setMedia: React.Dispatch<React.SetStateAction<Attachment[] | undefined>>;
};

const PostCreationContext = createContext<PostCreationContextValue>({
  setLocation: () => {},
  setMedia: () => {},
});

export const PostCreationContextProvider = ({
  children,
}: PropsWithChildren<PostCreationContextValue>) => {
  const [location, setLocation] = useState<Place | undefined>();
  const [media, setMedia] = useState<Attachment[] | undefined>();
  const contextValue = useMemo(
    () => ({ location, media, setLocation, setMedia }),
    [media, location],
  );
  return (
    <PostCreationContext.Provider value={contextValue}>
      {children}
    </PostCreationContext.Provider>
  );
};

export const usePostCreationContext = () => useContext(PostCreationContext);
