export interface SpotifyArtist {
  id: string;
  name: string;
  image_url: string | null;
  followers: number;
  popularity: number; // 0–100
  genres: string[];
  spotify_url: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  follower_count: number;
  track_count: number;
  curator: string;
  spotify_url: string;
}

export interface CuratorResult {
  input_artist: SpotifyArtist;
  similar_artists: SpotifyArtist[];
  recommended_playlists: SpotifyPlaylist[];
}
