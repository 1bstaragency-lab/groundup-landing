"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, X, Rocket, CheckCircle2 } from "lucide-react"
import { GOLDD } from "../../lib/brand-tokens"
import { INK, DIM, FAINT } from "../../lib/dashboard-theme"

const POINTS_PER_TASK = 100

// ── CSS (kristen17/course-design-cards structure, converted to silver/white) ─
const STYLES = `
  .cdc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }
  .cdc-card {
    background: var(--dash-card);
    border: 1px solid ${FAINT};
    border-radius: 18px;
    overflow: visible;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .cdc-strip { height: 3px; width: 100%; border-radius: 18px 18px 0 0; }
  .cdc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 14px 4px;
    position: relative;
  }
  .cdc-date {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .cdc-menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(var(--dash-fg),0.56);
    padding: 2px 4px;
    border-radius: 4px;
    line-height: 0;
    transition: color 0.15s;
    position: relative;
  }
  .cdc-menu-btn:hover { color: ${INK}; }
  .cdc-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--dash-card);
    border: 1px solid ${FAINT};
    border-radius: 10px;
    overflow: hidden;
    z-index: 50;
    min-width: 150px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .cdc-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 9px 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${DIM};
    text-align: left;
    transition: background 0.1s, color 0.1s;
  }
  .cdc-dropdown-btn:hover { background: rgba(var(--dash-fg),0.04); color: ${INK}; }
  .cdc-dropdown-btn.danger:hover { color: #DC2626; }
  .cdc-body { padding: 8px 14px 13px; flex: 1; }
  .cdc-title {
    color: ${INK};
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    line-height: 1.25;
    margin: 0 0 5px;
  }
  .cdc-desc {
    color: ${DIM};
    font-size: 10.5px;
    line-height: 1.55;
    margin: 0 0 13px;
  }
  .cdc-progress { display: flex; align-items: center; gap: 8px; }
  .cdc-progress-label {
    font-size: 8.5px; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: rgba(var(--dash-fg),0.56); white-space: nowrap;
  }
  .cdc-progress-track {
    flex: 1; height: 3px;
    background: rgba(var(--dash-fg),0.06);
    border-radius: 99px; overflow: hidden;
  }
  .cdc-progress-fill { height: 100%; border-radius: 99px; }
  .cdc-progress-value { font-size: 8.5px; font-weight: 900; color: rgba(var(--dash-fg),0.56); white-space: nowrap; }
  .cdc-footer {
    background: rgba(var(--dash-fg),0.02);
    border-top: 1px solid ${FAINT};
    padding: 10px 14px;
    display: flex; align-items: center; justify-content: space-between;
    border-radius: 0 0 18px 18px;
  }
  .cdc-avatars { display: flex; align-items: center; list-style: none; margin: 0; padding: 0; }
  .cdc-avatars li + li { margin-left: -6px; }
  .cdc-avatar {
    width: 24px; height: 24px; border-radius: 50%;
    border: 2px solid var(--dash-card); background: rgba(var(--dash-fg),0.06);
    display: flex; align-items: center; justify-content: center;
    font-size: 7.5px; font-weight: 900; color: ${DIM};
  }
  .cdc-btn-countdown {
    font-size: 8.5px; font-weight: 900;
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 5px 11px; border-radius: 999px;
    border: none; cursor: default;
    display: inline-block;
  }
`

// ── Types ────────────────────────────────────────────────────────────────────
type TaskCategory = "Creative" | "Admin" | "Marketing" | "Social" | "Distribution"

interface Release {
  id: string
  title: string
  type: "Single" | "EP" | "Album" | "Mixtape"
  release_date: string
  budget: string
  checklist: { label: string; done: boolean }[]
}

interface PoolTask {
  poolId: string
  title: string
  description: string  // use {title} and {type} as placeholders
  category: TaskCategory
  progressSeed: number // 0-100 starting progress
}

interface ActiveTask extends PoolTask {
  id: string
  releaseTitle: string
  countdown: string
  initials: string[]
}

