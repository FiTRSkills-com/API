export interface VideoInterview {
  unique_name: string;
  date_updated: Date;
  media_region: null;
  max_participant_duration: number;
  duration: number;
  video_codecs: null;
  large_room: null;
  enable_turn: boolean;
  empty_room_timeout: number;
  sid: string;
  type: string;
  status_callback_method: string;
  status: string;
  audio_only: boolean;
  unused_room_timeout: number;
  max_participants: number;
  max_concurrent_published_tracks: number;
  url: string;
  record_participants_on_connect: boolean;
  account_sid: string;
  end_time: Date;
  date_created: Date;
  status_callback: null;
  links: Links;
}

export interface Links {
  recordings: string;
  participants: string;
  recording_rules: string;
}
