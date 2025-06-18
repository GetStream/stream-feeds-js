import {
  CommonWSEvent,
  ConnectionChangedEvent,
} from './common/real-time/event-models';
import { NetworkChangedEvent } from './common/types';
import {
  ChannelMute,
  PrivacySettings,
  PrivacySettingsResponse,
  User,
  WSEvent,
} from './gen/models';

export type FeedsEvent =
  | WSEvent
  | CommonWSEvent
  | ConnectionChangedEvent
  | NetworkChangedEvent;

export type ActivityOrCommentId = string;

export interface Device {
  created_at: Date;

  id: string;

  push_provider: 'firebase' | 'apn' | 'huawei' | 'xiaomi';

  user_id: string;

  disabled?: boolean;

  disabled_reason?: string;

  push_provider_name?: string;

  voip?: boolean;
}

export interface UserMute {
  created_at: Date;

  updated_at: Date;

  expires?: Date;

  target?: User;

  user?: User;
}

export interface OwnUser {
  banned: boolean;

  created_at: Date;

  id: string;

  language: string;

  online: boolean;

  role: string;

  total_unread_count: number;

  unread_channels: number;

  unread_count: number;

  unread_threads: number;

  updated_at: Date;

  channel_mutes: ChannelMute[];

  devices: Device[];

  mutes: UserMute[];

  custom: Record<string, any>;

  deactivated_at?: Date;

  deleted_at?: Date;

  invisible?: boolean;

  last_active?: Date;

  last_engaged_at?: Date;

  blocked_user_ids?: string[];

  latest_hidden_channels?: string[];

  teams?: string[];

  privacy_settings?: PrivacySettings;

  push_preferences?: PushPreferences;
}

export interface PushPreferences {
  call_level?: string;

  chat_level?: string;

  disabled_until?: Date;
}

export interface UserResponsePrivacyFields {
  banned: boolean;
  created_at: Date;
  id: string;
  language: string;
  online: boolean;
  role: string;
  updated_at: Date;
  blocked_user_ids: string[];
  teams: string[];
  custom: Record<string, any>;
  deactivated_at?: Date;
  deleted_at?: Date;
  image?: string;
  invisible?: boolean;
  last_active?: Date;
  name?: string;
  revoke_tokens_issued_before?: Date;
  privacy_settings?: PrivacySettingsResponse;
  teams_role?: Record<string, string>;
}

export interface WSAuthMessage {
  token: string;

  user_details: ConnectUserDetailsRequest;

  products?: string[];
}

export interface ConnectUserDetailsRequest {
  id: string;

  image?: string;

  invisible?: boolean;

  language?: string;

  name?: string;

  custom?: Record<string, any>;

  privacy_settings?: PrivacySettingsResponse;
}
