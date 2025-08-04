/**
 * Utility function through which you can update an entity in an array,
 *
 * - if the entity is not found, it returns the original array unchanged
 * - if the entity is found and updated, it returns a new array with the updated entity
 * - if the entity is found but not updated (updater returns `matchedEntity`), it returns the original array unchanged
 *
 * - `changed: boolean` indicates whether the array has changed or not - this is QOL enhancement, you
 * can compare returned array to the original one
 *
 */
export function updateEntityInArray<T>(_: {
  matcher: (entity: T) => boolean;
  entities: T[];
  updater: (currentEntity: T) => T;
}): { changed: boolean; entities: T[] };
export function updateEntityInArray<T>(_: {
  matcher: (entity: T) => boolean;
  entities: T[] | undefined;
  updater: (currentEntity: T) => T;
}): { changed: boolean; entities: T[] | undefined };
export function updateEntityInArray<T>({
  matcher,
  updater,
  entities,
}: {
  matcher: (entity: T) => boolean;
  entities: T[] | undefined;
  updater: (currentEntity: T) => T;
}) {
  if (!entities || !entities.length) {
    return { changed: false, entities };
  }

  const index = entities.findIndex(matcher);

  if (index === -1) {
    return { changed: false, entities };
  }

  const newEntity = updater(entities[index]);

  if (newEntity === entities[index]) {
    return { changed: false, entities };
  }

  const updatedEntities = [...entities];
  updatedEntities[index] = newEntity;

  return { changed: true, entities: updatedEntities };
}
