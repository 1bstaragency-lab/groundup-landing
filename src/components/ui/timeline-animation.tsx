import * as React from "react"
import { motion, useInView, type Variants } from "framer-motion"

interface TimelineContentProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof typeof motion
  animationNum: number
  timelineRef: React.RefObject<HTMLElement | null>
  customVariants: Variants
  children: React.ReactNode
}

/**
 * Scroll-triggered reveal wrapper. Renders as the given `as` motion tag,
 * watches `timelineRef` for viewport entry, then plays `customVariants`
 * with `animationNum` passed through as the variant's `custom` index —
 * so staggered delays can be computed as `i * delayStep` in the variant.
 */
export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  children,
  ...props
}: TimelineContentProps) {
  const inView = useInView(timelineRef, { once: true, margin: "-80px" })
  const MotionTag = motion[as] as React.ElementType

  return (
    <MotionTag
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={customVariants}
      {...props}
    >
      {children}
    </MotionTag>
  )
}

export default TimelineContent
