export type UtagMethod = 'view' | 'link' | 'track';

export interface TealiumData {
  [key: string]: any;
}

export interface TealiumEvent extends TealiumData {
  _method?: UtagMethod;
  _ts?: string;
}

export interface TealiumTrack {
  view: (data: TealiumData) => void;
  link: (data: TealiumData) => void;
  track: (data: TealiumData) => void;
}