"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, MoreHorizontal, Plus } from "lucide-react"

type TaskCategory = "Creative" | "Admin" | "Marketing" | "Social" | "Distribution"

interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  date: string
  countdown: string
  progressPercent: number
  done: boolean
  initials?: string[]
}

// Color accent per category (matches the clr-blue/green/orange/red pattern from the original)
const CATEGORY_COLOR: Record<TaskCategory, { bar: string; badge: string; text: string; bg: string }> = {
  Creative:     { bar: "#a855f7", badge: "rgba(168,85,247,0.18)",  text: "#a855f7", bg: "rgba(168,85,247,0.06)" },
  Admin:        { bar: "#1890ff", badge: "rgba(24,144,255,0.18)",  text: "#60a5fa", bg: "rgba(24,144,255,0.06)" },
  Marketing:    { bar: "#ffb741", badge: "rgba(255,183,65,0.18)",  text: "#fbbf24", bg: "rgba(255,183,65,0.06)" },
  Social:       { bar: "#f43f5e", badge: "rgba(244,63,94,0.18)",   text: "#f43f5e", bg: "rgba(244,63,94,0.06)" },
  Distribution: { bar: "#01c3a8", badge: "rgba(1,195,168,0.18)",   text: "#2dd4bf", bg: "rgba(1,195,168,0.06)" },
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1", title: "Finalize Artwork", category: "Creative",
    date: "Oct 8", countdown: "2 days left",
    description: "Submit hi-res cover art for 'Midnight City' to distributor.",
    progressPercent: 65, done: false, initials: ["AK", "JB"],
  },
  {
    id: "2", title: "Pre-Save Link Setup", category: "Distribution",
    date: "Oct 9", countdown: "3 days left",
    description: "Create and publish Spotify pre-save via Hypeddit before campaign goes live.",
    progressPercent: 30, done: false, initials: ["AK"],
  },
  {
    id: "3", title: "Social Strategy Review", category: "Social",
    date: "Oct 10", countdown: "4 days left",
    description: "Approve monthly content calendar and brief social team on launch week.",
    progressPercent: 50, done: false, initials: ["JB", "MR"],
  },
  {
    id: "4", title: "Tour Date Contracts", category: "Admin",
    date: "Oct 12", countdown: "6 days left",
    description: "Lock in signed venue contracts for all November tour dates.",
    progressPercent: 80, done: false, initials: ["AK"],
  },
  {
    id: "5", title: "TikTok Campaign Brief", category: "Marketing",
    date: "Oct 14", countdown: "8 days left",
    description: "Brief creative team on hooks, posting schedule, and UGC strategy.",
    progressPercent: 10, done: false, initials: ["MR", "JB"],
  },
  {
    id: "6", title: "Spotify Editorial Pitch", category: "Distribution",
    date: "Oct 7", countdown: "Done",
    description: "Submitted 'Midnight City' via Spotify for Artists editorial pitching.",
    progressPercent: 100, done: true, initials: ["AK"],
  },
]

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-6 h-6 rounded-full bg-zinc-700 border border-white/10 flex items-center justify-center">
      <span className="text-[8px] font-black text-white/60">{initials}</span>
    </div>
  )
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const c = CATEGORY_COLOR[task.category]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: task.done ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      className="rounded-2xl overflow-hidden border border-white/[0.07] flex flex-col"
      style={{ background: "#18181b" }}
    >
      {/* Colored top accent bar */}
      <div className="h-[3px] w-full" style={{ background: c.bar }} />

      {/* Header: date + menu */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: c.text }}>
          {task.date}
        </span>
        <button className="text-white/20 hover:text-white/50 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1">
        <h4 className={`text-white font-black text-[13px] uppercase tracking-tight leading-snug mb-1 ${task.done ? "line-through text-white/30" : ""}`}>
          {task.title}
        </h4>
        <p className="text-white/35 text-[10px] leading-relaxed mb-4">{task.description}</p>

        {/* Progress */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">Progress</span>
          <span className="text-[9px] font-black" style={{ color: c.text }}>{task.progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: c.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${task.progressPercent}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          />
        </div>
      </div>

      {/* Footer: avatars + countdown */}
      <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-white/5 mt-1">
        {/* Avatars + add */}
        <div className="flex items-center gap-1">
          {(task.initials ?? []).map((init, i) => (
            <div key={i} className="-ml-1 first:ml-0">
              <Avatar initials={init} />
            </div>
          ))}
          <button
            onClick={() => onToggle(task.id)}
            className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:border-[#FFD700]/40 transition-colors ml-1"
          >
            {task.done
              ? <CheckCircle2 size={11} style={{ color: c.bar }} />
              : <Plus size={10} className="text-white/30" />
            }
          </button>
        </div>

        {/* Countdown pill */}
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{
            background: task.done ? "rgba(255,255,255,0.05)" : c.badge,
            color: task.done ? "rgba(255,255,255,0.2)" : c.text,
          }}
        >
          {task.countdown}
        </span>
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

      {/* Card grid */}
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
          <CheckCircle2 size={22} className="text-[#FFD700]/40 mx-auto mb-2" />
          <p className="text-white/25 text-[11px] font-black uppercase tracking-widest">All tasks complete</p>
        </motion.div>
      )}
    </div>
  )
}
