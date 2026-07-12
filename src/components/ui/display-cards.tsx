"use client"

import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface DisplayCardProps {
  className?: string
  icon?: React.ReactNode
  title?: string
  description?: string
  date?: string
  iconClassName?: string
  titleClassName?: string
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4" style={{ color: "#FFD700" }} />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  titleClassName = "",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-2xl border-2 backdrop-blur-sm px-5 py-4 transition-all duration-700",
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-black after:to-transparent after:content-['']",
        "hover:border-white/25 [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
      style={{ background: "rgba(17,17,17,0.75)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div>
        <span className="relative inline-block rounded-full p-1.5" style={{ background: "rgba(255,215,0,0.12)" }}>
          {icon}
        </span>
        <p className={cn("text-lg font-black tracking-tight text-white", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-base font-bold tracking-wide text-white/85">{description}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{date}</p>
    </div>
  )
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[]
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-black/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-black/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ]

  const displayCards = cards || defaultCards

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  )
}