// Category tags consolidated to a single gold-monochrome accent — was a
// decorative gold/blue/orange/pink/teal system per-category, didn't fit the
// brand's strict black/gold/white palette; the category label still carries
// the meaning.
const CAT_COLOR: Record<TaskCategory, { hex: string; bg: string }> = {
  Creative:     { hex: GOLDD, bg: "rgba(184,134,11,0.1)" },
  Admin:        { hex: GOLDD, bg: "rgba(184,134,11,0.1)" },
  Marketing:    { hex: GOLDD, bg: "rgba(184,134,11,0.1)" },
  Social:       { hex: GOLDD, bg: "rgba(184,134,11,0.1)" },
  Distribution: { hex: GOLDD, bg: "rgba(184,134,11,0.1)" },
}

// ── Deep task pool (30+ tactics) ─────────────────────────────────────────────
const TASK_POOL: PoolTask[] = [
  // Creative
  { poolId:"c1", category:"Creative", progressSeed:15, title:"Finalize Cover Art",
    description:"Submit final 3000×3000px artwork for '{title}' — include all variants for DSPs." },
  { poolId:"c2", category:"Creative", progressSeed:0, title:"Shoot Promo Photos",
    description:"Book photographer for press-ready campaign shots to accompany the '{title}' rollout." },
  { poolId:"c3", category:"Creative", progressSeed:30, title:"Music Video Treatment",
    description:"Write a one-page visual treatment for the '{title}' music video — mood, locations, concept." },
  { poolId:"c4", category:"Creative", progressSeed:10, title:"Lyric Video Assets",
    description:"Animate lyric video for '{title}' — release 48 hrs after the audio drop for continued momentum." },
  { poolId:"c5", category:"Creative", progressSeed:5, title:"EPK Update",
    description:"Refresh your Electronic Press Kit with '{title}' info, updated bio, and new press photos." },
  { poolId:"c6", category:"Creative", progressSeed:20, title:"Visualizer Clip",
    description:"Create a 60-second visualizer for '{title}' — YouTube & VEVO-ready, 4K if possible." },

  // Distribution
  { poolId:"d1", category:"Distribution", progressSeed:0, title:"Pre-Save Campaign",
    description:"Set up and push pre-save for '{title}' via Hypeddit or Feature.fm — target 14 days before drop." },
  { poolId:"d2", category:"Distribution", progressSeed:40, title:"Spotify Editorial Pitch",
    description:"Submit '{title}' to Spotify editorial at least 7 days pre-release via Spotify for Artists." },
  { poolId:"d3", category:"Distribution", progressSeed:0, title:"DSP Asset Upload",
    description:"Upload masters, artwork, credits, and ISRC codes for '{title}' to your distributor." },
  { poolId:"d4", category:"Distribution", progressSeed:10, title:"Apple Music Connect",
    description:"Post an exclusive Apple Music Connect update tied to the '{title}' release announcement." },
  { poolId:"d5", category:"Distribution", progressSeed:0, title:"Playlist Pitch",
    description:"Pitch '{title}' to 10 independent curators via SubmitHub or Groover before release day." },
  { poolId:"d6", category:"Distribution", progressSeed:0, title:"TIDAL Rising Submission",
    description:"Submit '{title}' to TIDAL Rising editorial — great for genre-specific playlist discovery." },

  // Marketing
  { poolId:"m1", category:"Marketing", progressSeed:5, title:"TikTok Hook Strategy",
    description:"Write 5 hook scripts for '{title}' — test the top 3 in the week before release." },
  { poolId:"m2", category:"Marketing", progressSeed:0, title:"Influencer Seeding",
    description:"Identify 10–15 micro-influencers in your genre and seed '{title}' audio before drop." },
  { poolId:"m3", category:"Marketing", progressSeed:20, title:"Release Day Ad Spend",
    description:"Set up Meta and TikTok ads for '{title}' — budget and creative brief due 5 days before." },
  { poolId:"m4", category:"Marketing", progressSeed:0, title:"Press Release Draft",
    description:"Write and send press release for '{title}' to blogs and outlets 10 days pre-release." },
  { poolId:"m5", category:"Marketing", progressSeed:10, title:"Blog Outreach",
    description:"Pitch '{title}' exclusively to 3 tier-2 blogs — offer a 24-hour premiere window." },
  { poolId:"m6", category:"Marketing", progressSeed:0, title:"Spotify Canvas",
    description:"Create a 3–8 second looping Spotify Canvas video for '{title}' — boosts stream time 5%." },
  { poolId:"m7", category:"Marketing", progressSeed:0, title:"Radio Submission",
    description:"Submit '{title}' to college radio stations and SoundExchange for digital radio tracking." },

  // Social
  { poolId:"s1", category:"Social", progressSeed:25, title:"Content Calendar",
    description:"Map 30 days of posts around '{title}' — teaser, pre-save, drop week, and sustain content." },
  { poolId:"s2", category:"Social", progressSeed:0, title:"Instagram Countdown",
    description:"Start a 7-day Instagram countdown story series building to the '{title}' release date." },
  { poolId:"s3", category:"Social", progressSeed:10, title:"Behind-the-Scenes Clips",
    description:"Post 3–5 BTS clips from the making of '{title}' — studio sessions, creative process." },
  { poolId:"s4", category:"Social", progressSeed:0, title:"Twitter/X Thread",
    description:"Write a story thread about the inspiration behind '{title}' — authentic narrative converts listeners." },
  { poolId:"s5", category:"Social", progressSeed:5, title:"YouTube Shorts Repurpose",
    description:"Cut the best 15–60 second moment from '{title}' content into 5 YouTube Shorts for release week." },
  { poolId:"s6", category:"Social", progressSeed:0, title:"Fan UGC Challenge",
    description:"Design a TikTok duet or cover challenge using '{title}' audio — post the call-to-action on drop day." },

  // Admin
  { poolId:"a1", category:"Admin", progressSeed:60, title:"Copyright Registration",
    description:"File '{title}' at copyright.gov — sound recording and composition separately if needed." },
  { poolId:"a2", category:"Admin", progressSeed:80, title:"Metadata QC",
    description:"Double-check all metadata for '{title}' — title, featured artists, producer credits, ISRC, ISWC." },
  { poolId:"a3", category:"Admin", progressSeed:0, title:"Performance Rights",
    description:"Register '{title}' with ASCAP, BMI, or SESAC to capture live and broadcast royalties." },
  { poolId:"a4", category:"Admin", progressSeed:0, title:"Sync License Setup",
    description:"Prepare a one-stop sync brief for '{title}' and list with a sync rep or platform like Musicbed." },
  { poolId:"a5", category:"Admin", progressSeed:40, title:"Royalty Split Sheet",
    description:"Finalize and sign split sheets for all contributors on '{title}' before distribution." },
  { poolId:"a6", category:"Admin", progressSeed:10, title:"Tour Rider Update",
    description:"Update your rider and stage plot to include '{title}' setlist requirements for upcoming dates." },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  return diff
}

