"use client"

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import { Player } from "@remotion/player"
import { useMemo } from "react"

const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif"
const SUPER_W = 3500
const SUPER_H = 2500
const GOLD = "#FFD700"
const GOLD_DIM = "#B8860B"

type CardKind = "chart" | "counter" | "gradient" | "code" | "logo" | "stat" | "bars"

interface CardDef {
  x: number; y: number; w: number; h: number
  kind: CardKind; hue: number; label?: string
}

const CARDS: CardDef[] = [
  { x: 80,   y: 80,   w: 480, h: 280, kind: "chart",    hue: 45,  label: "Streams" },
  { x: 600,  y: 80,   w: 280, h: 280, kind: "counter",  hue: 45,  label: "Monthly Listeners" },
  { x: 920,  y: 80,   w: 360, h: 180, kind: "gradient", hue: 45 },
  { x: 1320, y: 80,   w: 480, h: 280, kind: "code",     hue: 0,   label: "release.ts" },
  { x: 1840, y: 80,   w: 280, h: 280, kind: "logo",     hue: 45 },
  { x: 2160, y: 80,   w: 380, h: 180, kind: "stat",     hue: 45,  label: "Billboard #" },
  { x: 2580, y: 80,   w: 360, h: 280, kind: "bars",     hue: 40,  label: "TikTok Views" },
  { x: 920,  y: 300,  w: 360, h: 200, kind: "counter",  hue: 180, label: "Followers" },
  { x: 2160, y: 300,  w: 380, h: 200, kind: "chart",    hue: 120, label: "Revenue" },
  { x: 80,   y: 400,  w: 280, h: 280, kind: "gradient", hue: 55 },
  { x: 400,  y: 400,  w: 480, h: 280, kind: "code",     hue: 0,   label: "rollout.ts" },
  { x: 1320, y: 420,  w: 280, h: 280, kind: "stat",     hue: 45,  label: "Chart Pos" },
  { x: 1640, y: 420,  w: 380, h: 280, kind: "bars",     hue: 40,  label: "Playlists" },
  { x: 2580, y: 420,  w: 360, h: 280, kind: "logo",     hue: 45 },
  { x: 80,   y: 720,  w: 480, h: 240, kind: "chart",    hue: 40,  label: "Streams/Day" },
  { x: 600,  y: 720,  w: 280, h: 240, kind: "stat",     hue: 45,  label: "Fan Score" },
  { x: 920,  y: 740,  w: 380, h: 220, kind: "gradient", hue: 35 },
  { x: 1320, y: 740,  w: 360, h: 220, kind: "counter",  hue: 45,  label: "Releases" },
  { x: 1720, y: 740,  w: 480, h: 240, kind: "code",     hue: 0,   label: "analytics.ts" },
  { x: 2240, y: 740,  w: 360, h: 240, kind: "bars",     hue: 50,  label: "Press Hits" },
  { x: 80,   y: 1000, w: 360, h: 220, kind: "logo",     hue: 45 },
  { x: 460,  y: 1000, w: 380, h: 220, kind: "stat",     hue: 45,  label: "Tour Dates" },
  { x: 880,  y: 1000, w: 480, h: 220, kind: "chart",    hue: 45,  label: "Spotify" },
  { x: 1400, y: 1000, w: 280, h: 220, kind: "counter",  hue: 40,  label: "Sync Deals" },
  { x: 1720, y: 1020, w: 360, h: 220, kind: "gradient", hue: 50 },
  { x: 2120, y: 1020, w: 380, h: 220, kind: "code",     hue: 0,   label: "pitches.ts" },
  { x: 2540, y: 1020, w: 400, h: 220, kind: "bars",     hue: 45,  label: "Merch" },
  { x: 80,   y: 1280, w: 480, h: 260, kind: "code",     hue: 0,   label: "promo.ts" },
  { x: 600,  y: 1280, w: 360, h: 260, kind: "chart",    hue: 45,  label: "Apple Music" },
  { x: 1000, y: 1280, w: 280, h: 260, kind: "logo",     hue: 45 },
  { x: 1320, y: 1280, w: 380, h: 260, kind: "stat",     hue: 45,  label: "Radio Spins" },
  { x: 1740, y: 1280, w: 360, h: 260, kind: "counter",  hue: 45,  label: "Pitches" },
  { x: 2140, y: 1280, w: 380, h: 260, kind: "gradient", hue: 40 },
  { x: 2560, y: 1280, w: 380, h: 260, kind: "bars",     hue: 50,  label: "Brand Deals" },
  { x: 80,   y: 1600, w: 380, h: 220, kind: "stat",     hue: 45,  label: "Saves" },
  { x: 500,  y: 1600, w: 480, h: 220, kind: "chart",    hue: 45,  label: "YouTube" },
  { x: 1020, y: 1600, w: 360, h: 220, kind: "code",     hue: 0,   label: "tour.ts" },
  { x: 1420, y: 1600, w: 280, h: 220, kind: "logo",     hue: 45 },
  { x: 1740, y: 1620, w: 380, h: 220, kind: "counter",  hue: 45,  label: "Collabs" },
  { x: 2160, y: 1620, w: 360, h: 220, kind: "bars",     hue: 40,  label: "SoundCloud" },
  { x: 2560, y: 1620, w: 380, h: 220, kind: "gradient", hue: 45 },
  { x: 80,   y: 1880, w: 480, h: 240, kind: "bars",     hue: 45,  label: "Instagram" },
  { x: 600,  y: 1880, w: 380, h: 240, kind: "gradient", hue: 50 },
  { x: 1020, y: 1880, w: 360, h: 240, kind: "logo",     hue: 45 },
  { x: 1420, y: 1880, w: 480, h: 240, kind: "chart",    hue: 45,  label: "Fan Growth" },
  { x: 1940, y: 1880, w: 280, h: 240, kind: "counter",  hue: 45,  label: "Shows" },
  { x: 2260, y: 1880, w: 380, h: 240, kind: "stat",     hue: 45,  label: "Review Score" },
  { x: 2680, y: 1880, w: 260, h: 240, kind: "code",     hue: 0,   label: "mix.ts" },
]

