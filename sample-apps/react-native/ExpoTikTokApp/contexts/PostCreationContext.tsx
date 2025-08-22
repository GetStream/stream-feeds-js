import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Place } from '@/components/search/PlaceSearchDropdown';
import type { Attachment } from '@stream-io/feeds-react-native-sdk';
import { useActivityActionState } from '@/hooks/useActivityActionState';

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
}: PropsWithChildren<Pick<PostCreationContextValue, 'location' | 'media'>>) => {
  const { editingActivity } = useActivityActionState();

  // we derive the location as best we can
  // TODO: Find a better way to do/map this.
  const derivedLocation = useMemo(
    () =>
      editingActivity?.location
        ? {
            latitude: editingActivity.location.lat,
            longitude: editingActivity.location.lng,
            name: editingActivity.custom?.locationName,
            address: 'No address available',
            id: '',
          }
        : undefined,
    [editingActivity],
  );

  const [location, setLocation] = useState<Place | undefined>(derivedLocation);
  const [media, setMedia] = useState<Attachment[] | undefined>(
    editingActivity?.attachments,
  );
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