function countdown(dateStr: string): string {
  const d = daysUntil(dateStr)
  if (d < 0)  return "Post-release"
  if (d === 0) return "Today"
  if (d === 1) return "1 day left"
  if (d <= 7)  return `${d} days left`
  if (d <= 14) return "~2 weeks"
  if (d <= 30) return "~1 month"
  return `${Math.ceil(d / 7)}w left`
}

function fillTemplate(tpl: string, releaseTitle: string) {
  return tpl.replace(/\{title\}/g, releaseTitle).replace(/\{type\}/g, "")
}

function pickInitial(name: string) {
  return name.split(" ").map(w => w[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "ME"
}

function buildTasks(release: Release, usedPoolIds: Set<string>): ActiveTask[] {
  const available = TASK_POOL.filter(p => !usedPoolIds.has(p.poolId))
  // Spread across categories
  const cats: TaskCategory[] = ["Creative", "Distribution", "Marketing", "Social", "Admin"]
  const picked: PoolTask[] = []
  for (const cat of cats) {
    const match = available.find(p => p.category === cat && !picked.includes(p))
    if (match) picked.push(match)
    if (picked.length >= 5) break
  }
  // Fill remaining if needed
  for (const p of available) {
    if (picked.length >= 5) break
    if (!picked.includes(p)) picked.push(p)
  }
  return picked.slice(0, 5).map(p => ({
    ...p,
    id: `${p.poolId}-${release.id}`,
    releaseTitle: release.title,
    countdown: release.release_date ? countdown(release.release_date) : "This week",
    initials: [pickInitial(release.title)],
  }))
}

// ── Sub-components ────────────────────────────────────────────────────────────
function EllipsisIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
      <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
    </svg>
  )
}

