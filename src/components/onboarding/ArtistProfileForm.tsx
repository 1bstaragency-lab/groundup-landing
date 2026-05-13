import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Music, Loader2 } from 'lucide-react';
import { LiquidButton } from '../ui/liquid-glass-button';

const GENRES = [
  'Hip-Hop / Rap', 'R&B / Soul', 'Pop', 'Electronic / EDM',
  'Afrobeats', 'Latin', 'Rock / Alternative', 'Jazz / Neo-Soul', 'Other'
];

interface ArtistProfileFormProps {
  initialName?: string;
  onComplete: (data: { artistName: string; genre: string; bio: string }) => void;
}

export function ArtistProfileForm({ initialName = '', onComplete }: ArtistProfileFormProps) {
  const [formData, setFormData] = useState({ artistName: initialName, genre: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData.genre) {
      setError('Please select your genre.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    onComplete(formData);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#FFD700]/20">
          <Music className="text-[#FFD700]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
          Your Artist Profile
        </h2>
        <p className="text-white/40 text-base font-medium max-w-sm">
          Help uP personalize your OS. This takes 30 seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Artist Name"
          required
          value={formData.artistName}
          onChange={e => setFormData({ ...formData, artistName: e.target.value })}
          className="wait-input"
        />

        <div className="grid grid-cols-3 gap-2">
          {GENRES.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => { setFormData({ ...formData, genre }); setError(null); }}
              className={`p-3 rounded-2xl border text-left text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                formData.genre === genre
                  ? 'bg-[#FFD700] border-transparent text-black'
                  : 'bg-zinc-900/40 border-white/5 text-white/40 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Short bio — who are you and what are you building? (optional)"
          rows={3}
          value={formData.bio}
          onChange={e => setFormData({ ...formData, bio: e.target.value })}
          className="wait-input resize-none"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-xs font-bold uppercase tracking-widest text-center"
          >
            {error}
          </motion.p>
        )}

        <div className="pt-4">
          <LiquidButton type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 size={14} className="animate-spin" /> Saving...
              </span>
            ) : (
              'Continue'
            )}
          </LiquidButton>
        </div>
      </form>
    </motion.div>
  );
}
