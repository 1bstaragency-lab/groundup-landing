"use client"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { MeshGradient } from "@paper-design/shaders-react"
import { LiquidButton } from "./liquid-glass-button"
import { AwardBadge } from "./award-badge"
import { useIsMobile } from "../../hooks/useIsMobile"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const INJECTED_STYLES = `
  .hero-cinematic-root {
    position: relative;
    min-height: 100vh;
    background: #000;
    overflow: hidden;
  }
  .hero-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,215,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,215,0,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 1;
  }
  .hero-film-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
  .premium-depth-card {
    background: linear-gradient(135deg, #0f1d45 0%, #162C6D 30%, #1a2850 60%, #0A101D 100%);
    border: 1px solid rgba(255,215,0,0.15);
    border-radius: 2rem;
    box-shadow:
      0 0 0 1px rgba(255,215,0,0.08),
      0 40px 120px rgba(0,0,0,0.8),
      0 0 80px rgba(22,44,109,0.4),
      inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    will-change: transform;
    transition: box-shadow 0.4s ease;
  }
  .premium-depth-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,215,0,0.06) 0%, transparent 50%, rgba(255,255,255,0.02) 100%);
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
  }
  .card-sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    border-radius: inherit;
    background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,215,0,0.08) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .premium-depth-card:hover .card-sheen { opacity: 1; }
  .glass-float-badge {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,215,0,0.2);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.05em;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
    white-space: nowrap;
  }
  .glass-float-badge .badge-dot {
    display: inline-block;
    width: 7px; height: 7px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
    background: #FFD700;
    box-shadow: 0 0 8px rgba(255,215,0,0.8);
    animation: badgePulse 2s ease-in-out infinite;
  }
  @keyframes badgePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(1.3); }
  }
  .hero-stat-row {
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .hero-stat {
    text-align: center;
  }
  .hero-stat-val {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 900;
    background: linear-gradient(135deg, #fff 0%, #FFD700 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }
  .hero-stat-label {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.3);
    margin-top: 4px;
  }
  .progress-ring-track { stroke: rgba(255,215,0,0.12); }
  .progress-ring-fill  {
    stroke: #FFD700;
    stroke-dasharray: 220;
    stroke-dashoffset: 55;
    stroke-linecap: round;
    filter: drop-shadow(0 0 6px rgba(255,215,0,0.7));
  }
  .mockup-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,215,0,0.12);
    border-radius: 14px;
    padding: 12px 16px;
    backdrop-filter: blur(10px);
  }
  .mockup-bar-track {
    background: rgba(255,255,255,0.06);
    border-radius: 999px;
    height: 5px;
    overflow: hidden;
    margin-top: 6px;
  }
  .mockup-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #B8860B, #FFD700);
    box-shadow: 0 0 8px rgba(255,215,0,0.5);
  }
`

