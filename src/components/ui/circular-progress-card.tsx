"use client"
import { useRef, useMemo } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface CircularProgressCardProps {
  title: string
  description: string
  currentValue: number
  goalValue: number
  label?: string
  progressColor?: string
  className?: string
}

export function CircularProgressCard({
  title, description, currentValue, goalValue,
  label = "completed", progressColor = "#FFD700", className,
}: CircularProgressCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20%" })

  const { progressPercentage, circumference, strokeDashoffset } = useMemo(() => {
    const radius = 72
    const circ = 2 * Math.PI * radius
    const progress = Math.min(Math.max((currentValue / goalValue) * 100, 0), 100)
    return {
      progressPercentage: Math.round(progress),
      circumference: circ,
      strokeDashoffset: circ * (1 - progress / 100),
    }
  }, [currentValue, goalValue])

  return (
    <div
      ref={ref}
      className={cn("w-full rounded-3xl border border-white/8 bg-zinc-900/60 p-6 text-center", className)}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-1">{title}</p>
      <p className="text-white/40 text-xs font-medium mb-5">{description}</p>

      <div className="relative mx-auto h-44 w-44">
        <svg width="100%" height="100%" viewBox="0 0 180 180" role="img" aria-label={`${progressPercentage}%`}>
          <g transform="rotate(-90, 90, 90)">
            {/* Track */}
            <circle cx="90" cy="90" r="72" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
            {/* Progress */}
            <motion.circle
              cx="90" cy="90" r="72"
              fill="transparent"
              stroke={progressColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={inView ? { strokeDashoffset } : {}}
              transition={{ duration: 1.6, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${progressColor}88)` }}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white tracking-tight">{progressPercentage}%</span>
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{label}</span>
          <span className="text-[10px] text-white/20 font-bold mt-0.5">
            {currentValue.toLocaleString()} / {goalValue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
