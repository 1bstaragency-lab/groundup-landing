export type VideoConcept =
  | 'Visualizer'
  | 'Lyric Video'
  | 'Teaser'
  | 'Short Clip'
  | 'Music Video Concept';

export type VideoStyle =
  | 'Minimal'
  | 'Cinematic'
  | 'Abstract'
  | 'Colorful'
  | 'Dark'
  | 'Neon';

export type VideoDuration = '15s' | '30s' | '60s' | '90s';

export type VideoStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface GeneratedVideo {
  id: string;
  user_id: string;
  concept: VideoConcept;
  style: VideoStyle;
  duration: VideoDuration;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  prompt_used: string;
  status: VideoStatus;
  created_at: string;
}

export interface GenerateVideoParams {
  description: string;
  concept: VideoConcept;
  style: VideoStyle;
  duration: VideoDuration;
  reference_image_url?: string;
}
