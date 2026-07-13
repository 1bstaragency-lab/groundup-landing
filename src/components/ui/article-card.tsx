"use client"
import { motion } from "framer-motion"
import { Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CARD, FAINT } from "../../lib/dashboard-theme"

export interface ArticleCardProps {
  cover?: string
  coverGradient?: string
  tag: string
  tagColor?: string
  readingTime: string
  headline: string
  excerpt: string
  writer: string
  publishedAt: string
  href?: string
  className?: string
}

export function ArticleCard({
  cover, coverGradient = "from-zinc-800 to-zinc-900",
  tag, tagColor = "#FFD700", readingTime, headline, excerpt,
  writer, publishedAt, href, className,
}: ArticleCardProps) {
  const Tag = href ? "a" : "div"
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className={cn("group", className)}>
      <Tag
        href={href}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        className="block rounded-2xl overflow-hidden hover:border-[rgba(var(--dash-fg),0.2)] transition-all duration-300 cursor-pointer"
        style={{ background: CARD, border: `1px solid ${FAINT}` }}
      >
        {/* Cover */}
        <div className="relative overflow-hidden h-36">
          {cover ? (
            <img src={cover} alt={headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${coverGradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />

          {/* Tag pill */}
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-sm"
            style={{ background: `${tagColor}22`, border: `1px solid ${tagColor}40`, color: tagColor }}
          >
            {tag}
          </span>

          {/* Reading time */}
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-[9px] font-bold text-white/60 backdrop-blur-sm">
            <Clock size={8} /> {readingTime}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-[rgb(var(--dash-fg))] font-black text-[13px] leading-snug uppercase tracking-tight mb-1.5 group-hover:text-[#FFD700] transition-colors line-clamp-2">
            {headline}
          </h3>
          <p className="text-[rgba(var(--dash-fg),0.52)] text-[11px] leading-relaxed line-clamp-2 mb-3">{excerpt}</p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${FAINT}` }}>
            <div>
              <p className="text-[rgba(var(--dash-fg),0.56)] text-[10px] font-bold">{writer}</p>
              <p className="text-[rgba(var(--dash-fg),0.45)] text-[9px]">{publishedAt}</p>
            </div>
            <ArrowRight
              size={14}
              className="text-[rgba(var(--dash-fg),0.4)] group-hover:text-[#FFD700] group-hover:translate-x-0.5 transition-all duration-200"
            />
          </div>
        </div>
      </Tag>
    </motion.div>
  )
}
