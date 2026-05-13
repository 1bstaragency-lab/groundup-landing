import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ExternalLink, Users, Music, List } from 'lucide-react';
import { curateForArtist, spotifyConfigured } from '../../lib/services/spotifyService';
import type { CuratorResult } from '../../types/playlist.types';

export default function PlaylistCurator() {
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<CuratorResult | null>(null);
  const [error, setError]     = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await curateForArtist(input.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function formatFollowers(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  return (
    <div className="space-y-6">
      {!spotifyConfigured && (
        <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl p-4 text-xs text-[#FFD700]/80">
          Running in demo mode — add <code className="font-mono">VITE_SPOTIFY_CLIENT_ID</code> + <code className="font-mono">VITE_SPOTIFY_CLIENT_SECRET</code> to .env for live data.
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Artist name or Spotify URL..."
            className="w-full bg-zinc-900/60 border border-white/8 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30 transition-colors"
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading || !input.trim()}
          whileTap={{ scale: 0.97 }}
          className="bg-[#FFD700] text-black font-black tracking-widest uppercase px-6 rounded-2xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-xs hover:bg-yellow-300 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
        </motion.button>
      </form>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Input artist card */}
            <div className="flex items-center gap-4 bg-zinc-900/60 border border-[#FFD700]/20 rounded-2xl p-4">
              {result.input_artist.image_url ? (
                <img
                  src={result.input_artist.image_url}
                  alt={result.input_artist.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Music size={24} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-lg leading-tight">{result.input_artist.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {result.input_artist.genres.slice(0, 3).map(g => (
                    <span key={g} className="bg-zinc-800 text-gray-400 text-[10px] rounded-full px-2 py-0.5">{g}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#FFD700] font-black text-lg">{formatFollowers(result.input_artist.followers)}</p>
                <p className="text-gray-500 text-[10px]">followers</p>
                <p className="text-gray-400 text-xs mt-0.5">Pop: {result.input_artist.popularity}/100</p>
              </div>
            </div>

            {/* Similar artists */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Similar Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {result.similar_artists.map((artist, i) => (
                  <motion.a
                    key={artist.id}
                    href={artist.spotify_url !== '#' ? artist.spotify_url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-zinc-900/60 border border-white/8 rounded-xl p-3 flex items-center gap-3 hover:border-[#FFD700]/20 transition-colors cursor-pointer"
                  >
                    {artist.image_url ? (
                      <img
                        src={artist.image_url}
                        alt={artist.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        <Music size={16} className="text-gray-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#FFD700] transition-colors">{artist.name}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Users size={9} />
                        {formatFollowers(artist.followers)}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Recommended playlists */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Target Playlists</h3>
              <div className="space-y-3">
                {result.recommended_playlists.map((pl, i) => (
                  <motion.a
                    key={pl.id}
                    href={pl.spotify_url !== '#' ? pl.spotify_url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex items-center gap-4 bg-zinc-900/60 border border-white/8 rounded-xl p-3 hover:border-[#FFD700]/20 transition-colors"
                  >
                    {pl.image_url ? (
                      <img src={pl.image_url} alt={pl.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        <List size={18} className="text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors truncate">{pl.name}</p>
                      {pl.description && (
                        <p className="text-[11px] text-gray-500 truncate">{pl.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-600">
                        <span className="flex items-center gap-1"><Users size={9} /> {formatFollowers(pl.follower_count)}</span>
                        <span className="flex items-center gap-1"><Music size={9} /> {pl.track_count} tracks</span>
                        <span>by {pl.curator}</span>
                      </div>
                    </div>
                    <ExternalLink size={13} className="text-gray-600 group-hover:text-[#FFD700] transition-colors shrink-0" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
