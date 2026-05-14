"use client"

import { memo } from "react"

// Platform icons via Simple Icons CDN (white, rendered on dark pill backgrounds)
const PLATFORMS = [
  { name: "Spotify",     slug: "spotify",     ring: 1 },
  { name: "TikTok",      slug: "tiktok",      ring: 1 },
  { name: "Instagram",   slug: "instagram",   ring: 2 },
  { name: "YouTube",     slug: "youtube",     ring: 2 },
  { name: "Apple Music", slug: "applemusic",  ring: 2 },
  { name: "SoundCloud",  slug: "soundcloud",  ring: 3 },
  { name: "X",           slug: "x",           ring: 3 },
  { name: "Billboard",   slug: "billboard",   ring: 3 },
]

const RINGS = [
  { id: 1, radius: 90,  duration: 14, reverse: false },
  { id: 2, radius: 155, duration: 22, reverse: true  },
  { id: 3, radius: 220, duration: 30, reverse: false },
]

function OrbitRing({
  radius,
  duration,
  reverse,
  icons,
}: {
  radius: number
  duration: number
  reverse: boolean
  icons: { name: string; slug: string }[]
}) {
  const size = radius * 2
  const dir = reverse ? "ccw" : "cw"
  const iconDir = reverse ? "cw" : "ccw"

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px solid rgba(255,215,0,0.10)",
        animation: `orbit-${dir} ${duration}s linear infinite`,
      }}
    >
      {icons.map((icon, i) => {
        const angle = (360 / icons.length) * i
        return (
          <div
            key={icon.slug}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              // rotate to position on the ring, then push outward
              transform: `rotate(${angle}deg) translateY(-${radius}px) translateX(-50%) translateY(-18px)`,
            }}
          >
            {/* counter-rotate the icon so it always faces upright */}
            <div
              style={{
                animation: `orbit-${iconDir} ${duration}s linear infinite`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                style={{ width: 40, height: 40, padding: 8 }}
                title={icon.name}
              >
                <img
                  src={`https://cdn.simpleicons.org/${icon.slug}/ffffff`}
                  alt={icon.name}
                  width={24}
                  height={24}
                  style={{ objectFit: "contain", width: 24, height: 24 }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const AuthOrbitPanel = memo(function AuthOrbitPanel() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black select-none">
      {/* Keyframes */}
      <style>{`
        @keyframes orbit-cw  { to { transform: rotate( 360deg); } }
        @keyframes orbit-ccw { to { transform: rotate(-360deg); } }
        @keyframes gold-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1);   }
          50%       { opacity: 1;   transform: scale(1.12); }
        }
      `}</style>

      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(255,215,0,0.08)_0%,transparent_70%)]" />

      {/* Orbit rings + icons */}
      <div className="relative flex items-center justify-center" style={{ width: 480, height: 480 }}>
        {RINGS.map(ring => {
          const icons = PLATFORMS.filter(p => p.ring === ring.id)
          return (
            <OrbitRing
              key={ring.id}
              radius={ring.radius}
              duration={ring.duration}
              reverse={ring.reverse}
              icons={icons}
            />
          )
        })}

        {/* Center branding */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <img
            src="/gu-logo.png"
            alt="GrounduP"
            style={{
              height: 80,
              width: "auto",
              filter: "drop-shadow(0 0 24px rgba(255,215,0,0.45))",
              animation: "gold-pulse 3s ease-in-out infinite",
            }}
          />
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
            Artist OS
          </p>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-12 text-center px-8">
        <p className="text-white/20 text-xs font-bold tracking-wide leading-relaxed max-w-xs mx-auto">
          One platform for every corner of your music career.
        </p>
      </div>
    </div>
  )
})
