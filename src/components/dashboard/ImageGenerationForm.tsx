import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Upload, X } from 'lucide-react';
import type { ImageStyle, ImageMood, AspectRatio, GenerateImageParams } from '../../types/imageGeneration.types';

interface Props {
  onGenerate: (params: GenerateImageParams) => Promise<void>;
  loading: boolean;
  configured: boolean;
}

const STYLES: ImageStyle[]  = ['Album Art', 'Social Post', 'Thumbnail', 'Promotional', 'Release Cover'];
const MOODS: ImageMood[]    = ['Energetic', 'Dark', 'Vibrant', 'Minimal', 'Cinematic', 'Psychedelic'];
const RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '3:4'];

export default function ImageGenerationForm({ onGenerate, loading, configured }: Props) {
  const [description, setDescription]     = useState('');
  const [style, setStyle]                 = useState<ImageStyle>('Album Art');
  const [mood, setMood]                   = useState<ImageMood>('Vibrant');
  const [aspectRatio, setAspectRatio]     = useState<AspectRatio>('1:1');
  const [useBrandColors, setUseBrandColors] = useState(false);
  const [refImage, setRefImage]           = useState<string | undefined>();
  const [refFileName, setRefFileName]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRefFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setRefImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    onGenerate({
      description,
      style,
      mood,
      aspect_ratio: aspectRatio,
      use_brand_colors: useBrandColors,
      reference_image_url: refImage,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!configured && (
        <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl p-4 text-xs text-[#FFD700]/80">
          Running in demo mode — add <code className="font-mono">VITE_FAL_API_KEY</code> to .env to generate real images.
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          Describe Your Image
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A lone figure standing under neon lights in a rainy alley, moody cinematic feel..."
          rows={3}
          className="w-full bg-zinc-900/60 border border-white/8 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30 transition-colors resize-none"
          required
        />
      </div>

      {/* Reference image */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          Reference Image <span className="normal-case font-normal text-gray-600">(optional)</span>
        </label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {refImage ? (
          <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/8 rounded-xl p-3">
            <img src={refImage} alt="reference" className="w-12 h-12 rounded-lg object-cover" />
            <span className="text-sm text-gray-300 flex-1 truncate">{refFileName}</span>
            <button
              type="button"
              onClick={() => { setRefImage(undefined); setRefFileName(''); }}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/15 rounded-xl py-4 flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-white/30 hover:text-gray-300 transition-all"
          >
            <Upload size={14} />
            Upload reference image
          </button>
        )}
      </div>

      {/* Style */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Style</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                style === s
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Mood</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                mood === m
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Aspect Ratio</label>
        <div className="flex gap-2">
          {RATIOS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setAspectRatio(r)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === r
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Brand colors toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setUseBrandColors(v => !v)}
          className={`w-10 h-5 rounded-full transition-colors relative ${useBrandColors ? 'bg-[#FFD700]' : 'bg-zinc-700'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${useBrandColors ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-xs text-gray-400">Use brand colors</span>
      </label>

      <motion.button
        type="submit"
        disabled={loading || !description.trim()}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-[#FFD700] text-black font-black tracking-widest uppercase py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors text-sm"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Image
          </>
        )}
      </motion.button>
    </form>
  );
}