function noise(i: number, frame: number) {
  return Math.sin(frame / 30 + i) * 0.5 + 0.5
}

function ChartCard({ t }: { t: number }) {
  const pts: string[] = []
  for (let i = 0; i < 12; i++) {
    const x = (i / 11) * 100
    const y = 50 - (Math.sin(i * 0.7 + t) * 18 + Math.cos(i * 0.4 + t * 0.6) * 8)
    pts.push(`${x},${y}`)
  }
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${pts.join(" ")} 100,60 0,60`} fill={`${GOLD}22`} stroke="none" />
    </svg>
  )
}

function BarsCard({ t }: { t: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: "100%", width: "100%" }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const h = 25 + (Math.sin(i * 0.8 + t) * 0.5 + 0.5) * 70
        return (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DIM}88 100%)`, borderRadius: 4 }} />
        )
      })}
    </div>
  )
}

function CodeCard() {
  const lines = [
    { indent: 0, w: 60, c: GOLD },
    { indent: 1, w: 80, c: "rgba(255,255,255,0.75)" },
    { indent: 1, w: 50, c: "#f9a8d4" },
    { indent: 2, w: 70, c: "rgba(255,255,255,0.75)" },
    { indent: 2, w: 40, c: `${GOLD}cc` },
    { indent: 1, w: 30, c: "rgba(255,255,255,0.5)" },
    { indent: 0, w: 20, c: "rgba(255,255,255,0.5)" },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ marginLeft: l.indent * 14, width: `${l.w}%`, height: 8, borderRadius: 3, background: l.c, opacity: 0.75 }} />
      ))}
    </div>
  )
}

function LogoCard({ hue }: { hue: number }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${GOLD} 0%, hsl(${hue},60%,40%) 100%)`, boxShadow: `0 10px 30px ${GOLD}44` }} />
    </div>
  )
}

function GradientCard({ hue }: { hue: number }) {
  return (
    <div style={{ width: "100%", height: "100%", background: `radial-gradient(circle at 30% 30%, hsl(${hue},80%,55%) 0%, hsl(${(hue + 20) % 360},70%,30%) 50%, #0a0a0a 100%)` }} />
  )
}

function BentoCard({ card, index, frame }: { card: CardDef; index: number; frame: number }) {
  const t = noise(index, frame) * 6.28
  const base: React.CSSProperties = {
    position: "absolute", left: card.x, top: card.y, width: card.w, height: card.h,
    borderRadius: 18, background: "linear-gradient(180deg, #141414 0%, #0a0a0a 100%)",
    border: "1px solid rgba(255,215,0,0.08)", overflow: "hidden", padding: 18,
    color: "white", display: "flex", flexDirection: "column",
  }
  const lbl = card.label ? (
    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,215,0,0.55)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
      {card.label}
    </div>
  ) : null

  if (card.kind === "chart")    return <div style={base}>{lbl}<div style={{ flex: 1 }}><ChartCard t={t} /></div></div>
  if (card.kind === "bars")     return <div style={base}>{lbl}<div style={{ flex: 1 }}><BarsCard t={t} /></div></div>
  if (card.kind === "code")     return <div style={base}>{lbl}<div style={{ flex: 1, display: "flex", alignItems: "center" }}><div style={{ width: "100%" }}><CodeCard /></div></div></div>
  if (card.kind === "logo")     return <div style={{ ...base, padding: 0 }}><LogoCard hue={card.hue} /></div>
  if (card.kind === "gradient") return <div style={{ ...base, padding: 0 }}><GradientCard hue={card.hue} /></div>
  if (card.kind === "counter") {
    const v = Math.floor(1200 + noise(index, frame) * 800)
    return (
      <div style={base}>{lbl}
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", color: GOLD }}>{v.toLocaleString()}</div>
        <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>+{(noise(index + 1, frame) * 12).toFixed(1)}%</div>
      </div>
    )
  }
  const v = (95 + noise(index, frame) * 5).toFixed(2)
  return (
    <div style={base}>{lbl}
      <div style={{ flex: 1, display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: "white" }}>
        {v}<span style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>%</span>
      </div>
    </div>
  )
}

function BentoPanComposition() {
  const frame = useCurrentFrame()
  const { durationInFrames, width, height } = useVideoConfig()
  const maxX = SUPER_W - width
  const maxY = SUPER_H - height
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })

  return (
    <div style={{ position: "absolute", inset: 0, background: "#050505", overflow: "hidden", fontFamily: FONT_FAMILY }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SUPER_W, height: SUPER_H, transform: `translate(${-t * maxX}px, ${-t * maxY}px)`, willChange: "transform" }}>
        {CARDS.map((c, i) => <BentoCard key={i} card={c} index={i} frame={frame} />)}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.75) 70%, #000 100%)", pointerEvents: "none" }} />
    </div>
  )
}

export function InfiniteBentoPan() {
  const inputProps = useMemo(() => ({}), [])
  return (
    <Player
      component={BentoPanComposition}
      inputProps={inputProps}
      durationInFrames={300}
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      autoPlay
      loop
      controls={false}
      clickToPlay={false}
      acknowledgeRemotionLicense
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: "16 / 9",
        borderRadius: 24,
        overflow: "hidden",
        background: "#050505",
        boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,215,0,0.06)",
      }}
    />
  )
}
