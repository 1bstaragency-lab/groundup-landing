"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Music2, CheckCircle2 } from "lucide-react"

interface EarlyAccessPopupProps {
  open: boolean
  artistName?: string
  onClose: () => void
}

const STREAM_ITEMS = [
  "Rollout Tools", "Influencer Networks", "Playlist Curators", "Blog Networks",
  "Show Promoters", "Radio Pluggers", "Press Outlets", "Sync Agencies",
  "Editorial Contacts", "Booking Agents", "Brand Partnerships", "DSP Promo",
]

function GoldMetallicCard({ artistName }: { artistName?: string }) {
  return (
    <div className="relative w-full max-w-[320px] h-[190px] mx-auto rounded-3xl overflow-hidden select-none"
      style={{
        background: "linear-gradient(135deg, #5a4a00 0%, #FFD700 25%, #fffbe0 45%, #B8860B 60%, #FFD700 75%, #5a4a00 100%)",
        backgroundSize: "200% 200%",
        animation: "goldShimmer 3s ease infinite",
        boxShadow: "0 30px 80px rgba(255,215,0,0.4), 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <style>{`@keyframes goldShimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }`}</style>
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
      {/* Holographic lines */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)", backgroundSize: "100% 8px" }}
      />
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-black/60 text-[9px] font-black uppercase tracking-[0.3em]">GrounduP</p>
            <p className="text-black font-black text-lg uppercase tracking-tighter leading-none mt-0.5">Early Access</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center">
            <Music2 size={18} className="text-black/60" />
          </div>
        </div>
        <div>
          <p className="text-black/50 text-[9px] font-black uppercase tracking-widest mb-1">Artist</p>
          <p className="text-black font-black text-xl tracking-tight uppercase truncate">{artistName ?? "Artist"}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-black/50 text-[9px] font-black uppercase tracking-widest">Member Since 2025</p>
            <p className="text-black/70 text-[9px] font-black uppercase tracking-widest">&#10022; Founding</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardStream() {
  return (
    <div className="relative w-full overflow-hidden h-16 mt-4">
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
      <motion.div
        className="flex gap-3 w-max h-full items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      >
        {[...STREAM_ITEMS, ...STREAM_ITEMS].map((item, i) => (
          <div key={i} className="shrink-0 px-4 py-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 text-[11px] font-bold text-[#FFD700]/70 whitespace-nowrap">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function EarlyAccessPopup({ open, artistName, onClose }: EarlyAccessPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md bg-zinc-950 border border-[#FFD700]/20 rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(255,215,0,0.15)]"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#FFD700]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Your Card Has Been Issued</span>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Gold card */}
            <div className="px-6 py-6">
              <GoldMetallicCard artistName={artistName} />
            </div>

            {/* Perks */}
            <div className="px-6 pb-4 space-y-2">
              {["Priority access to all GrounduP features", "Founding member badge", "Direct line to uP — your iMessage manager"].map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#FFD700] shrink-0" />
                  <span className="text-white/50 text-xs font-bold">{perk}</span>
                </div>
              ))}
            </div>

            {/* Stream machine */}
            <div className="border-t border-white/5 pb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 px-6 pt-4 mb-1">Unlocking</p>
              <CardStream />
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[#FFD700] text-black font-black text-sm uppercase tracking-widest hover:bg-[#FFD700]/90 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
              >
                Enter the OS &rarr;
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
