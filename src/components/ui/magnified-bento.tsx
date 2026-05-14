"use client"

import { useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Music2, Share2, Bookmark, Image, Headphones,
  Rocket, MessageSquare, FileText, Radio, BarChart2,
  MapPin, Link2, Star, ShoppingBag, Users,
} from "lucide-react"

const CONFIG = {
  title: "Intelligent Artist Workflows",
  description: "Your complete toolkit for every stage of your music career — from creation to chart placement.",
}

interface Tag {
  label: string
  icon: React.ReactNode
}

const TAG_ROWS: Tag[][] = [
  [
    { label: "Release Planning", icon: <Music2 size={14} /> },
    { label: "Distribution", icon: <Share2 size={14} /> },
    { label: "Pre-Save", icon: <Bookmark size={14} /> },
    { label: "Cover Art", icon: <Image size={14} /> },
    { label: "Mastering", icon: <Headphones size={14} /> },
  ],
  [
    { label: "Rollout Strategy", icon: <Rocket size={14} /> },
    { label: "Social Content", icon: <MessageSquare size={14} /> },
    { label: "Press Kit", icon: <FileText size={14} /> },
    { label: "Radio Promo", icon: <Radio size={14} /> },
    { label: "Analytics", icon: <BarChart2 size={14} /> },
  ],
  [
    { label: "Tour Booking", icon: <MapPin size={14} /> },
    { label: "Sync Licensing", icon: <Link2 size={14} /> },
    { label: "Brand Deals", icon: <Star size={14} /> },
    { label: "Merch", icon: <ShoppingBag size={14} /> },
    { label: "Fan Engagement", icon: <Users size={14} /> },
  ],
]

const LENS_SIZE = 140
const MAGNIFY = 1.6

interface LensPos {
  x: number
  y: number
  active: boolean
}

export function MagnifiedBento() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<LensPos>({ x: 0, y: 0, active: false })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setLens({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setLens(prev => ({ ...prev, active: false }))
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 px-4 py-1.5 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]/70">Platform Capabilities</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">{CONFIG.title}</h2>
        <p className="text-white/40 text-base font-medium max-w-xl mx-auto leading-relaxed">{CONFIG.description}</p>
      </div>

      {/* Magnified tag cloud */}
      <div
        ref={containerRef}
        className="relative rounded-3xl border border-white/8 bg-zinc-950/60 backdrop-blur-xl overflow-hidden p-8 select-none cursor-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background subtle gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,215,0,0.06)_0%,transparent_60%)] pointer-events-none" />

        {/* Tag rows */}
        <div className="space-y-4 relative z-10">
          {TAG_ROWS.map((row, ri) => (
            <div key={ri} className="flex flex-wrap justify-center gap-3">
              {row.map((tag, ti) => (
                <div
                  key={ti}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-zinc-900/60 text-white/50 text-[11px] font-black uppercase tracking-[0.15em] transition-colors hover:border-[#FFD700]/30 hover:text-white/70"
                >
                  <span className="text-[#FFD700]/50">{tag.icon}</span>
                  {tag.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Lens overlay */}
        {lens.active && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{
              left: lens.x - LENS_SIZE / 2,
              top: lens.y - LENS_SIZE / 2,
              width: LENS_SIZE,
              height: LENS_SIZE,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Lens glass effect */}
            <div
              className="w-full h-full rounded-full border-2 border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.15),inset_0_0_20px_rgba(255,215,0,0.05)] overflow-hidden"
              style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, rgba(0,0,0,0.6) 100%)",
                backdropFilter: `blur(0px)`,
              }}
            >
              {/* Magnified content (CSS zoom trick) */}
              <div
                className="w-full h-full"
                style={{
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) scale(${MAGNIFY})`,
                    transformOrigin: "center center",
                    width: `${100 / MAGNIFY}%`,
                    height: `${100 / MAGNIFY}%`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="absolute flex items-center gap-1.5 bg-[#FFD700] rounded-full px-3 py-1 text-black font-black text-[9px] uppercase tracking-wide whitespace-nowrap"
                  >
                    <span>✦</span> Powered by uP
                  </div>
                </div>
              </div>
            </div>

            {/* Lens ring glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 40px rgba(255,215,0,0.2), 0 0 0 1px rgba(255,215,0,0.15)",
              }}
            />
          </motion.div>
        )}

        {/* Cursor dot */}
        {lens.active && (
          <div
            className="absolute w-2 h-2 rounded-full bg-[#FFD700] pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
            style={{ left: lens.x, top: lens.y }}
          />
        )}
      </div>
    </div>
  )
}
