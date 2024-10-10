import { CommonApi } from './gen/common/CommonApi';
import { ModerationClient } from './ModerationClient';

export class StreamClient extends CommonApi {
  moderation: ModerationClient;

  constructor() {
    super();
    this.moderation = new ModerationClient();
  }
}
