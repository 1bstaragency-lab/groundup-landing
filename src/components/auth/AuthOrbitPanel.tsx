"use client"

import { memo } from "react"

// Inline SVG paths — eliminates 8 external CDN round-trips on page load
const ICON_PATHS: Record<string, string> = {
  spotify:    "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  tiktok:     "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  instagram:  "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  youtube:    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  applemusic: "M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.454.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 0 0 1.57-.1 5.253 5.253 0 0 0 2.086-.713c1.264-.8 2.018-1.927 2.279-3.388.132-.724.156-1.453.16-2.185l.003-10.985zm-12.06 8.376H9.57V9.878h2.365v4.622zm-1.181-5.56a1.356 1.356 0 1 1 0-2.712 1.356 1.356 0 0 1 0 2.712zm9.123 5.56h-2.358v-3.103c0-.742-.014-1.695-.97-1.695-.972 0-1.12.757-1.12 1.644v3.154h-2.353V9.878h2.26v1.02h.03c.314-.596 1.082-1.224 2.227-1.224 2.38 0 2.818 1.566 2.818 3.604v3.222z",
  soundcloud: "M1.175 12.225C.513 12.225 0 12.75 0 13.413v.013c0 .663.513 1.188 1.175 1.188.663 0 1.175-.525 1.175-1.188v-.013c0-.663-.512-1.188-1.175-1.188zm2.738 0c-.663 0-1.175.525-1.175 1.188v.025c0 .663.512 1.188 1.175 1.188.663 0 1.175-.525 1.175-1.188v-.025c0-.663-.512-1.188-1.175-1.188zm2.738 0c-.663 0-1.175.525-1.175 1.188v.038c0 .663.512 1.188 1.175 1.188.663 0 1.175-.525 1.175-1.188v-.038c0-.663-.512-1.188-1.175-1.188zm10.35-6.3c-.15 0-.3.013-.45.038-.375-3.6-3.413-6.375-7.088-6.375-1.163 0-2.288.3-3.263.825-.35.188-.45.6-.262.938.188.35.6.45.938.262.75-.413 1.612-.637 2.587-.637 3.038 0 5.513 2.325 5.775 5.288.013.188.075.375.225.488.15.125.337.175.525.15.15-.025.3-.037.45-.037 1.913 0 3.45 1.537 3.45 3.45s-1.537 3.45-3.45 3.45H6.65c-.413 0-.75.337-.75.75s.337.75.75.75h10.35c2.738 0 4.95-2.213 4.95-4.95s-2.212-4.95-4.95-4.95z",
  x:          "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  billboard:  "M0 0h3.771v24H0zm5.657 0h9.144c4.89 0 7.656 2.59 7.656 6.751 0 2.56-1.166 4.648-3.108 5.799C21.906 13.56 24 15.878 24 19.222 24 23.214 21.166 24 17.725 24H5.657zm3.771 9.86h4.98c2.383 0 3.724-1.072 3.724-3.025 0-1.905-1.291-2.977-3.624-2.977H9.428zm0 10.282h5.55c2.64 0 4.063-1.12 4.063-3.2 0-2.03-1.473-3.098-4.162-3.098H9.428z",
}

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
                <svg viewBox="0 0 24 24" width={20} height={20} fill="white" aria-label={icon.name}>
                  <path d={ICON_PATHS[icon.slug]} />
                </svg>
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
