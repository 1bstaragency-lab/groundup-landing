import { useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Loader2 } from 'lucide-react';
import type { ArtistTone } from '../../types/auth.types';
import { LiquidButton } from '../ui/liquid-glass-button';

const RELATIONSHIPS: { value: ArtistTone; label: string; emoji: string; description: string; example: string }[] = [
  {
    value: 'Assistant Manager',
    label: 'Assistant Manager',
    emoji: '🤝',
    description: 'Professional. On top of it. Handles business so you stay creative.',
    example: '"Your pre-save campaign goes live Thursday. I\'ve drafted the pitch for the editorial team and lined up three playlist targets. Want me to send?"',
  },
  {
    value: 'Your Boy',
    label: 'Your Boy',
    emoji: '👊',
    description: 'Real talk, no filter. Like your homie who happens to know everything about the industry.',
    example: '"Yo the rollout looking fire but you\'re slipping on the pre-save. We got like 4 days bro — let\'s lock it in tonight."',
  },
  {
    value: 'Label Rep',
    label: 'Label Rep',
    emoji: '🏢',
    description: 'Corporate energy, industry lens. Metrics, targets, pipeline.',
    example: '"Q3 streaming velocity is underperforming by 18%. Recommend front-loading TikTok content this week ahead of the editorial submission window."',
  },
  {
    value: 'Road Manager',
    label: 'Road Manager',
    emoji: '🚌',
    description: 'Logistics first. Keeps the wheels turning behind the scenes.',
    example: '"Soundcheck is 4 PM. Contract for the Nov 14th show still needs your signature. And the merch order needs to ship by Friday."',
  },
  {
    value: 'Creative Partner',
    label: 'Creative Partner',
    emoji: '🎨',
    description: 'Collaborative. Pushes your vision. In it for the art first.',
    example: '"The bridge on track 3 hits different — I think this is the single. Let\'s build the whole visual concept around that moment."',
  },
];

interface ToneSelectionOnboardingProps {
  onComplete: (tone: ArtistTone) => void;
  loading?: boolean;
}

export function ToneSelectionOnboarding({ onComplete, loading: saving = false }: ToneSelectionOnboardingProps) {
  const [selected, setSelected] = useState<ArtistTone | null>(null);
  const [hovered, setHovered] = useState<ArtistTone | null>(null);

  const preview = RELATIONSHIPS.find(r => r.value === (hovered ?? selected));

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
          <Handshake className="text-[#FFD700]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
          How We Roll
        </h2>
        <p className="text-white/40 text-base font-medium max-w-sm">
          How should uP treat you? Pick the relationship — you can switch it up anytime.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {RELATIONSHIPS.map(rel => (
          <button
            key={rel.value}
            onClick={() => setSelected(rel.value)}
            onMouseEnter={() => setHovered(rel.value)}
            onMouseLeave={() => setHovered(null)}
            className={`w-full p-5 rounded-[2rem] border transition-all duration-300 text-left flex items-center justify-between group ${
              selected === rel.value
                ? 'bg-[#FFD700] border-transparent text-black'
                : 'bg-zinc-900/40 border-white/5 text-white/40 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl leading-none">{rel.emoji}</span>
              <div>
                <p className={`font-black text-[11px] uppercase tracking-widest mb-0.5 ${selected === rel.value ? 'text-black' : ''}`}>
                  {rel.label}
                </p>
                <p className={`text-[10px] font-medium ${selected === rel.value ? 'text-black/60' : 'text-white/20'}`}>
                  {rel.description}
                </p>
              </div>
            </div>
            {selected === rel.value && (
              <span className="text-black text-lg shrink-0 ml-4">✓</span>
            )}
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
            {preview.emoji} uP as your {preview.label}
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
