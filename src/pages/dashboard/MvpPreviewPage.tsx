/**
 * MvpPreviewPage — placeholder for non-MVP dashboard sections.
 *
 * Used by Knowledge Base, Team, and other "Coming Soon" pillars while
 * the MVP focuses on the 6 core surfaces (Dashboard, Releases, Campaigns,
 * Influencer Outreach, Analytics, Profile).
 *
 * Tells the user what's coming + invites them to text uP to get notified.
 */
import { motion } from 'framer-motion'
import { BookOpen, Users, Layout } from 'lucide-react'

type FeatureKey = 'Knowledge Base' | 'Team' | 'Content Studio'

const META: Record<FeatureKey, {
  Icon:    typeof BookOpen
  headline: string
  bullets:  string[]
}> = {
  'Knowledge Base': {
    Icon:     BookOpen,
    headline: 'The career playbook every indie artist wishes they had — soon, all in one place.',
    bullets: [
      'Release-week rollout templates (singles · EPs · albums)',
      'Curator pitch scripts that actually convert',
      'Meta ad creative frameworks for music',
      'Sync licensing 101 — how to get placed in TV + film',
      'Press release templates for every release type',
    ],
  },
  'Team': {
    Icon:     Users,
    headline: 'Bring your manager, producer, A&R, and label into one shared workspace.',
    bullets: [
      'Invite up to 5 collaborators to your Artist OS',
      'Each role sees what they need — clean dashboards by role',
      'Shared release calendar with real-time updates',
      'uP messages the whole team when things ship or break',
      'Single-account billing — no extra seats to manage',
    ],
  },
  'Content Studio': {
    Icon:     Layout,
    headline: 'AI-generated album art, social posts, and visualizers — coming soon.',
    bullets: [
      'Album art from a single prompt',
      'Square + 9:16 social posts auto-resized',
      'Lyric videos + visualizers in your aesthetic',
      'Press kit + EPK templates filled with your data',
      'All assets sync to your Asset Bank automatically',
    ],
  },
}

export function MvpPreviewPage({ feature }: { feature: FeatureKey }) {
  const { Icon, headline, bullets } = META[feature]

  return (
    <div className="min-h-full pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-8 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
            <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em]">
              Coming Soon
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">
            {feature}
          </h2>
          <p className="text-white/40 text-base font-medium max-w-2xl leading-relaxed">
            {headline}
          </p>
        </div>
      </div>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-[#FFD700]/15 bg-zinc-900/40 px-8 py-12 sm:py-16"
      >
        {/* soft gold glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[70%] h-64 blur-[100px] rounded-full bg-[#FFD700]/12 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 items-start">
          {/* Icon block */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center border mx-auto lg:mx-0"
            style={{
              background:  'rgba(255,215,0,0.08)',
              borderColor: 'rgba(255,215,0,0.25)',
            }}
          >
            <Icon size={32} className="text-[#FFD700]" />
          </div>

          {/* What's coming */}
          <div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              What's coming
            </p>
            <ul className="space-y-3 mb-8">
              {bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 + i * 0.04 }}
                  className="flex items-start gap-3 text-white/70 text-sm leading-relaxed"
                >
                  <span className="text-[#FFD700] mt-1 flex-shrink-0">●</span>
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950/60">
              <p className="text-white text-sm font-black uppercase tracking-wide mb-1">
                Want first access?
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                Text uP at <span className="text-[#FFD700] font-bold">+1 (310) 919-9037</span> with{' '}
                <span className="text-[#FFD700] font-bold">"{feature}"</span> and we'll DM you the moment it ships.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MvpPreviewPage
