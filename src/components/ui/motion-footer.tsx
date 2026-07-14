"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { WAITLIST_MODE } from "../../lib/featureFlags";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  font-family: 'Inter', sans-serif;
  --pill-bg-1: rgba(255, 215, 0, 0.05);
  --pill-bg-2: rgba(255, 215, 0, 0.02);
  --pill-border: rgba(255, 215, 0, 0.1);
  --pill-border-hover: rgba(255, 215, 0, 0.4);
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255, 215, 0, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 215, 0, 0.03) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  border-color: var(--pill-border-hover);
  background: rgba(255, 215, 0, 0.1);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 950;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 215, 0, 0.05);
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}
`;

const MagneticButton = React.forwardRef<HTMLElement, any>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = localRef.current;
      if (!element) return;
      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(element, { x: x * 0.4, y: y * 0.4, scale: 1.05, duration: 0.4 });
        };
        const handleMouseLeave = () => {
          gsap.to(element, { x: 0, y: 0, scale: 1, ease: "elastic.out(1, 0.3)", duration: 1.2 });
        };
        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
      return () => ctx.revert();
    },[]);

    return (
      <Component
        ref={(node: any) => { (localRef as any).current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) (forwardedRef as any).current = node; }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>A&R Redefined</span> <span className="text-[#FFD700]/60">✦</span>
    <span>Transparent Tracking</span> <span className="text-[#FFD700]/60">✦</span>
    <span>Management OS</span> <span className="text-[#FFD700]/60">✦</span>
    <span>Artist Growth</span> <span className="text-[#FFD700]/60">✦</span>
    <span>Absolute Privacy</span> <span className="text-[#FFD700]/60">✦</span>
  </div>
);

export function CinematicFooter({ onViewDemo }: { onViewDemo?: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(giantTextRef.current, { y: "10vh", opacity: 0 }, {
        y: "0vh", opacity: 1, scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 }
      });
    }, wrapperRef);
    return () => ctx.revert();
  },[]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={wrapperRef} className="relative h-[80vh] w-full mt-20" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
        <footer className="fixed bottom-0 left-0 flex h-[80vh] w-full flex-col justify-between overflow-hidden bg-black text-white cinematic-footer-wrapper">
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />
          <div ref={giantTextRef} className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none uppercase">
            GROUNDUP
          </div>

          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-white/5 bg-black/60 backdrop-blur-md py-4 z-10 -rotate-1 scale-105 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-black tracking-[0.3em] text-white/20 uppercase">
              <MarqueeItem /><MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-12 text-center leading-none">
              Ready to scale<br/><span className="text-[#FFD700]">your sound?</span>
            </h2>

            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton as="a" href="#signup" className="footer-glass-pill px-12 py-6 rounded-full text-[#FFD700] font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  {WAITLIST_MODE ? "Join Waitlist" : "Get Started"}
                </MagneticButton>
                <MagneticButton as="button" onClick={onViewDemo} className="footer-glass-pill px-12 py-6 rounded-full text-white/60 font-black text-sm uppercase tracking-widest hover:text-white transition-colors">
                  View Demo
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="relative z-20 w-full pb-12 px-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="text-white/20 text-[10px] font-black tracking-widest uppercase">
              © 2026 GROUNDUP. ALL RIGHTS RESERVED.
            </div>
            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 cursor-default border-white/5">
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Built for the</span>
              <span className="text-[#FFD700] font-black text-xs tracking-widest ml-1">NEW WAVE</span>
            </div>
            <MagneticButton as="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-[#FFD700] group">
              <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
