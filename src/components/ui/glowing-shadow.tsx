"use client"
import { cn } from "@/lib/utils"

interface GlowingShadowProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  /** 0–1, opacity of the rotating glow ring */
  intensity?: number
  /** Border radius matching your card, e.g. "1rem" or "16px" */
  radius?: string
  /** Animation duration in seconds */
  duration?: number
}

export function GlowingShadow({
  children, className, glowColor = "#FFD700",
  intensity = 0.55, radius = "1rem", duration = 4,
}: GlowingShadowProps) {
  const id = `glow-${Math.random().toString(36).slice(2, 8)}`

  return (
    <div className={cn("relative", className)}>
      <style>{`
        @keyframes glow-rotate-${id} {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .glow-ring-${id} {
          position: absolute;
          top: 50%; left: 50%;
          width: 200%; height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent   0deg,
            ${glowColor}  80deg,
            transparent   160deg,
            transparent   360deg
          );
          animation: glow-rotate-${id} ${duration}s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Rotating glow border layer */}
      <div
        className="absolute -inset-[1.5px] overflow-hidden pointer-events-none z-0"
        style={{ borderRadius: radius, opacity: intensity }}
      >
        <div className={`glow-ring-${id}`} />
      </div>

      {/* Ambient glow bloom beneath */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          borderRadius: radius,
          boxShadow: `0 0 40px 4px ${glowColor}22, 0 0 80px 8px ${glowColor}10`,
        }}
      />

      {/* Card content */}
      <div className="relative z-10" style={{ borderRadius: radius }}>
        {children}
      </div>
    </div>
  )
}
