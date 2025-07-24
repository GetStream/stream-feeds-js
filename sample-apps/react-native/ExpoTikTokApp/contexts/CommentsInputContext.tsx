import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { CommentParent } from '@stream-io/feeds-react-native-sdk';

type CommentsInputContextValue = {
  editingEntity?: CommentParent;
  parent?: CommentParent;
};

type CommentsInputActionsContextValue = {
  setEditingEntity: React.Dispatch<
    React.SetStateAction<CommentParent | undefined>
  >;
  setParent: React.Dispatch<React.SetStateAction<CommentParent | undefined>>;
};

const CommentsInputContext = createContext<CommentsInputContextValue>({});

const CommentsInputActionsContext =
  createContext<CommentsInputActionsContextValue>({
    setEditingEntity: () => {},
    setParent: () => {},
  });

export const CommentsInputContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [editingEntity, setEditingEntity] = useState<CommentParent>();
  const [parent, setParent] = useState<CommentParent>();

  const inputContextValue = useMemo(
    () => ({ editingEntity, parent }),
    [editingEntity, parent],
  );
  const inputActionsContextValue = useMemo(
    () => ({ setEditingEntity, setParent }),
    [],
  );
  return (
    <CommentsInputActionsContext value={inputActionsContextValue}>
      <CommentsInputContext.Provider value={inputContextValue}>
        {children}
      </CommentsInputContext.Provider>
    </CommentsInputActionsContext>
  );
};

export const useCommentsInputContext = () => useContext(CommentsInputContext);

export const useCommentsInputActionsContext = () => useContext(CommentsInputActionsContext);
