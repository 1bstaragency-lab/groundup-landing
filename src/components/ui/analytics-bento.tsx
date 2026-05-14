"use client"

import type React from "react"
import { useState, useRef, useMemo } from "react"

const weekData = [
  { day: "Mon", value: 1200 },
  { day: "Tue", value: 1850 },
  { day: "Wed", value: 2400 },
  { day: "Thu", value: 3100 },
  { day: "Fri", value: 4800 },
  { day: "Sat", value: 6200 },
  { day: "Sun", value: 5400 },
]

const GOLD = "#FFD700"
const GOLD_DIM = "#B8860B"

interface BudgetCardProps {
  className?: string
}

export function BudgetCard({ className }: BudgetCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(4)
  const chartRef = useRef<SVGSVGElement>(null)

  const maxValue = Math.max(...weekData.map((d) => d.value))
  const minValue = Math.min(...weekData.map((d) => d.value))
  const chartHeight = 160
  const chartWidth = 360
  const padding = { top: 40, bottom: 35, left: 10, right: 10 }

  const getY = (value: number) => {
    const range = maxValue - minValue
    const normalized = (value - minValue) / range
    return chartHeight - padding.bottom - normalized * (chartHeight - padding.top - padding.bottom)
  }

  const getX = (index: number) =>
    padding.left + (index / (weekData.length - 1)) * (chartWidth - padding.left - padding.right)

  const generatePath = () => {
    const points = weekData.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
    let path = `M ${points[0].x} ${points[0].y}`
    const tension = 0.35
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2] || p2
      const cp1x = p1.x + (p2.x - p0.x) * tension
      const cp1y = p1.y + (p2.y - p0.y) * tension
      const cp2x = p2.x - (p3.x - p1.x) * tension
      const cp2y = p2.y - (p3.y - p1.y) * tension
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return path
  }

  const generateAreaPath = () => {
    const linePath = generatePath()
    const lastPoint = weekData.length - 1
    return `${linePath} L ${getX(lastPoint)} ${chartHeight - padding.bottom} L ${getX(0)} ${chartHeight - padding.bottom} Z`
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current) return
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relativeX = (x / rect.width) * chartWidth
    let closestIndex = 0
    let closestDist = Number.POSITIVE_INFINITY
    weekData.forEach((_, i) => {
      const dist = Math.abs(getX(i) - relativeX)
      if (dist < closestDist) { closestDist = dist; closestIndex = i }
    })
    setHoveredIndex(closestIndex)
  }

  const scatteredDots = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        x: 40 + (i % 7) * 42 + (Math.random() - 0.5) * 30,
        y: padding.top + 15 + Math.floor(i / 7) * 15 + (Math.random() - 0.5) * 10,
        opacity: 0.15 + Math.random() * 0.25,
        size: 1.2 + Math.random() * 1.8,
      })),
    [],
  )

  const totalStreams = weekData.reduce((s, d) => s + d.value, 0)
  const prev = totalStreams * 0.78
  const pctChange = (((totalStreams - prev) / prev) * 100).toFixed(1)

  return (
    <div className={`relative w-full rounded-[2rem] bg-zinc-950 border border-white/8 p-3.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,215,0,0.06)_inset] ${className ?? ""}`}>
      {/* Gold inner glow */}
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-gradient-to-b from-[#FFD700]/5 to-transparent pointer-events-none" style={{ height: "40%" }} />

      <div className="relative overflow-hidden rounded-[1.6rem] bg-zinc-900/60 p-6 pb-4 border border-white/5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Release Streams</p>
            <h2 className="mt-1.5 text-[42px] font-black leading-[1] tracking-tight text-white">
              {totalStreams.toLocaleString()}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 px-3 py-1.5">
              <span className="text-[13px] font-bold text-[#FFD700]">+{pctChange}%</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 11L6 7L9 10L14 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 4H14V8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="relative -mr-1 -mt-1 h-[90px] w-[110px]">
            <MusicWaveIllustration />
          </div>
        </div>

        {/* Chart */}
        <div className="relative mt-3">
          <svg
            ref={chartRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(4)}
            style={{ cursor: "default" }}
          >
            <defs>
              <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
                <stop offset="50%" stopColor={GOLD} stopOpacity="0.12" />
                <stop offset="100%" stopColor={GOLD} stopOpacity="0.01" />
              </linearGradient>
              <filter id="goldDotGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {weekData.map((_, i) => (
              <line
                key={i}
                x1={getX(i)} y1={padding.top}
                x2={getX(i)} y2={chartHeight - padding.bottom}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray="3 5"
                opacity={hoveredIndex === i ? 1 : 0.6}
              />
            ))}

            {scatteredDots.map((dot, i) => (
              <circle key={i} cx={dot.x} cy={dot.y} r={dot.size} fill={GOLD} opacity={dot.opacity} />
            ))}

            <path d={generateAreaPath()} fill="url(#goldAreaGrad)" />

            <path
              d={generatePath()}
              fill="none"
              stroke={`url(#goldLineGrad)`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GOLD_DIM} />
                <stop offset="100%" stopColor={GOLD} />
              </linearGradient>
            </defs>

            {hoveredIndex !== null && (
              <g>
                <circle cx={getX(hoveredIndex)} cy={getY(weekData[hoveredIndex].value)} r="12" fill="rgba(255,215,0,0.08)" />
                <circle
                  cx={getX(hoveredIndex)} cy={getY(weekData[hoveredIndex].value)} r="6"
                  fill="#18181b" stroke={GOLD} strokeWidth="2.5"
                  filter="url(#goldDotGlow)"
                />
              </g>
            )}

            {weekData.map((d, i) => (
              <text
                key={i}
                x={getX(i)} y={chartHeight - 8}
                textAnchor="middle"
                fontSize="11" fontWeight="600"
                fill="rgba(255,255,255,0.25)"
              >
                {d.day}
              </text>
            ))}
          </svg>

          {hoveredIndex !== null && (
            <div
              className="pointer-events-none absolute transition-all duration-150 ease-out"
              style={{
                left: `${(getX(hoveredIndex) / chartWidth) * 100}%`,
                top: `${(getY(weekData[hoveredIndex].value) / chartHeight) * 100}%`,
                transform: "translate(-50%, -140%)",
              }}
            >
              <div className="relative rounded-xl bg-zinc-900 border border-[#FFD700]/20 px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                <span className="text-[13px] font-bold text-[#FFD700]">
                  {weekData[hoveredIndex].value.toLocaleString()}
                </span>
                <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-zinc-900" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MusicWaveIllustration() {
  return (
    <svg viewBox="0 0 110 90" className="h-full w-full drop-shadow-lg" fill="none">
      <defs>
        <linearGradient id="waveCard1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="waveCard2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="waveCard3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.15" />
        </linearGradient>
        <filter id="wShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FFD700" floodOpacity="0.15" />
        </filter>
      </defs>
      {/* Three layered waveform bars */}
      <g transform="translate(6, 48) rotate(-18, 44, 16)" filter="url(#wShadow)">
        <rect x="0"  y="-28" width="8" height="56" rx="4" fill="url(#waveCard3)" />
        <rect x="12" y="-16" width="8" height="32" rx="4" fill="url(#waveCard3)" />
        <rect x="24" y="-38" width="8" height="76" rx="4" fill="url(#waveCard3)" />
        <rect x="36" y="-20" width="8" height="40" rx="4" fill="url(#waveCard3)" />
        <rect x="48" y="-10" width="8" height="20" rx="4" fill="url(#waveCard3)" />
        <rect x="60" y="-32" width="8" height="64" rx="4" fill="url(#waveCard3)" />
      </g>
      <g transform="translate(16, 54) rotate(-9, 44, 16)" filter="url(#wShadow)">
        <rect x="0"  y="-28" width="8" height="56" rx="4" fill="url(#waveCard2)" />
        <rect x="12" y="-16" width="8" height="32" rx="4" fill="url(#waveCard2)" />
        <rect x="24" y="-38" width="8" height="76" rx="4" fill="url(#waveCard2)" />
        <rect x="36" y="-20" width="8" height="40" rx="4" fill="url(#waveCard2)" />
        <rect x="48" y="-10" width="8" height="20" rx="4" fill="url(#waveCard2)" />
        <rect x="60" y="-32" width="8" height="64" rx="4" fill="url(#waveCard2)" />
      </g>
      <g transform="translate(28, 60) rotate(-2, 44, 16)" filter="url(#wShadow)">
        <rect x="0"  y="-28" width="8" height="56" rx="4" fill="url(#waveCard1)" />
        <rect x="12" y="-16" width="8" height="32" rx="4" fill="url(#waveCard1)" />
        <rect x="24" y="-38" width="8" height="76" rx="4" fill="url(#waveCard1)" />
        <rect x="36" y="-20" width="8" height="40" rx="4" fill="url(#waveCard1)" />
        <rect x="48" y="-10" width="8" height="20" rx="4" fill="url(#waveCard1)" />
        <rect x="60" y="-32" width="8" height="64" rx="4" fill="url(#waveCard1)" />
      </g>
    </svg>
  )
}