function MockupPhoneContent() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Release tracker */}
      <div className="mockup-card">
        <p style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,215,0,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Next Release</p>
        <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1 }}>Midnight City</p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 2 }}>Oct 14 · Pre-Save Required</p>
        <div className="mockup-bar-track"><div className="mockup-bar-fill" style={{ width: "62%" }} /></div>
      </div>

      {/* Stream stat */}
      <div className="mockup-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,215,0,0.7)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Streams Today</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1, marginTop: 2 }}>12.4K</p>
          <p style={{ fontSize: 9, color: "#4ade80", fontWeight: 800, marginTop: 2 }}>▲ 18% vs yesterday</p>
        </div>
        <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <svg viewBox="0 0 80 80" width="56" height="56">
            <circle cx="40" cy="40" r="35" fill="none" strokeWidth="5" className="progress-ring-track" />
            <circle cx="40" cy="40" r="35" fill="none" strokeWidth="5" className="progress-ring-fill" transform="rotate(-90 40 40)" />
          </svg>
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#FFD700" }}>75%</span>
        </div>
      </div>

      {/* Task list */}
      <div className="mockup-card">
        <p style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,215,0,0.7)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>This Week</p>
        {["Finalize cover art", "Social media rollout", "Confirm Nov tour dates"].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, border: i === 0 ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {i === 0 && <span style={{ width: 6, height: 6, background: "#FFD700", borderRadius: 2, display: "block" }} />}
            </span>
            <span style={{ fontSize: 10, color: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)", fontWeight: 700 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ShaderShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const badge1Ref = useRef<HTMLDivElement>(null)
  const badge2Ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) return

    const section = sectionRef.current
    const card = cardRef.current
    const heroText = heroTextRef.current
    const cta = ctaRef.current
    const b1 = badge1Ref.current
    const b2 = badge2Ref.current
    if (!section || !card || !heroText || !cta) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=200%",
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
      },
    })

    // card rises and expands
    tl.fromTo(card,
      { y: 60, scale: 0.82, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" },
      0
    )
    // badges float in
    if (b1) tl.fromTo(b1, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.3)
    if (b2) tl.fromTo(b2, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.5)

    // hero text blurs out
    tl.to(heroText,
      { opacity: 0, filter: "blur(12px)", y: -30, duration: 1, ease: "power2.in" },
      0.8
    )

    // card expands to near-fullscreen
    tl.to(card,
      { scale: 1.04, duration: 1.5, ease: "power1.inOut" },
      1.2
    )

    // cta fades in
    tl.fromTo(cta,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
      2
    )

    // mouse tracking sheen
    const handleMouse = (e: MouseEvent) => {
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty("--mouse-x", `${x}%`)
      card.style.setProperty("--mouse-y", `${y}%`)
    }
    card.addEventListener("mousemove", handleMouse)

    return () => {
      card.removeEventListener("mousemove", handleMouse)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [isMobile])

  return (
    <>
      <style>{INJECTED_STYLES}</style>
      <div ref={sectionRef} className="hero-cinematic-root" style={{ minHeight: isMobile ? "100svh" : "100vh" }}>
        {/* Background layers */}
        <div className="hero-grid-bg" />
        <div className="hero-film-grain" />

        {/* Shader / CSS gradient BG */}
        {isMobile ? (
          <>
            <div className="absolute inset-0 w-full h-full z-0"
              style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(184,134,11,0.18) 0%, rgba(255,215,0,0.07) 40%, transparent 70%)" }} />
            <div className="absolute inset-0 w-full h-full z-0 opacity-30"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,215,0,0.12) 0%, transparent 65%)" }} />
          </>
        ) : (
          <>
            <MeshGradient
              className="absolute inset-0 w-full h-full z-0"
              colors={["#000000", "#FFD700", "#B8860B", "#1A1A1A", "#000000"]}
              speed={0.3}
            />
            <MeshGradient
              className="absolute inset-0 w-full h-full z-0 opacity-30"
              colors={["#000000", "#ffffff", "#FFD700", "#000000"]}
              speed={0.2}
            />
          </>
        )}

        {/* SVG defs for glow effects */}
        <svg className="absolute inset-0 w-0 h-0">
          <defs>
            <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>

        {/* HERO TEXT — blurs out on scroll (desktop) */}
        <div
          ref={heroTextRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ paddingBottom: isMobile ? "0" : "12vh" }}
        >
          {/* Pill badge */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-10 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent rounded-full" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
              ✨ The Artist OS has arrived
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.85] tracking-tighter"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block font-light text-white/90 text-4xl md:text-6xl lg:text-7xl mb-4 tracking-wider italic"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #FFD700 30%, #B8860B 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "url(#text-glow)",
              }}
            >
              Own The
            </motion.span>
            <span className="block font-black text-white drop-shadow-[0_0_50px_rgba(255,215,0,0.3)] uppercase hero-text">uP.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl font-light text-white/60 mb-0 leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Built for how music gets made. GrounduP brings together intelligence, planning, and collaboration in one seamless experience.
          </motion.p>
        </div>

        {/* CINEMATIC CARD — rises on scroll */}
        <div
          className="absolute inset-0 z-20 flex items-end justify-center pointer-events-none"
          style={{ paddingBottom: "0" }}
        >
          <motion.div
            ref={cardRef}
            className="premium-depth-card pointer-events-auto"
            style={{
              width: isMobile ? "92vw" : "min(680px, 80vw)",
              maxHeight: isMobile ? "55vh" : "65vh",
              marginBottom: isMobile ? "5vh" : "6vh",
              opacity: isMobile ? 1 : 0,
            }}
            initial={isMobile ? { opacity: 0, y: 40 } : {}}
            animate={isMobile ? { opacity: 1, y: 0 } : {}}
            transition={isMobile ? { duration: 0.8, delay: 1.0 } : {}}
          >
            <div className="card-sheen" />

            <div className="relative z-10 p-6 flex flex-col gap-0" style={{ height: "100%" }}>
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src="/gu-icon.png" alt="GrounduP" style={{ height: 32, width: 32, objectFit: "contain" }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.15em", lineHeight: 1 }}>GrounduP</p>
                    <p style={{ fontSize: 9, color: "rgba(255,215,0,0.7)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Artist OS</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ width: 8, height: 8, background: "#4ade80", borderRadius: "50%", display: "block", boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Live</span>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ overflowY: "auto", flex: 1 }} className="scrollbar-none">
                <MockupPhoneContent />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating badges (desktop only) */}
        {!isMobile && (
          <>
            <div
              ref={badge1Ref}
              className="glass-float-badge"
              style={{ position: "absolute", left: "12%", top: "45%", zIndex: 30, opacity: 0 }}
            >
              <span className="badge-dot" />
              Release Live 🎵
            </div>
            <div
              ref={badge2Ref}
              className="glass-float-badge"
              style={{ position: "absolute", right: "10%", top: "55%", zIndex: 30, opacity: 0 }}
            >
              <span className="badge-dot" style={{ background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
              +1.2K Streams Today
            </div>
          </>
        )}

        {/* CTA section — fades in at end of scroll (desktop) or shown always (mobile) */}
        <div
          ref={ctaRef}
          className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-10 pt-4"
          style={{ opacity: isMobile ? 1 : 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={isMobile ? { opacity: 0, y: 20 } : {}}
            animate={isMobile ? { opacity: 1, y: 0 } : {}}
            transition={isMobile ? { duration: 0.6, delay: 1.2 } : {}}
          >
            {/* Stats row */}
            <div className="hero-stat-row">
              {[
                { val: "2K+", label: "Artists" },
                { val: "98%", label: "Satisfaction" },
                { val: "4.9★", label: "Rating" },
              ].map(s => (
                <div key={s.label} className="hero-stat">
                  <div className="hero-stat-val">{s.val}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <LiquidButton
              onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </LiquidButton>

            <AwardBadge type="product-of-the-day" place={2} />
          </motion.div>
        </div>
      </div>
    </>
  )
}
