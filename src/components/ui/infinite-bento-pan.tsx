"use client"

import { useEffect, useRef, useState } from "react"

const GOLD     = "#FFD700"
const GOLD_DIM = "#B8860B"
const SUPER_W  = 3200
const SUPER_H  = 2200

type CardKind = "chart" | "counter" | "gradient" | "code" | "bars" | "stat"

interface CardDef {
  x: number; y: number; w: number; h: number
  kind: CardKind; hue: number; label?: string; seed: number
}

const CARDS: CardDef[] = [
  { x: 80,   y: 80,   w: 460, h: 260, kind: "chart",    hue: 45,  label: "Streams",           seed: 1  },
  { x: 580,  y: 80,   w: 270, h: 260, kind: "counter",  hue: 45,  label: "Monthly Listeners",  seed: 2  },
  { x: 890,  y: 80,   w: 340, h: 160, kind: "gradient", hue: 45,  seed: 3  },
  { x: 1270, y: 80,   w: 460, h: 260, kind: "code",     hue: 0,   label: "release.ts",         seed: 4  },
  { x: 1770, y: 80,   w: 270, h: 260, kind: "stat",     hue: 45,  label: "Billboard #",        seed: 5  },
  { x: 2080, y: 80,   w: 360, h: 160, kind: "gradient", hue: 55,  seed: 6  },
  { x: 2480, y: 80,   w: 340, h: 260, kind: "bars",     hue: 40,  label: "TikTok Views",       seed: 7  },
  { x: 890,  y: 280,  w: 340, h: 180, kind: "counter",  hue: 45,  label: "Followers",          seed: 8  },
  { x: 2080, y: 280,  w: 360, h: 180, kind: "chart",    hue: 45,  label: "Revenue",            seed: 9  },
  { x: 80,   y: 380,  w: 460, h: 260, kind: "code",     hue: 0,   label: "rollout.ts",         seed: 10 },
  { x: 1270, y: 380,  w: 270, h: 260, kind: "stat",     hue: 45,  label: "Chart Pos",          seed: 11 },
  { x: 1580, y: 380,  w: 360, h: 260, kind: "bars",     hue: 40,  label: "Playlists",          seed: 12 },
  { x: 2480, y: 380,  w: 340, h: 260, kind: "gradient", hue: 50,  seed: 13 },
  { x: 80,   y: 680,  w: 460, h: 220, kind: "chart",    hue: 40,  label: "Streams/Day",        seed: 14 },
  { x: 580,  y: 680,  w: 270, h: 220, kind: "stat",     hue: 45,  label: "Fan Score",          seed: 15 },
  { x: 890,  y: 700,  w: 360, h: 200, kind: "gradient", hue: 35,  seed: 16 },
  { x: 1290, y: 700,  w: 340, h: 200, kind: "counter",  hue: 45,  label: "Releases",           seed: 17 },
  { x: 1670, y: 700,  w: 460, h: 220, kind: "chart",    hue: 45,  label: "Playlist Adds",      seed: 18 },
  { x: 2170, y: 700,  w: 340, h: 220, kind: "bars",     hue: 50,  label: "Press Hits",         seed: 19 },
  { x: 80,   y: 940,  w: 340, h: 200, kind: "stat",     hue: 45,  label: "Tour Dates",         seed: 20 },
  { x: 460,  y: 940,  w: 360, h: 200, kind: "gradient", hue: 45,  seed: 21 },
  { x: 860,  y: 940,  w: 460, h: 200, kind: "chart",    hue: 45,  label: "Spotify",            seed: 22 },
  { x: 1360, y: 940,  w: 270, h: 200, kind: "counter",  hue: 40,  label: "Sync Deals",         seed: 23 },
  { x: 1670, y: 960,  w: 340, h: 200, kind: "gradient", hue: 50,  seed: 24 },
  { x: 2050, y: 960,  w: 360, h: 200, kind: "stat",    hue: 45,  label: "Pitch Rate",         seed: 25 },
  { x: 2450, y: 960,  w: 380, h: 200, kind: "bars",     hue: 45,  label: "Merch",              seed: 26 },
  { x: 80,   y: 1180, w: 460, h: 240, kind: "code",     hue: 0,   label: "promo.ts",           seed: 27 },
  { x: 580,  y: 1180, w: 340, h: 240, kind: "chart",    hue: 45,  label: "Apple Music",        seed: 28 },
  { x: 960,  y: 1180, w: 270, h: 240, kind: "stat",     hue: 45,  label: "Radio Spins",        seed: 29 },
  { x: 1270, y: 1180, w: 360, h: 240, kind: "counter",  hue: 45,  label: "Pitches",            seed: 30 },
  { x: 1670, y: 1180, w: 340, h: 240, kind: "gradient", hue: 40,  seed: 31 },
  { x: 2050, y: 1180, w: 360, h: 240, kind: "bars",     hue: 50,  label: "Brand Deals",        seed: 32 },
  { x: 80,   y: 1460, w: 360, h: 200, kind: "stat",     hue: 45,  label: "Saves",              seed: 33 },
  { x: 480,  y: 1460, w: 460, h: 200, kind: "chart",    hue: 45,  label: "YouTube",            seed: 34 },
  { x: 980,  y: 1460, w: 340, h: 200, kind: "gradient", hue: 45,  seed: 35 },
  { x: 1360, y: 1460, w: 270, h: 200, kind: "counter",  hue: 45,  label: "Collabs",            seed: 36 },
  { x: 1670, y: 1480, w: 360, h: 200, kind: "bars",     hue: 40,  label: "SoundCloud",         seed: 37 },
  { x: 2070, y: 1480, w: 340, h: 200, kind: "gradient", hue: 45,  seed: 38 },
  { x: 80,   y: 1700, w: 460, h: 220, kind: "bars",     hue: 45,  label: "Instagram",          seed: 39 },
  { x: 580,  y: 1700, w: 360, h: 220, kind: "chart",    hue: 50,  label: "Fan Growth",         seed: 40 },
  { x: 980,  y: 1700, w: 270, h: 220, kind: "counter",  hue: 45,  label: "Shows",              seed: 41 },
  { x: 1290, y: 1700, w: 460, h: 220, kind: "code",     hue: 0,   label: "tour.ts",            seed: 42 },
  { x: 1790, y: 1700, w: 360, h: 220, kind: "stat",     hue: 45,  label: "Review Score",       seed: 43 },
]

