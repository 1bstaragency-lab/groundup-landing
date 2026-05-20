import { motion } from 'framer-motion'
import { ListMusic, Music2, ArrowRight } from 'lucide-react'

export function CuratorSection() {
  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase">Curator</h2>
            <span className="px-2.5 py-1 rounded-full bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
              Coming Soon
            </span>
          </div>
          <p className="text-white/40 font-medium text-base leading-relaxed">
            Pair your songs to the right playlists and grow your streams through placement — not luck.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/8 rounded-2xl px-5 py-3 shrink-0">
          <Music2 size={16} className="text-[#1DB954]" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Powered by Spotify</span>
        </div>
      </div>

      {/* Coming soon panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-zinc-900/60 to-zinc-900/40 overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-purple-400 to-violet-600" />

        <div className="p-10 sm:p-14 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-3xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <ListMusic size={36} className="text-violet-400" />
            </div>
            <div className="absolute -top-2 -right-3 px-2.5 py-1 rounded-full bg-violet-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
              In Development
            </div>
          </div>

          {/* Headline */}
          <h3 className="text-white font-black text-3xl lg:text-4xl tracking-tighter uppercase mb-4">
            Playlist Curator
          </h3>

          {/* Description */}
          <p className="text-white/50 text-base font-medium leading-relaxed max-w-lg mb-10">
            Drop any song from your catalog — or an existing release — and we'll match it to real,
            active playlists that already play your sound. Then pitch directly to those curators
            and grow your streams through placement, not luck.
          </p>

          {/* How it will work */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            {[
              {
                step: '01',
                icon: '🎵',
                title: 'Pick a song',
                desc: 'Choose any track from your catalog or paste a Spotify link.',
              },
              {
                step: '02',
                icon: '📋',
                title: 'We find the playlists',
                desc: "We match your sound to real playlists that are already playing artists like you.",
              },
              {
                step: '03',
                icon: '📈',
                title: 'Pitch & get placed',
                desc: 'Send direct pitches to active curators and watch your stream count grow.',
              },
            ].map(f => (
              <div key={f.step} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-left relative overflow-hidden">
                <p className="absolute top-4 right-4 text-white/6 font-black text-4xl leading-none select-none">{f.step}</p>
                <p className="text-2xl mb-3">{f.icon}</p>
                <p className="text-white font-black text-[12px] uppercase tracking-widest leading-none mb-2">{f.title}</p>
                <p className="text-white/35 text-[11px] font-medium leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Arrow flow hint */}
          <div className="flex items-center gap-3 mb-10 text-white/20">
            <span className="text-[11px] font-black uppercase tracking-widest">Your song</span>
            <ArrowRight size={14} />
            <span className="text-[11px] font-black uppercase tracking-widest">Matching playlists</span>
            <ArrowRight size={14} />
            <span className="text-[11px] font-black uppercase tracking-widest">Curator pitch</span>
            <ArrowRight size={14} />
            <span className="text-[11px] font-black uppercase tracking-widest text-violet-400/70">More streams</span>
          </div>

          <p className="text-violet-400/50 text-[10px] font-black uppercase tracking-widest">
            This feature is in development — check back soon
          </p>
        </div>
      </motion.div>
    </div>
  )
}
