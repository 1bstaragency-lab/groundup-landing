"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ── CSS vars exactly from kristen17/course-design-cards ─────────────────────
// --clr-blue:   #1890ff   --clr-green: #01c3a8
// --clr-orange: #ffb741   --clr-red:   #a63d2a
// --bg-dark:    #232228   --bg-footer: #151419

const STYLES = `
  .cdc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }

  .cdc-card {
    background: #232228;
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .cdc-card.done { opacity: 0.45; }

  /* top accent strip */
  .cdc-strip {
    height: 3px;
    width: 100%;
  }

  /* header */
  .cdc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 4px;
  }
  .cdc-date {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .cdc-ellipsis {
    color: #555;
    cursor: pointer;
    line-height: 0;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.15s;
  }
  .cdc-ellipsis:hover { color: #aaa; }

  /* body */
  .cdc-body {
    padding: 8px 16px 14px;
    flex: 1;
  }
  .cdc-title {
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    line-height: 1.25;
    margin: 0 0 6px;
  }
  .cdc-title.done-title {
    text-decoration: line-through;
    color: rgba(255,255,255,0.3);
  }
  .cdc-desc {
    color: #777;
    font-size: 10.5px;
    line-height: 1.55;
    margin: 0 0 14px;
  }

  /* progress */
  .cdc-progress {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cdc-progress-label {
    font-size: 8.5px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #444;
    white-space: nowrap;
  }
  .cdc-progress-track {
    flex: 1;
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 99px;
    overflow: hidden;
  }
  .cdc-progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.9s ease;
  }
  .cdc-progress-value {
    font-size: 8.5px;
    font-weight: 900;
    color: #444;
    white-space: nowrap;
  }

  /* footer */
  .cdc-footer {
    background: #151419;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cdc-avatars {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .cdc-avatars li + li { margin-left: -6px; }
  .cdc-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid #232228;
    background: #2e2d34;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: 900;
    color: #aaa;
    cursor: default;
  }
  .cdc-btn-add {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1.5px dashed rgba(255,255,255,0.18);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.25);
    transition: border-color 0.15s, color 0.15s;
    margin-left: 4px;
  }
  .cdc-btn-add:hover {
    border-color: rgba(255,215,0,0.5);
    color: rgba(255,215,0,0.7);
  }
  .cdc-btn-countdown {
    font-size: 8.5px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 5px 11px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: opacity 0.15s;
  }
  .cdc-btn-countdown:hover { opacity: 0.8; }
`

type TaskCategory = "Creative" | "Admin" | "Marketing" | "Social" | "Distribution"

// Maps to the 4 CSS-var colors from the original
const CAT_COLOR: Record<TaskCategory, { hex: string; bg: string; text: string }> = {
  Creative:     { hex: "#FFD700", bg: "rgba(255,215,0,0.18)",   text: "#000" },
  Admin:        { hex: "#1890ff", bg: "rgba(24,144,255,0.18)",  text: "#fff" },
  Marketing:    { hex: "#ffb741", bg: "rgba(255,183,65,0.18)",  text: "#000" },
  Social:       { hex: "#f43f5e", bg: "rgba(244,63,94,0.18)",   text: "#fff" },
  Distribution: { hex: "#01c3a8", bg: "rgba(1,195,168,0.18)",   text: "#000" },
}

interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  date: string
  countdown: string
  progressPercent: number
  done: boolean
  initials: string[]
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
    description: "Create and publish Spotify pre-save via Hypeddit before campaign.",
    progressPercent: 30, done: false, initials: ["AK"],
  },
  {
    id: "3", title: "Social Strategy Review", category: "Social",
    date: "Oct 10", countdown: "4 days left",
    description: "Approve monthly content calendar and brief social team.",
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

// Ellipsis icon (from original source)
function EllipsisIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
    </svg>
  )
}

// Add icon (from original source)
function AddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  )
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const c = CAT_COLOR[task.category]

  return (
    <motion.div
      layout
      className={`cdc-card${task.done ? " done" : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: task.done ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
    >
      {/* Colored top strip */}
      <div className="cdc-strip" style={{ background: c.hex }} />

      {/* Header */}
      <div className="cdc-header">
        <span className="cdc-date" style={{ color: c.hex }}>{task.date}</span>
        <button className="cdc-ellipsis"><EllipsisIcon /></button>
      </div>

      {/* Body */}
      <div className="cdc-body">
        <h3 className={`cdc-title${task.done ? " done-title" : ""}`}>{task.title}</h3>
        <p className="cdc-desc">{task.description}</p>

        {/* Progress row */}
        <div className="cdc-progress">
          <span className="cdc-progress-label">Progress</span>
          <div className="cdc-progress-track">
            <motion.div
              className="cdc-progress-fill"
              style={{ background: c.hex }}
              initial={{ width: 0 }}
              animate={{ width: `${task.progressPercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            />
          </div>
          <span className="cdc-progress-value">{task.progressPercent}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="cdc-footer">
        {/* Avatar list */}
        <ul className="cdc-avatars">
          {task.initials.map((init, i) => (
            <li key={i}>
              <div className="cdc-avatar">{init}</div>
            </li>
          ))}
          <li>
            <button className="cdc-btn-add" onClick={() => onToggle(task.id)}>
              <AddIcon />
            </button>
          </li>
        </ul>

        {/* Countdown badge */}
        <span
          className="cdc-btn-countdown"
          style={{ background: task.done ? "rgba(255,255,255,0.06)" : c.bg, color: task.done ? "#555" : c.hex === "#FFD700" || c.hex === "#ffb741" || c.hex === "#01c3a8" ? c.hex : "#fff" }}
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
    <>
      <style>{STYLES}</style>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ color: "#fff", fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0 }}>{title}</p>
          <p style={{ color: "#555", fontSize: 10, fontWeight: 700, marginTop: 2 }}>{active.length} active · {done.length} completed</p>
        </div>
        {done.length > 0 && (
          <button
            onClick={() => setShowDone(v => !v)}
            style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", background: "none", border: "none", cursor: "pointer" }}
          >
            {showDone ? "Hide done" : "Show done"}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="cdc-grid">
        <AnimatePresence mode="popLayout">
          {active.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}
          {showDone && done.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}
        </AnimatePresence>
      </div>

      {active.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "32px 0", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16, marginTop: 12 }}
        >
          <p style={{ color: "#444", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em" }}>All tasks complete</p>
        </motion.div>
      )}
    </>
  )
}
