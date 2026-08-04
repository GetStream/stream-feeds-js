import type { BookmarkResponse } from '../../../gen/models';

/**
 * Options shared by the bookmark handlers that need to know where a bookmark used to
 * live before the change they are applying.
 */
export type BookmarkUpdateOptions = {
  /**
   * The folder the bookmark was in *before* the update. `updateBookmark` can move a
   * bookmark between folders, and the payload only carries the new folder, so the
   * bookmark cannot be located in state by identity alone. The HTTP call site knows the
   * previous folder from the request (`folder_id`); WS events do not carry it.
   */
  previousFolderId?: string;
};

/**
 * A bookmark's stable identity. The same user can bookmark the same activity once per
 * folder, so user + activity + folder is what identifies a single bookmark.
 *
 * `updated_at` is deliberately *not* part of the identity. It changes on every update,
 * so including it would make an out-of-order payload (an HTTP response and a WS
 * broadcast for the same change can arrive in either order, and either can be delayed
 * past a subsequent change) look like a different bookmark — which is how duplicates and
 * undeletable bookmarks end up in state. Use {@link isStaleBookmark} to compare
 * freshness instead.
 */
export const isSameBookmark = (
  bookmark1: BookmarkResponse,
  bookmark2: BookmarkResponse,
): boolean =>
  bookmark1.user.id === bookmark2.user.id &&
  bookmark1.activity.id === bookmark2.activity.id &&
  bookmark1.folder?.id === bookmark2.folder?.id;

/**
 * True when `bookmark` carries nothing newer than `comparedTo`.
 *
 * Equal timestamps count as stale on purpose: the HTTP response and the WS broadcast of
 * the same change carry the same `updated_at`, so whichever arrives second must be a
 * no-op.
 */
export const isStaleBookmark = (
  bookmark: BookmarkResponse,
  comparedTo: BookmarkResponse,
): boolean => bookmark.updated_at.getTime() <= comparedTo.updated_at.getTime();

/**
 * Index of `bookmark` in `ownBookmarks` by identity, or -1.
 */
export const findBookmarkIndex = (
  ownBookmarks: BookmarkResponse[],
  bookmark: BookmarkResponse,
): number => ownBookmarks.findIndex((b) => isSameBookmark(b, bookmark));

const isSameBookmarkIgnoringFolder = (
  bookmark1: BookmarkResponse,
  bookmark2: BookmarkResponse,
): boolean =>
  bookmark1.user.id === bookmark2.user.id &&
  bookmark1.activity.id === bookmark2.activity.id;

/**
 * Index of the entry an *update* applies to, or -1. Unlike {@link findBookmarkIndex}
 * this tolerates the bookmark having moved folders, which changes its identity:
 *
 * 1. identity match — the folder did not change, or the update was already applied;
 * 2. the folder the caller says it moved out of (HTTP path only);
 * 3. the only bookmark this user holds for the activity — WS events carry no previous
 *    folder, and with a single candidate a move is the only thing it can be. With
 *    several candidates the move is ambiguous, so nothing is touched.
 */
export const findBookmarkIndexForUpdate = (
  ownBookmarks: BookmarkResponse[],
  bookmark: BookmarkResponse,
  options?: BookmarkUpdateOptions,
): number => {
  const byIdentity = findBookmarkIndex(ownBookmarks, bookmark);

  if (byIdentity !== -1) {
    return byIdentity;
  }

  if (options) {
    const byPreviousFolder = ownBookmarks.findIndex(
      (b) =>
        isSameBookmarkIgnoringFolder(b, bookmark) &&
        b.folder?.id === options.previousFolderId,
    );

    if (byPreviousFolder !== -1) {
      return byPreviousFolder;
    }
  }

  const candidates = ownBookmarks.reduce<number[]>((acc, b, index) => {
    if (isSameBookmarkIgnoringFolder(b, bookmark)) {
      acc.push(index);
    }
    return acc;
  }, []);

  return candidates.length === 1 ? candidates[0] : -1;
};
