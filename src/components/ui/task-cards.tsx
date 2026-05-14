"use client"
import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, CheckCircle2, Circle, ChevronRight, Flame, Clock } from "lucide-react"

type TaskCategory = "Creative" | "Admin" | "Marketing" | "Social" | "Distribution"

interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  dueDate: string
  progress: number
  priority: "high" | "medium" | "low"
  done: boolean
}

const CATEGORY_STYLES: Record<TaskCategory, { bg: string; border: string; text: string; bar: string }> = {
  Creative:     { bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.2)", text: "#a855f7", bar: "#a855f7" },
  Admin:        { bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)", text: "#3b82f6", bar: "#3b82f6" },
  Marketing:    { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)", text: "#f59e0b", bar: "#f59e0b" },
  Social:       { bg: "rgba(244,63,94,0.08)",   border: "rgba(244,63,94,0.2)",  text: "#f43f5e", bar: "#f43f5e" },
  Distribution: { bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)",  text: "#22c55e", bar: "#22c55e" },
}

const PRIORITY_ICON: Record<Task["priority"], React.ReactElement> = {
  high:   <Flame size={9} className="text-rose-400" />,
  medium: <Clock size={9} className="text-amber-400/70" />,
  low:    <Clock size={9} className="text-white/20" />,
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1", title: "Finalize Artwork", category: "Creative", dueDate: "Oct 8",
    description: "Submit hi-res cover art for 'Midnight City' release to distributor.",
    progress: 65, priority: "high", done: false,
  },
  {
    id: "2", title: "Pre-Save Link Setup", category: "Distribution", dueDate: "Oct 9",
    description: "Create and publish Spotify pre-save via Hypeddit before campaign goes live.",
    progress: 30, priority: "high", done: false,
  },
  {
    id: "3", title: "Social Strategy Review", category: "Social", dueDate: "Oct 10",
    description: "Approve monthly content calendar and brief social team on launch week.",
    progress: 50, priority: "medium", done: false,
  },
  {
    id: "4", title: "Tour Date Contracts", category: "Admin", dueDate: "Oct 12",
    description: "Lock in signed venue contracts for all November tour dates.",
    progress: 80, priority: "high", done: false,
  },
  {
    id: "5", title: "TikTok Campaign Brief", category: "Marketing", dueDate: "Oct 14",
    description: "Brief creative team on hooks, posting schedule, and UGC strategy.",
    progress: 10, priority: "medium", done: false,
  },
  {
    id: "6", title: "Spotify Editorial Pitch", category: "Distribution", dueDate: "Oct 7",
    description: "Submit 'Midnight City' via Spotify for Artists editorial pitching tool.",
    progress: 100, priority: "high", done: true,
  },
]

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const style = CATEGORY_STYLES[task.category]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: task.done ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className="relative rounded-2xl p-4 transition-all group"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      {/* Top meta row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: style.text }}>
          {task.category}
        </span>
        <div className="flex items-center gap-2">
          {PRIORITY_ICON[task.priority]}
          <div className="flex items-center gap-1 text-white/25 text-[9px] font-bold">
            <Calendar size={8} /> {task.dueDate}
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 className={`text-white font-black text-[13px] uppercase tracking-tight leading-snug mb-1 transition-colors ${task.done ? "line-through text-white/30" : "group-hover:text-white"}`}>
        {task.title}
      </h4>
      <p className="text-white/30 text-[10px] leading-relaxed mb-3">{task.description}</p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Progress</span>
          <span className="text-[9px] font-black" style={{ color: style.text }}>{task.progress}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: style.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
        <button
          onClick={() => onToggle(task.id)}
          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white transition-colors"
        >
          {task.done
            ? <CheckCircle2 size={11} style={{ color: style.text }} />
            : <Circle size={11} />
          }
          {task.done ? "Completed" : "Mark done"}
        </button>
        <ChevronRight size={12} className="text-white/15 group-hover:text-white/40 transition-colors" />
      </div>
    </motion.div>
  )
}

interface TaskCardsProps {
  title?: string
}

export function TaskCards({ title = "Quick Tasks" }: TaskCardsProps) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [showDone, setShowDone] = useState(false)

  const active = tasks.filter(t => !t.done)
  const done   = tasks.filter(t => t.done)

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-tight">{title}</h3>
          <p className="text-white/25 text-[10px] font-bold mt-0.5">
            {active.length} active · {done.length} completed
          </p>
        </div>
        {done.length > 0 && (
          <button
            onClick={() => setShowDone(v => !v)}
            className="text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors"
          >
            {showDone ? "Hide done" : "Show done"}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {active.map(task => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} />
          ))}
          {showDone && done.map(task => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </AnimatePresence>
      </div>

      {active.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 border border-dashed border-white/8 rounded-2xl"
        >
          <CheckCircle2 size={24} className="text-[#FFD700]/40 mx-auto mb-2" />
          <p className="text-white/30 text-[11px] font-black uppercase tracking-widest">All tasks complete</p>
        </motion.div>
      )}
    </div>
  )
}
