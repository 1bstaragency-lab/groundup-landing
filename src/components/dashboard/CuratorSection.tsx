import { Music2 } from "lucide-react"
import PlaylistCurator from "./PlaylistCurator"

export function CuratorSection() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-3 uppercase">Curator</h2>
          <p className="text-white/40 font-medium text-base leading-relaxed">
            Find your sonic neighbors — discover similar artists and the playlists that feature them.
            Get a map of curators to pitch your next release to.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/8 rounded-2xl px-5 py-3">
          <Music2 size={16} className="text-[#FFD700]" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Powered by Spotify</span>
        </div>
      </div>

      <PlaylistCurator />
    </div>
  )
}
