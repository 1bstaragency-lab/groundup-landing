// ─────────────────────────────────────────────────────────────────────────────
// SPOTIFY / PLAYLIST CURATOR SERVICE
//
// SETUP (free — no payment required):
//   1. Go to https://developer.spotify.com/dashboard
//   2. Create an app (any name, any redirect URI)
//   3. Copy Client ID and Client Secret
//   4. Add to .env:
//        VITE_SPOTIFY_CLIENT_ID=your_client_id
//        VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
//
// NOTE: These credentials are exposed in the browser bundle.
//   For production, move the token fetch to a serverless function.
//   The Client Credentials flow only accesses public data (no user data),
//   so the risk is low — worst case someone uses your quota.
//
// When credentials are missing, returns rich mock data so the UI
// works end-to-end immediately.
// ─────────────────────────────────────────────────────────────────────────────

import type { SpotifyArtist, SpotifyPlaylist, CuratorResult } from '../../types/playlist.types';

const CLIENT_ID     = import.meta.env.VITE_SPOTIFY_CLIENT_ID     || '';
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';

export const spotifyConfigured = !!(CLIENT_ID && CLIENT_SECRET);

// ── Token cache ────────────────────────────────────────────────────────────
let cachedToken = '';
let tokenExpiry  = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Spotify auth error: ${res.status}`);
  const { access_token, expires_in } = await res.json();
  cachedToken = access_token;
  tokenExpiry  = Date.now() + (expires_in - 60) * 1000;
  return cachedToken;
}

// ── Artist lookup ──────────────────────────────────────────────────────────
// Accepts a full Spotify URL or just the artist name
export async function resolveArtist(input: string): Promise<SpotifyArtist> {
  const token = await getAccessToken();

  // Extract artist ID from URL if provided
  const urlMatch = input.match(/artist\/([A-Za-z0-9]+)/);
  if (urlMatch) {
    const res = await fetch(`https://api.spotify.com/v1/artists/${urlMatch[1]}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Artist not found`);
    return mapArtist(await res.json());
  }

  // Otherwise search by name
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(input)}&type=artist&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Search failed`);
  const data = await res.json();
  const artist = data.artists?.items?.[0];
  if (!artist) throw new Error(`No artist found for "${input}"`);
  return mapArtist(artist);
}

// ── Similar artists ────────────────────────────────────────────────────────
export async function getSimilarArtists(artistId: string): Promise<SpotifyArtist[]> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Related artists error: ${res.status}`);
  const { artists } = await res.json();
  return (artists as any[]).slice(0, 8).map(mapArtist);
}

// ── Playlist search ────────────────────────────────────────────────────────
// Search for playlists associated with a genre/artist name
export async function findPlaylists(query: string): Promise<SpotifyPlaylist[]> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=6`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Playlist search error: ${res.status}`);
  const data = await res.json();
  return (data.playlists?.items as any[])
    .filter(Boolean)
    .slice(0, 6)
    .map(mapPlaylist);
}

// ── Main curator function ──────────────────────────────────────────────────
export async function curateForArtist(input: string): Promise<CuratorResult> {
  if (!spotifyConfigured) return mockCurate(input);

  const inputArtist   = await resolveArtist(input);
  const similarArtists = await getSimilarArtists(inputArtist.id);

  // Use genres from input artist + first similar artist for playlist search
  const genreQuery = [...inputArtist.genres, ...similarArtists[0]?.genres ?? []]
    .slice(0, 3)
    .join(' ');
  const searchQuery = genreQuery || inputArtist.name;
  const playlists   = await findPlaylists(searchQuery);

  return { input_artist: inputArtist, similar_artists: similarArtists, recommended_playlists: playlists };
}

// ── Mappers ────────────────────────────────────────────────────────────────
function mapArtist(a: any): SpotifyArtist {
  return {
    id:          a.id,
    name:        a.name,
    image_url:   a.images?.[0]?.url ?? null,
    followers:   a.followers?.total ?? 0,
    popularity:  a.popularity ?? 0,
    genres:      a.genres ?? [],
    spotify_url: a.external_urls?.spotify ?? '',
  };
}

function mapPlaylist(p: any): SpotifyPlaylist {
  return {
    id:             p.id,
    name:           p.name,
    description:    p.description ?? '',
    image_url:      p.images?.[0]?.url ?? null,
    follower_count: p.followers?.total ?? 0,
    track_count:    p.tracks?.total ?? 0,
    curator:        p.owner?.display_name ?? 'Spotify',
    spotify_url:    p.external_urls?.spotify ?? '',
  };
}

// ── Mock data ──────────────────────────────────────────────────────────────
function mockCurate(input: string): CuratorResult {
  const inputArtist: SpotifyArtist = {
    id: 'mock-input',
    name: input || 'Your Artist',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop',
    followers: 124500,
    popularity: 62,
    genres: ['indie r&b', 'alternative hip-hop', 'neo soul'],
    spotify_url: '#',
  };

  const similar_artists: SpotifyArtist[] = [
    { id: 'm1', name: 'Sampha', image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&auto=format&fit=crop', followers: 890000, popularity: 71, genres: ['indie r&b'], spotify_url: '#' },
    { id: 'm2', name: 'Blood Orange', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop', followers: 640000, popularity: 68, genres: ['indie pop', 'r&b'], spotify_url: '#' },
    { id: 'm3', name: 'Syd', image_url: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=200&auto=format&fit=crop', followers: 1200000, popularity: 74, genres: ['r&b', 'neo soul'], spotify_url: '#' },
    { id: 'm4', name: 'Steve Lacy', image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&auto=format&fit=crop', followers: 5400000, popularity: 88, genres: ['indie r&b', 'funk'], spotify_url: '#' },
    { id: 'm5', name: 'Cautious Clay', image_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&auto=format&fit=crop', followers: 320000, popularity: 65, genres: ['indie r&b', 'folk soul'], spotify_url: '#' },
    { id: 'm6', name: 'MAVI', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop', followers: 180000, popularity: 58, genres: ['underground hip-hop'], spotify_url: '#' },
  ];

  const recommended_playlists: SpotifyPlaylist[] = [
    { id: 'p1', name: 'Fresh Finds: R&B', description: 'New sounds from underground R&B and soul', image_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&auto=format&fit=crop', follower_count: 148000, track_count: 50, curator: 'Spotify', spotify_url: '#' },
    { id: 'p2', name: 'Butter', description: 'Smooth R&B for a chill vibe', image_url: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=200&auto=format&fit=crop', follower_count: 3200000, track_count: 80, curator: 'Spotify', spotify_url: '#' },
    { id: 'p3', name: 'Late Night R&B', description: 'Silky sounds for the after hours', image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&auto=format&fit=crop', follower_count: 920000, track_count: 100, curator: 'Spotify', spotify_url: '#' },
    { id: 'p4', name: 'Indie Pop Rising', description: 'Today\'s best in indie pop and alternative', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop', follower_count: 540000, track_count: 60, curator: 'Digster', spotify_url: '#' },
    { id: 'p5', name: 'Soul Alive', description: 'Modern soul and neo-soul essentials', image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop', follower_count: 210000, track_count: 45, curator: 'Topsify', spotify_url: '#' },
    { id: 'p6', name: 'lofi hip hop beats', description: 'Relax / study / sleep', image_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&auto=format&fit=crop', follower_count: 8900000, track_count: 200, curator: 'lofi girl', spotify_url: '#' },
  ];

  return { input_artist: inputArtist, similar_artists, recommended_playlists };
}