// ─── Noise helper ─────────────────────────────────────────────────────────────
function noise(seed: number, t: number) {
  return Math.sin(t + seed * 2.399) * 0.5 + 0.5
}

// ─── Card sub-components ──────────────────────────────────────────────────────

function ChartCard({ seed, t }: { seed: number; t: number }) {
  const pts: string[] = []
  for (let i = 0; i < 12; i++) {
    const x = (i / 11) * 100
    const y = 50 - (Math.sin(i * 0.7 + t + seed) * 18 + Math.cos(i * 0.4 + t * 0.6 + seed) * 8)
    pts.push(`${x},${y}`)
  }
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id={`cg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${pts.join(" ")} 100,60 0,60`} fill={`url(#cg-${seed})`} stroke="none" />
      <polyline points={pts.join(" ")} fill="none" stroke={GOLD} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BarsCard({ seed, t }: { seed: number; t: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: "100%", width: "100%" }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const h = 20 + noise(seed + i, t) * 75
        return (
          <div key={i} style={{
            flex: 1, height: `${h}%`,
            background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DIM}88 100%)`,
            borderRadius: 3,
            transition: "height 0.4s ease",
          }} />
        )
      })}
    </div>
  )
}

function CodeCard({ label }: { label?: string }) {
  const lines = [
    { indent: 0, w: 55, c: GOLD },
    { indent: 1, w: 78, c: "rgba(255,255,255,0.7)" },
    { indent: 1, w: 48, c: "#f9a8d4" },
    { indent: 2, w: 65, c: "rgba(255,255,255,0.7)" },
    { indent: 2, w: 38, c: `${GOLD}bb` },
    { indent: 1, w: 28, c: "rgba(255,255,255,0.4)" },
    { indent: 0, w: 18, c: "rgba(255,255,255,0.4)" },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,215,0,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          {label}
        </div>
      )}
      {lines.map((l, i) => (
        <div key={i} style={{ marginLeft: l.indent * 12, width: `${l.w}%`, height: 7, borderRadius: 3, background: l.c, opacity: 0.8 }} />
      ))}
    </div>
  )
}

function GradientCard({ hue }: { hue: number }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `radial-gradient(circle at 30% 30%, hsl(${hue},80%,52%) 0%, hsl(${(hue + 20) % 360},65%,28%) 55%, #080808 100%)`,
    }} />
  )
}

