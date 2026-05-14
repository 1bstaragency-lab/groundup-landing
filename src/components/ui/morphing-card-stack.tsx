"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Grid3X3, Layers, LayoutList, Music2, Share2, Bookmark, Radio, Users, Rocket, BarChart2, MapPin, Star } from "lucide-react"

export type LayoutMode = "stack" | "grid" | "list"

export interface CardData {
  id: string
  title: string
  description: string
  icon?: ReactNode
  color?: string
}

export interface MorphingCardStackProps {
  cards?: CardData[]
  className?: string
  defaultLayout?: LayoutMode
  title?: string
  onCardClick?: (card: CardData) => void
  tasks?: unknown // accepted but ignored — kept for compat
}

const DEFAULT_CARDS: CardData[] = [
  { id: "1", title: "Upload Cover Art",       description: "3000×3000px JPG or PNG for all platforms",      icon: <Music2 className="h-5 w-5" /> },
  { id: "2", title: "Submit to Distributor",  description: "DistroKid, TuneCore, or your label portal",     icon: <Share2 className="h-5 w-5" /> },
  { id: "3", title: "Create Pre-Save Link",   description: "Set up SmartURL or ToneDen pre-save campaign",  icon: <Bookmark className="h-5 w-5" /> },
  { id: "4", title: "Pitch to Playlist Curators", description: "Submit 4–6 weeks before release date",      icon: <Radio className="h-5 w-5" /> },
  { id: "5", title: "Schedule Social Posts",  description: "Tease content 2 weeks before drop date",        icon: <Rocket className="h-5 w-5" /> },
  { id: "6", title: "Analytics Report",       description: "Review streams, saves, and conversion rates",   icon: <BarChart2 className="h-5 w-5" /> },
  { id: "7", title: "Book Press Interviews",  description: "Reach out to blogs and podcast hosts",          icon: <MapPin className="h-5 w-5" /> },
  { id: "8", title: "Fan Engagement Push",    description: "Reply to comments, DMs, and story mentions",   icon: <Users className="h-5 w-5" /> },
]

const layoutIcons = {
  stack: Layers,
  grid:  Grid3X3,
  list:  LayoutList,
}

const SWIPE_THRESHOLD = 50

export function MorphingCardStack({
  cards = DEFAULT_CARDS,
  className,
  defaultLayout = "stack",
  title,
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout]           = useState<LayoutMode>(defaultLayout)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging]   = useState(false)

  if (!cards || cards.length === 0) return null

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x
    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000)
      setActiveIndex(prev => (prev + 1) % cards.length)
    else if (offset.x > SWIPE_THRESHOLD || swipe > 1000)
      setActiveIndex(prev => (prev - 1 + cards.length) % cards.length)
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < Math.min(cards.length, 4); i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i })
    }
    return reordered.reverse()
  }

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case "stack":
        return { top: stackPosition * 10, left: stackPosition * 10, zIndex: 10 - stackPosition, rotate: (stackPosition - 1) * 2.5 }
      default:
        return { top: 0, left: 0, zIndex: 1, rotate: 0 }
    }
  }

  const containerStyles: Record<LayoutMode, string> = {
    stack: "relative h-64 w-64",
    grid:  "grid grid-cols-2 gap-3",
    list:  "flex flex-col gap-3",
  }

  const displayCards = layout === "stack"
    ? getStackOrder()
    : cards.map((c, i) => ({ ...c, stackPosition: i }))

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        </div>
      )}

      {/* Layout toggle */}
      <div className="flex items-center justify-center gap-1 rounded-xl bg-zinc-900/60 border border-white/5 p-1 w-fit mx-auto">
        {(Object.keys(layoutIcons) as LayoutMode[]).map(mode => {
          const Icon = layoutIcons[mode]
          return (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                "rounded-lg p-2 transition-all",
                layout === mode
                  ? "bg-[#FFD700] text-black shadow-[0_0_12px_rgba(255,215,0,0.4)]"
                  : "text-white/30 hover:text-white hover:bg-white/5"
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      {/* Cards container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout], "mx-auto")}>
          <AnimatePresence mode="popLayout">
            {displayCards.map(card => {
              const styles     = getLayoutStyles(card.stackPosition)
              const isExpanded = expandedCard === card.id
              const isTopCard  = layout === "stack" && card.stackPosition === 0

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: isExpanded ? 1.03 : 1, x: 0, ...styles }}
                  exit={{ opacity: 0, scale: 0.85, x: -200 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return
                    setExpandedCard(isExpanded ? null : card.id)
                    onCardClick?.(card)
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl border bg-zinc-900/80 backdrop-blur-sm",
                    "border-white/8 hover:border-[#FFD700]/20 transition-colors",
                    layout === "stack" && "absolute w-56 h-48",
                    layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing",
                    layout === "grid"  && "w-full aspect-square",
                    layout === "list"  && "w-full",
                    isExpanded && "ring-1 ring-[#FFD700]/40",
                    isTopCard  && "shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                  )}
                >
                  <div className="flex items-start gap-3 p-4">
                    {card.icon && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-white/60">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-white truncate">{card.title}</h3>
                      <p className={cn(
                        "text-xs text-white/40 mt-1 leading-relaxed",
                        layout === "stack" && "line-clamp-3",
                        layout === "grid"  && "line-clamp-2",
                        layout === "list"  && "line-clamp-1",
                      )}>
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {isTopCard && (
                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <span className="text-[10px] text-white/20 font-medium">Swipe to navigate</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Dot pagination (stack only) */}
      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-5 bg-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.6)]"
                  : "w-1.5 bg-white/15 hover:bg-white/30"
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { MorphingCardStack as Component }
