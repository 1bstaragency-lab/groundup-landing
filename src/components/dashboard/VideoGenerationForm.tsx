import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Loader2, Upload, X } from 'lucide-react';
import type { VideoConcept, VideoStyle, VideoDuration, GenerateVideoParams } from '../../types/videoGeneration.types';

interface Props {
  onGenerate: (params: GenerateVideoParams) => Promise<void>;
  loading: boolean;
  configured: boolean;
}

const CONCEPTS: VideoConcept[]   = ['Visualizer', 'Lyric Video', 'Teaser', 'Short Clip', 'Music Video Concept'];
const STYLES: VideoStyle[]       = ['Minimal', 'Cinematic', 'Abstract', 'Colorful', 'Dark', 'Neon'];
const DURATIONS: VideoDuration[] = ['15s', '30s', '60s', '90s'];

export default function VideoGenerationForm({ onGenerate, loading, configured }: Props) {
  const [description, setDescription]   = useState('');
  const [concept, setConcept]           = useState<VideoConcept>('Visualizer');
  const [style, setStyle]               = useState<VideoStyle>('Cinematic');
  const [duration, setDuration]         = useState<VideoDuration>('30s');
  const [refImage, setRefImage]         = useState<string | undefined>();
  const [refFileName, setRefFileName]   = useState('');
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
    onGenerate({ description, concept, style, duration, reference_image_url: refImage });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!configured && (
        <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl p-4 text-xs text-[#FFD700]/80">
          Running in demo mode — add <code className="font-mono">VITE_RUNWAY_API_KEY</code> to .env to generate real videos.
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          Describe Your Video
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Slow motion golden petals falling past a silhouette, warm sunset light, emotional and cinematic..."
          rows={3}
          className="w-full bg-zinc-900/60 border border-white/8 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/30 transition-colors resize-none"
          required
        />
      </div>

      {/* Concept */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Concept</label>
        <div className="flex flex-wrap gap-2">
          {CONCEPTS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setConcept(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                concept === c
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
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

      {/* Duration */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Duration</label>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                duration === d
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
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

      <motion.button
        type="submit"
        disabled={loading || !description.trim()}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-[#FFD700] text-black font-black tracking-widest uppercase py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors text-sm"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating (this can take a few minutes)...
          </>
        ) : (
          <>
            <Video size={16} />
            Generate Video
          </>
        )}
      </motion.button>
    </form>
  );
}