function TaskCard({
  task,
  onDismiss,
  onResuggest,
  onComplete,
}: {
  task: ActiveTask
  onDismiss: (id: string) => void
  onResuggest: (id: string) => void
  onComplete: (id: string) => void
}) {
  const c = CAT_COLOR[task.category]
  const [open, setOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  return (
    <motion.div
      layout
      className="cdc-card"
      initial={{ opacity: 0, y: 10 }}
      animate={celebrating ? { scale: [1, 1.03, 1], transition: { duration: 0.4 } } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      style={{ position: "relative" }}
    >
      {/* Celebrate flash */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 20,
              borderRadius: 18, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "rgba(var(--dash-fg-inv), 0.92)", backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {/* Success checkmark — kept semantic green */}
              <CheckCircle2 size={32} color="#16A34A" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ color: GOLDD, fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}
            >
              +{POINTS_PER_TASK} pts
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cdc-strip" style={{ background: c.hex }} />

      {/* Header */}
      <div className="cdc-header">
        <span className="cdc-date" style={{ color: c.hex }}>{task.category}</span>
        <div ref={menuRef} style={{ position: "relative" }}>
          <button className="cdc-menu-btn" onClick={() => setOpen(v => !v)}>
            <EllipsisIcon />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                className="cdc-dropdown"
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.12 }}
              >
                <button
                  className="cdc-dropdown-btn"
                  onClick={() => {
                    setOpen(false)
                    setCelebrating(true)
                    setTimeout(() => onComplete(task.id), 900)
                  }}
                >
                  <CheckCircle2 size={11} /> Mark Done · +{POINTS_PER_TASK}pts
                </button>
                <button
                  className="cdc-dropdown-btn"
                  onClick={() => { setOpen(false); onResuggest(task.id) }}
                >
                  <RefreshCw size={11} /> Re-suggest
                </button>
                <button
                  className="cdc-dropdown-btn danger"
                  onClick={() => { setOpen(false); onDismiss(task.id) }}
                >
                  <X size={11} /> Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="cdc-body">
        <h3 className="cdc-title">{task.title}</h3>
        <p className="cdc-desc">{fillTemplate(task.description, task.releaseTitle)}</p>
        <div className="cdc-progress">
          <span className="cdc-progress-label">Progress</span>
          <div className="cdc-progress-track">
            <motion.div
              className="cdc-progress-fill"
              style={{ background: c.hex }}
              initial={{ width: 0 }}
              animate={{ width: `${task.progressSeed}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            />
          </div>
          <span className="cdc-progress-value">{task.progressSeed}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="cdc-footer">
        <ul className="cdc-avatars">
          {task.initials.map((init, i) => (
            <li key={i}><div className="cdc-avatar">{init}</div></li>
          ))}
        </ul>
        <span
          className="cdc-btn-countdown"
          style={{ background: c.bg, color: c.hex }}
        >
          {task.countdown}
        </span>
      </div>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
interface TaskCardsProps {
  title?: string
  releases?: Release[]
  onTaskComplete?: (points: number, taskTitle: string) => void
}

export function TaskCards({ title = "Quick Tasks", releases = [], onTaskComplete }: TaskCardsProps) {
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([])
  const [usedPoolIds, setUsedPoolIds] = useState<Set<string>>(new Set())

  // Build tasks whenever releases change
  useEffect(() => {
    if (releases.length === 0) { setActiveTasks([]); return }
    // Use the first upcoming release, or latest if all past
    const sorted = [...releases].sort((a, b) =>
      new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
    )
    const upcoming = sorted.find(r => daysUntil(r.release_date) >= -14) ?? sorted[sorted.length - 1]
    const tasks = buildTasks(upcoming, new Set())
    const ids = new Set(tasks.map(t => t.poolId))
    setUsedPoolIds(ids)
    setActiveTasks(tasks)
  }, [releases])

  function handleComplete(id: string) {
    const task = activeTasks.find(t => t.id === id)
    if (task) onTaskComplete?.(POINTS_PER_TASK, task.title)
    setActiveTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleDismiss(id: string) {
    setActiveTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleResuggest(id: string) {
    const task = activeTasks.find(t => t.id === id)
    if (!task) return

    // Pick a replacement from unused pool in the same category if possible,
    // otherwise any unused task
    const sameCat = TASK_POOL.filter(
      p => p.category === task.category && !usedPoolIds.has(p.poolId)
    )
    const anyUnused = TASK_POOL.filter(p => !usedPoolIds.has(p.poolId))
    const pool = sameCat.length > 0 ? sameCat : anyUnused

    if (pool.length === 0) {
      // All used — clear used set and try again (cycle)
      const fresh = TASK_POOL.filter(
        p => !activeTasks.some(t => t.poolId === p.poolId) && p.poolId !== task.poolId
      )
      if (fresh.length === 0) return
      const next = fresh[Math.floor(Math.random() * fresh.length)]
      replaceTask(id, task, next)
      return
    }

    const next = pool[Math.floor(Math.random() * pool.length)]
    replaceTask(id, task, next)
  }

  function replaceTask(id: string, old: ActiveTask, next: PoolTask) {
    setUsedPoolIds(prev => new Set([...prev, next.poolId]))
    setActiveTasks(prev => prev.map(t =>
      t.id === id
        ? {
            ...next,
            id: `${next.poolId}-${Date.now()}`,
            releaseTitle: old.releaseTitle,
            countdown: old.countdown,
            initials: old.initials,
          }
        : t
    ))
  }

  // ── Empty state: no releases ──
  if (releases.length === 0) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ color: INK, fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0 }}>{title}</p>
            <p style={{ color: "rgba(var(--dash-fg),0.56)", fontSize: 10, fontWeight: 700, marginTop: 2 }}>Tasks appear when you create a release</p>
          </div>
        </div>
        <div style={{
          textAlign: "center", padding: "36px 24px",
          background: "rgba(var(--dash-fg),0.02)", borderRadius: 18,
          border: `1px dashed ${FAINT}`,
        }}>
          <Rocket size={28} color="rgba(184,134,11,0.35)" style={{ margin: "0 auto 10px" }} />
          <p style={{ color: "rgba(var(--dash-fg),0.56)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 4px" }}>
            No releases yet
          </p>
          <p style={{ color: "rgba(var(--dash-fg),0.48)", fontSize: 10, fontWeight: 500, margin: 0 }}>
            Create your first release in the Releases tab — uP will suggest tasks automatically.
          </p>
        </div>
      </>
    )
  }

  // ── Empty state: all tasks dismissed ──
  if (activeTasks.length === 0) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ color: INK, fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0 }}>{title}</p>
        </div>
        <div style={{
          textAlign: "center", padding: "32px 24px",
          background: "rgba(var(--dash-fg),0.02)", borderRadius: 18,
          border: `1px dashed ${FAINT}`,
        }}>
          <p style={{ color: "rgba(var(--dash-fg),0.48)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
            All tasks dismissed — check back soon
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ color: INK, fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0 }}>{title}</p>
          <p style={{ color: "rgba(var(--dash-fg),0.56)", fontSize: 10, fontWeight: 700, marginTop: 2 }}>
            {activeTasks.length} suggested · tap ··· to dismiss or re-suggest
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="cdc-grid">
        <AnimatePresence mode="popLayout">
          {activeTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDismiss={handleDismiss}
              onResuggest={handleResuggest}
              onComplete={handleComplete}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
