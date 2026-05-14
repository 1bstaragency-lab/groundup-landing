"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, ChevronRight, Sparkles } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low"
  done: boolean
}

interface MorphingCardStackProps {
  tasks?: Task[]
  title?: string
}

const PRIORITY_COLORS = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-green-400 bg-green-400/10 border-green-400/20",
}

const DEFAULT_TASKS: Task[] = [
  { id: "1", title: "Upload cover art", description: "3000×3000px JPG or PNG for distribution", category: "Production", priority: "high", done: false },
  { id: "2", title: "Submit to distributor", description: "DistroKid, TuneCore, or your label portal", category: "Distribution", priority: "high", done: false },
  { id: "3", title: "Create pre-save link", description: "Set up SmartURL or ToneDen pre-save campaign", category: "Marketing", priority: "medium", done: false },
  { id: "4", title: "Draft press release", description: "250-word bio + release context for blogs", category: "PR", priority: "medium", done: false },
  { id: "5", title: "Schedule social posts", description: "Tease content 2 weeks before drop date", category: "Social", priority: "low", done: false },
]

export function MorphingCardStack({ tasks = DEFAULT_TASKS, title = "Release Checklist" }: MorphingCardStackProps) {
  const [items, setItems] = useState<Task[]>(tasks)
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(id: string) {
    setItems(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const done = items.filter(t => t.done).length
  const total = items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#FFD700]" />
          <h3 className="text-white font-black text-sm uppercase tracking-widest">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#FFD700] font-black text-sm">{pct}%</span>
          <span className="text-white/20 text-[10px] font-black uppercase">{done}/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-[#FFD700] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Card stack */}
      <AnimatePresence>
        {items.map((task, i) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className={`relative rounded-2xl border transition-all cursor-pointer ${
              task.done
                ? "bg-[#FFD700]/5 border-[#FFD700]/10"
                : "bg-zinc-900/40 border-white/5 hover:border-white/10"
            }`}
            onClick={() => setExpanded(expanded === task.id ? null : task.id)}
          >
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={e => { e.stopPropagation(); toggle(task.id) }}
                className="shrink-0 transition-transform hover:scale-110"
              >
                {task.done
                  ? <CheckCircle2 size={18} className="text-[#FFD700]" />
                  : <Circle size={18} className="text-white/20" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${task.done ? "text-white/30 line-through" : "text-white"}`}>
                  {task.title}
                </p>
                <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${PRIORITY_COLORS[task.priority]}`}>
                  {task.category}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`text-white/20 transition-transform shrink-0 ${expanded === task.id ? "rotate-90" : ""}`}
              />
            </div>

            <AnimatePresence>
              {expanded === task.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 border-t border-white/5">
                    <p className="text-white/40 text-xs font-medium mt-3 leading-relaxed">{task.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { MorphingCardStack as Component }
