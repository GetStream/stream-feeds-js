import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Place } from '@/components/PlaceSearchDropdown';

type PostCreationContextValue = {
  location?: Place | null;
  setLocation?: (location: Place | null) => void;
};

const PostCreationContext = createContext<PostCreationContextValue>({
  location: null
});

export const PostCreationContextProvider = ({
  children,
}: PropsWithChildren<PostCreationContextValue>) => {
  const [location, setLocation] = useState<Place | null>(null);
  const contextValue = useMemo(() => ({ location, setLocation }), [location]);
  return (
    <PostCreationContext.Provider value={contextValue}>
      {children}
    </PostCreationContext.Provider>
  );
};

export const usePostCreationContext = () => useContext(PostCreationContext);
