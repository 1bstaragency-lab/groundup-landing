"use client"

import React, { useRef } from "react"
import { motion, useMotionValue, useMotionTemplate } from "framer-motion"
import {
  Music2, Share2, Bookmark, ImageIcon, Headphones,
  Rocket, MessageSquare, FileText, Radio, BarChart2,
  MapPin, Link2, Star, ShoppingBag, Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CONFIG = {
  title: "Intelligent Artist Workflows",
  description: "Your complete toolkit for every stage of your music career — from creation to chart placement.",
  containerHeight: "h-[200px] sm:h-[240px]",
  lensSize: 92,
}

interface Tag { label: string; icon: React.ReactNode }

const TAG_ROWS: Tag[][] = [
  [
    { label: "Release Planning", icon: <Music2 size={14} /> },
    { label: "Distribution",     icon: <Share2 size={14} /> },
    { label: "Pre-Save",         icon: <Bookmark size={14} /> },
    { label: "Cover Art",        icon: <ImageIcon size={14} /> },
    { label: "Mastering",        icon: <Headphones size={14} /> },
  ],
  [
    { label: "Rollout Strategy", icon: <Rocket size={14} /> },
    { label: "Social Content",   icon: <MessageSquare size={14} /> },
    { label: "Press Kit",        icon: <FileText size={14} /> },
    { label: "Radio Promo",      icon: <Radio size={14} /> },
    { label: "Analytics",        icon: <BarChart2 size={14} /> },
  ],
  [
    { label: "Tour Booking",     icon: <MapPin size={14} /> },
    { label: "Sync Licensing",   icon: <Link2 size={14} /> },
    { label: "Brand Deals",      icon: <Star size={14} /> },
    { label: "Merch",            icon: <ShoppingBag size={14} /> },
    { label: "Fan Engagement",   icon: <Users size={14} /> },
  ],
]

function MagnifyingLens({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M365.424 335.392L342.24 312.192L311.68 342.736L334.88 365.936L365.424 335.392Z" fill="#B0BDC6" />
      <path d="M358.08 342.736L334.88 319.552L319.04 335.392L342.24 358.584L358.08 342.736Z" fill="#DFE9EF" />
      <path d="M352.368 321.808L342.752 312.192L312.208 342.752L321.824 352.36L352.368 321.808Z" fill="#B0BDC6" />
      <path d="M332 332C260 404 142.4 404 69.6001 332C-2.3999 260 -2.3999 142.4 69.6001 69.6C141.6 -3.20003 259.2 -2.40002 332 69.6C404.8 142.4 404.8 260 332 332ZM315.2 87.2C252 24 150.4 24 88.0001 87.2C24.8001 150.4 24.8001 252 88.0001 314.4C151.2 377.6 252.8 377.6 315.2 314.4C377.6 252 377.6 150.4 315.2 87.2Z" fill="#DFE9EF" />
      <path d="M319.2 319.2C254.4 384 148.8 384 83.2001 319.2C18.4001 254.4 18.4001 148.8 83.2001 83.2C148 18.4 253.6 18.4 319.2 83.2C384 148.8 384 254.4 319.2 319.2ZM310.4 92C250.4 32 152 32 92.0001 92C32.0001 152 32.0001 250.4 92.0001 310.4C152 370.4 250.4 370.4 310.4 310.4C370.4 250.4 370.4 152 310.4 92Z" fill="#7A858C" />
      <path d="M484.104 428.784L373.8 318.472L318.36 373.912L428.672 484.216L484.104 428.784Z" fill="#333333" />
      <path d="M471.664 441.224L361.344 330.928L330.8 361.48L441.12 471.76L471.664 441.224Z" fill="#575B5E" />
      <path d="M495.2 423.2C504 432 432.8 504 423.2 495.2L417.6 489.6C408.8 480.8 480 408.8 489.6 417.6L495.2 423.2Z" fill="#B0BDC6" />
      <path d="M483.2 435.2C492 444 444.8 492 435.2 483.2L429.6 477.6C420.8 468.8 468 420.8 477.6 429.6L483.2 435.2Z" fill="#DFE9EF" />
    </svg>
  )
}

function TagRow({ tags, rowIndex, reveal }: { tags: Tag[]; rowIndex: number; reveal?: boolean }) {
  const tripled = [...tags, ...tags, ...tags]
  return (
    <motion.div
      className="flex gap-4 w-max"
      animate={{ x: rowIndex % 2 === 0 ? ["0%", "-33.333%"] : ["-33.333%", "0%"] }}
      transition={{ duration: 25, ease: "linear", repeat: Infinity }}
    >
      {tripled.map((tag, idx) => (
        <div
          key={idx}
          className={cn(
            "flex gap-2 whitespace-nowrap w-fit p-2 px-3 items-center rounded-full text-xs",
            reveal
              ? "bg-zinc-950 border border-[#FFD700]/25 text-white font-semibold shadow-sm scale-110 ml-2"
              : "bg-black/50 backdrop-blur-sm border border-white/10 text-white/50"
          )}
        >
          <span className={reveal ? "text-[#FFD700]" : "text-white/30"}>{tag.icon}</span>
          <span>{tag.label}</span>
        </div>
      ))}
    </motion.div>
  )
}

export function MagnifiedBento() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lensX = useMotionValue(0)
  const lensY = useMotionValue(0)

  // Clip path that reveals the brightened layer
  const clipPath = useMotionTemplate`circle(30px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px))`
  // Inverse mask that hides the dimmed layer under the lens
  const inverseMask = useMotionTemplate`radial-gradient(circle 30px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px), transparent 100%, black 100%)`

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 w-full">
      <div className="group relative w-full max-w-[420px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/8 bg-zinc-950 p-1.5 sm:p-2 shadow-2xl shadow-[#FFD700]/5 transition-all duration-500 hover:shadow-[#FFD700]/10 hover:-translate-y-1">
        <div
          ref={containerRef}
          className={cn("relative w-full overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] bg-zinc-900/40", CONFIG.containerHeight)}
        >
          <div className="relative h-full w-full flex flex-col items-center justify-center">

            {/* Base layer — dimmed, masked out under the lens */}
            <motion.div
              style={{ WebkitMaskImage: inverseMask, maskImage: inverseMask }}
              className="flex flex-col gap-4 w-full h-full justify-center overflow-hidden"
            >
              {TAG_ROWS.map((row, ri) => (
                <TagRow key={ri} tags={row} rowIndex={ri} reveal={false} />
              ))}
            </motion.div>

            {/* Reveal layer — bright/gold, shown only inside the lens circle */}
            <motion.div
              className="absolute inset-0 flex flex-col gap-4 justify-center pointer-events-none select-none z-10 overflow-hidden"
              style={{ clipPath }}
            >
              {TAG_ROWS.map((row, ri) => (
                <TagRow key={ri} tags={row} rowIndex={ri} reveal={true} />
              ))}
            </motion.div>

            {/* Draggable lens */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 cursor-grab active:cursor-grabbing drop-shadow-xl"
              drag
              dragMomentum={false}
              dragConstraints={containerRef}
              style={{ x: lensX, y: lensY }}
            >
              <div className="relative">
                <MagnifyingLens size={CONFIG.lensSize} />
                <div className="absolute top-[6px] left-[6px] w-[60px] h-[60px] rounded-full bg-white/10 pointer-events-none" />
              </div>
            </motion.div>
          </div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-zinc-950 to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-zinc-950 to-transparent z-20" />
        </div>

        <div className="p-4 sm:p-6 px-4 pb-6 sm:pb-8">
          <h3 className="text-xl font-bold tracking-tight text-white">{CONFIG.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/40">{CONFIG.description}</p>
        </div>
      </div>
    </div>
  )
}

export default MagnifiedBento
