export type ImageStyle =
  | 'Album Art'
  | 'Social Post'
  | 'Thumbnail'
  | 'Promotional'
  | 'Release Cover';

export type ImageMood =
  | 'Energetic'
  | 'Dark'
  | 'Vibrant'
  | 'Minimal'
  | 'Cinematic'
  | 'Psychedelic';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4';

export interface GeneratedImage {
  id: string;
  user_id: string;
  description: string;
  style: ImageStyle;
  mood: ImageMood;
  aspect_ratio: AspectRatio;
  image_url: string;
  prompt_used: string;
  created_at: string;
}

export interface GenerateImageParams {
  description: string;
  style: ImageStyle;
  mood: ImageMood;
  aspect_ratio: AspectRatio;
  use_brand_colors: boolean;
}
