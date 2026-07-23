/**
 * Site-wide smooth scroll (Lenis).
 * https://github.com/darkroomengineering/lenis
 *
 * Deliberately has no GSAP import here — GSAP is a lazy dependency (only
 * pulled in by CinematicFooter's chunk), and this component is mounted at
 * the app root, so importing it here would drag GSAP into every route's
 * initial bundle. The ScrollTrigger sync lives in motion-footer.tsx instead,
 * reading this same Lenis instance via the `useLenis` hook.
 */
import type { ReactNode } from 'react'
import { ReactLenis } from 'lenis/react'

export function SmoothScroll({ children }: { children: ReactNode }) {
  return <ReactLenis root>{children}</ReactLenis>
}
