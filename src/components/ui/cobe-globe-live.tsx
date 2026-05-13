"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface ArtistMarker {
  id: string
  location: [number, number]
  name: string
  listeners: string
}

interface GlobeLiveProps {
  markers?: ArtistMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: ArtistMarker[] = [
  { id: "artist1", location: [37.78, -122.44], name: "ELARA", listeners: "2.9M" },
  { id: "artist2", location: [51.51, -0.13], name: "KAIXO", listeners: "1.4M" },
  { id: "artist3", location: [35.68, 139.65], name: "LYRA", listeners: "850K" },
  { id: "artist4", location: [48.86, 2.35], name: "NOVA", listeners: "3.2M" },
  { id: "artist5", location: [-33.87, 151.21], name: "CYRA", listeners: "620K" },
  { id: "artist6", location: [40.71, -74.01], name: "SOLAR", listeners: "4.1M" },
]

export function GlobeLive({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeLiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: any = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: 0, theta: 0.2, dark: 1, diffuse: 1.5,
        mapSamples: 16000, mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.1],
        markerColor: [1, 0.84, 0], // Gold markers
        glowColor: [1, 0.84, 0], // Gold glow
        markerElevation: 0.01,
        markers: markers.map((m) => ({ location: m.location, size: 0.05, id: m.id })),
        arcs: [], arcColor: [1, 0.84, 0],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.8,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes gold-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 0.8rem",
            background: "rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,215,0,0.2)",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            pointerEvents: "none" as const,
            whiteSpace: "nowrap" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <span style={{
            width: 6, height: 6, background: "#FFD700", borderRadius: "50%",
            boxShadow: "0 0 10px #FFD700",
            animation: "gold-pulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 900,
            letterSpacing: "0.15em", color: "#FFD700", textTransform: "uppercase" as const,
          }}>{m.name}</span>
          <span style={{
            fontFamily: "system-ui, sans-serif", fontSize: "0.6rem", fontWeight: 700,
            color: "rgba(255,255,255,0.5)", paddingLeft: "0.4rem",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            letterSpacing: "0.05em",
          }}>
            {m.listeners} LISTENERS
          </span>
        </div>
      ))}
    </div>
  )
}
