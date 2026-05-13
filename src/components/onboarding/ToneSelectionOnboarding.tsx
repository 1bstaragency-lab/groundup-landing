import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import type { ArtistTone } from '../../types/auth.types';
import { LiquidButton } from '../ui/liquid-glass-button';

const TONES: { value: ArtistTone; label: string; description: string; example: string }[] = [
  {
    value: 'Professional',
    label: 'Professional',
    description: 'Polished, industry-standard communication.',
    example: '"We are pleased to announce the release of our forthcoming project, available on all streaming platforms."',
  },
  {
    value: 'Conversational',
    label: 'Conversational',
    description: 'Warm and direct — like talking to a fan.',
    example: '"Hey, the new project drops Friday — been working on this for a while and I cannot wait for you to hear it."',
  },
  {
    value: 'Direct',
    label: 'Direct',
    description: 'Short. Sharp. No fluff.',
    example: '"New music. Friday. Be ready."',
  },
  {
    value: 'Analytical',
    label: 'Analytical',
    description: 'Data-driven, strategic insights.',
    example: '"Streaming velocity is up 34% this quarter. Targeting editorial playlisting for the next release cycle."',
  },
  {
    value: 'Strategic',
    label: 'Strategic',
    description: 'Big-picture thinking. Long game.',
    example: '"Each release is a touchpoint in a 12-month brand building arc. This single anchors the Q3 push."',
  },
];

interface ToneSelectionOnboardingProps {
  onComplete: (tone: ArtistTone) => void;
  loading?: boolean;
}

export function ToneSelectionOnboarding({ onComplete, loading: saving = false }: ToneSelectionOnboardingProps) {
  const [selected, setSelected] = useState<ArtistTone | null>(null);
  const [hovered, setHovered] = useState<ArtistTone | null>(null);

  const preview = TONES.find(t => t.value === (hovered ?? selected));

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
          <Sparkles className="text-[#FFD700]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
          Your Voice
        </h2>
        <p className="text-white/40 text-base font-medium max-w-sm">
          Choose how uP communicates on your behalf. You can change this anytime.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {TONES.map(tone => (
          <button
            key={tone.value}
            onClick={() => setSelected(tone.value)}
            onMouseEnter={() => setHovered(tone.value)}
            onMouseLeave={() => setHovered(null)}
            className={`w-full p-5 rounded-[2rem] border transition-all duration-300 text-left flex items-center justify-between group ${
              selected === tone.value
                ? 'bg-[#FFD700] border-transparent text-black'
                : 'bg-zinc-900/40 border-white/5 text-white/40 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <div>
              <p className={`font-black text-[11px] uppercase tracking-widest mb-0.5 ${selected === tone.value ? 'text-black' : ''}`}>
                {tone.label}
              </p>
              <p className={`text-[10px] font-medium ${selected === tone.value ? 'text-black/60' : 'text-white/20'}`}>
                {tone.description}
              </p>
            </div>
            {selected === tone.value && <Sparkles size={16} className="text-black shrink-0 ml-4" />}
          </button>
        ))}
      </div>

      {preview && (
        <motion.div
          key={preview.value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-xl"
        >
          <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] mb-3">
            {preview.label} Example
          </p>
          <p className="text-white/60 text-sm font-medium leading-relaxed italic">
            {preview.example}
          </p>
        </motion.div>
      )}

      <LiquidButton
        disabled={!selected || saving}
        onClick={() => selected && onComplete(selected)}
        className="w-full"
      >
        {saving ? (
          <span className="flex items-center gap-2 justify-center">
            <Loader2 size={14} className="animate-spin" /> Saving...
          </span>
        ) : (
          'Launch My OS'
        )}
      </LiquidButton>
    </motion.div>
  );
}
