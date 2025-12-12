import type { FeedResponse } from '../gen/models';

export const ownFeedFields: (keyof Pick<
  FeedResponse,
  'own_capabilities' | 'own_follows' | 'own_membership'
>)[] = ['own_capabilities', 'own_follows', 'own_membership'];