// ─── Single card ──────────────────────────────────────────────────────────────

function BentoCard({ card, t }: { card: CardDef; t: number }) {
  const base: React.CSSProperties = {
    position: "absolute", left: card.x, top: card.y, width: card.w, height: card.h,
    borderRadius: 16,
    background: "linear-gradient(160deg, #161616 0%, #0c0c0c 100%)",
    border: "1px solid rgba(255,215,0,0.07)",
    overflow: "hidden", padding: 16,
    display: "flex", flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    color: "white",
  }

  const label = card.label ? (
    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,215,0,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8, flexShrink: 0 }}>
      {card.label}
    </div>
  ) : null

  if (card.kind === "chart") return (
    <div style={base}>{label}<div style={{ flex: 1, minHeight: 0 }}><ChartCard seed={card.seed} t={t} /></div></div>
  )

  if (card.kind === "bars") return (
    <div style={base}>{label}<div style={{ flex: 1, minHeight: 0 }}><BarsCard seed={card.seed} t={t} /></div></div>
  )

  if (card.kind === "code") return (
    <div style={base}><div style={{ flex: 1, display: "flex", alignItems: "center" }}><CodeCard label={card.label} /></div></div>
  )

  if (card.kind === "gradient") return (
    <div style={{ ...base, padding: 0 }}><GradientCard hue={card.hue} /></div>
  )

  if (card.kind === "counter") {
    const v = Math.floor(800 + noise(card.seed, t) * 1200)
    const delta = (noise(card.seed + 5, t) * 12).toFixed(1)
    return (
      <div style={base}>
        {label}
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: GOLD }}>
          {v.toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>+{delta}%</div>
      </div>
    )
  }

  // stat
  const v = (94 + noise(card.seed, t) * 5.5).toFixed(2)
  return (
    <div style={base}>
      {label}
      <div style={{ flex: 1, display: "flex", alignItems: "center", fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", color: "white" }}>
        {v}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", marginLeft: 3 }}>%</span>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function InfiniteBentoPan() {
  const [t, setT] = useState(0)
  const rafRef   = useRef<number>(0)
  const startRef = useRef<number | null>(null)

  // Animate t with rAF — drives chart/counter/bars live
  useEffect(() => {
    function tick(now: number) {
      if (!startRef.current) startRef.current = now
      const elapsed = (now - startRef.current) / 1000
      setT(elapsed)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Pan: diagonal slow drift that loops via CSS
  const DURATION = 40 // seconds for one full cycle

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: 24,
        overflow: "hidden",
        background: "#050505",
        boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.06)",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes bentoPan {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(-${SUPER_W * 0.28}px, -${SUPER_H * 0.18}px); }
          50%  { transform: translate(-${SUPER_W * 0.45}px, -${SUPER_H * 0.35}px); }
          75%  { transform: translate(-${SUPER_W * 0.22}px, -${SUPER_H * 0.48}px); }
          100% { transform: translate(0px, 0px); }
        }
      `}</style>

      {/* Panning canvas */}
      <div style={{
        position: "absolute",
        left: 0, top: 0,
        width: SUPER_W, height: SUPER_H,
        animation: `bentoPan ${DURATION}s ease-in-out infinite`,
        willChange: "transform",
      }}>
        {CARDS.map((c, i) => <BentoCard key={i} card={c} t={t} />)}
      </div>

      {/* Edge vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 70%, #000 100%)",
      }} />
    </div>
  )
}
