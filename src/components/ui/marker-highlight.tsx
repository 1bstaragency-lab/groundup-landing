"use client"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface MarkerHighlightProps {
  children: string
  color?: string
  textColor?: string
  delay?: number
  className?: string
}

export function MarkerHighlight({ children, color = "#FFD700", textColor = "#000", delay = 0, className }: MarkerHighlightProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  return (
    <span ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <motion.span
        aria-hidden
        className="absolute inset-y-0 -inset-x-1 origin-left"
        style={{ background: color, zIndex: 0, borderRadius: 2 }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="relative"
        style={{ zIndex: 1 }}
        initial={{ color: "inherit" }}
        animate={inView ? { color: textColor } : { color: "inherit" }}
        transition={{ duration: 0.2, delay: delay + 0.3 }}
      >
        {children}
      </motion.span>
    </span>
  )
}
