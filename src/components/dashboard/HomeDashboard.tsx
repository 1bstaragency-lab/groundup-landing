"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid, Calendar, Users, TrendingUp, Plus, Rocket, BarChart2,
  CheckSquare, Square, Crown, Music2, Briefcase, Link2,
  Disc3, Layers, Music, ListMusic, X, Check, MoreVertical,
  Trash2, Edit2, Flag, MessageCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { usePoints } from '../../hooks/usePoints'
import { TaskCards } from '../ui/task-cards'
import { MusicStatsCard } from '../ui/music-stats-card'
import { PointsWidget } from '../ui/points-widget'
import { UpSection } from './UpSection'
import { UpTasksFeed } from './UpTasksFeed'
import { ReferralWidget } from './ReferralWidget'
import { CompletionWidget } from './CompletionWidget'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashTab = 'Overview' | 'Releases' | 'Analytics' | 'Team' | 'uP'

interface CalEvent {
  id: string
  title: string
  event_type: string
  event_date: string
  priority: 'none' | 'low' | 'medium' | 'high'
}

interface Release {
  id: string
  title: string
  type: 'Single' | 'EP' | 'Album' | 'Mixtape'
  release_date: string
  budget: string
  checklist: { label: string; done: boolean }[]
}

interface TeamMember {
  id: string
  invitee_name: string
  invitee_email: string
  role: string
  status: 'pending' | 'accepted'
}

// ─── Add Event Modal ───────────────────────────────────────────────────────────

const EVENT_TYPES = ['Release', 'Social', 'PR', 'Meeting', 'TikTok', 'Interview']

function EventFormModal({
  userId, onClose, onSaved, existing,
}: {
  userId: string
  onClose: () => void
  onSaved: (ev: CalEvent) => void
  existing?: CalEvent
}) {
  const [title, setTitle] = useState(existing?.title ?? '')
  const [date,  setDate]  = useState(existing?.event_date ?? '')
  const [type,  setType]  = useState(existing?.event_type ?? EVENT_TYPES[0])
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title || !date) return
    setSaving(true)
    if (existing) {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({ title, event_type: type, event_date: date })
        .eq('id', existing.id)
        .select()
        .single()
      setSaving(false)
      if (!error && data) { onSaved(data as CalEvent); onClose() }
    } else {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({ user_id: userId, title, event_type: type, event_date: date, priority: 'none' })
        .select()
        .single()
      setSaving(false)
      if (!error && data) { onSaved(data as CalEvent); onClose() }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-xl uppercase tracking-tighter">
            {existing ? 'Edit Event' : 'New Event'}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="text" placeholder="Event Title" value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
          />
          <div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2">Type</p>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`p-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wide transition-all ${
                    type === t ? 'bg-[#FFD700] border-transparent text-black' : 'bg-zinc-800 border-white/5 text-white/40 hover:text-white'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2">Date</p>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all"
            />
          </div>
          <button
            onClick={save} disabled={!title || !date || saving}
            className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            {saving ? 'Saving...' : existing ? 'Save Changes' : 'Add to Calendar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  Release:   'bg-[#FFD700] text-black',
  Social:    'bg-white/10 text-white',
  PR:        'bg-[#FFD700]/20 text-[#FFD700]',
  Meeting:   'bg-blue-500/20 text-blue-400',
  TikTok:    'bg-pink-500/20 text-pink-400',
  Interview: 'bg-purple-500/20 text-purple-400',
}

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function DynamicCalendar({ events }: { events: CalEvent[] }) {
  const today = new Date()
  const year  = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth   = new Date(year, month + 1, 0).getDate()
  const startWeekday  = new Date(year, month, 1).getDay()
  const todayDate     = today.getDate()

  const count  = events.length
  // size tiers
  const isSmall  = count >= 1  && count <= 4   // list only, no grid
  const isMedium = count >= 5  && count <= 9   // mini grid + dots
  const isLarge  = count >= 10                  // full grid + labels

  // Map event_date → events for quick lookup
  const byDay: Record<number, CalEvent[]> = {}
  events.forEach(ev => {
    const d = new Date(ev.event_date + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(ev)
    }
  })

  if (isSmall) return null // just show list below

  const cellBase = isMedium
    ? 'min-h-[44px] rounded-lg p-1'
    : 'min-h-[64px] rounded-xl p-2'

  return (
    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 mb-4">
      <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-3">
        {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-black text-white/20 uppercase py-1">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day     = i + 1
          const dayEvs  = byDay[day] ?? []
          const isToday = day === todayDate
          // Highest priority on this day drives the cell color
          const topPriority = dayEvs.find(e => e.priority === 'high')?.priority
            ?? dayEvs.find(e => e.priority === 'medium')?.priority
            ?? dayEvs.find(e => e.priority === 'low')?.priority
            ?? 'none'
          const priorityBg =
            topPriority === 'high'   ? 'border-red-500/50 bg-red-500/15' :
            topPriority === 'medium' ? 'border-amber-400/50 bg-amber-400/15' :
            topPriority === 'low'    ? 'border-green-500/50 bg-green-500/15' : ''
          return (
            <div key={day} className={`${cellBase} border transition-all relative ${
              isToday    ? 'border-[#FFD700]/40 bg-[#FFD700]/8' :
              priorityBg ? priorityBg :
              dayEvs.length ? 'border-white/10 bg-white/4' :
              'border-white/4 hover:border-white/10'
            }`}>
              <span className={`text-[10px] font-black ${isToday ? 'text-[#FFD700]' : dayEvs.length ? 'text-white' : 'text-white/25'}`}>
                {day}
              </span>
              {isToday && <div className="absolute top-1 right-1 w-1 h-1 bg-[#FFD700] rounded-full" />}
              {/* Medium: dots only */}
              {isMedium && dayEvs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap">
                  {dayEvs.slice(0, 3).map((ev, j) => (
                    <div key={j} className={`w-1.5 h-1.5 rounded-full ${
                      ev.event_type === 'Release' ? 'bg-[#FFD700]' :
                      ev.event_type === 'TikTok'  ? 'bg-pink-400' :
                      ev.event_type === 'Meeting' ? 'bg-blue-400' : 'bg-white/40'
                    }`} />
                  ))}
                </div>
              )}
              {/* Large: label text */}
              {isLarge && dayEvs.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {dayEvs.slice(0, 2).map((ev, j) => (
                    <div key={j} className={`px-1 py-0.5 rounded text-[7px] font-black uppercase truncate ${TYPE_COLOR[ev.event_type] ?? 'bg-white/10 text-white'}`}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvs.length > 2 && (
                    <div className="text-[7px] text-white/30 font-black">+{dayEvs.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PRIORITY_CONFIG = {
  none:   { label: 'None',   dot: '',                        row: '' },
  low:    { label: 'Low',    dot: 'bg-green-400',            row: 'border-green-500/30 bg-green-500/5' },
  medium: { label: 'Medium', dot: 'bg-amber-400',            row: 'border-amber-400/30 bg-amber-400/5' },
  high:   { label: 'High',   dot: 'bg-red-400',              row: 'border-red-500/30 bg-red-500/5' },
}

function EventRow({
  ev, onDelete, onEdit, onPriority,
}: {
  ev: CalEvent
  onDelete: () => void
  onEdit: () => void
  onPriority: (p: CalEvent['priority']) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const pri = PRIORITY_CONFIG[ev.priority] ?? PRIORITY_CONFIG.none

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function toggleMenu() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen(o => !o)
  }

  return (
    <div className={`relative flex items-center gap-3 p-3 border rounded-2xl transition-all group ${
      pri.row || 'bg-zinc-900/40 border-white/5 hover:border-white/10'
    }`}>
      {/* Priority dot on date box */}
      <div className="w-11 h-11 bg-zinc-800 rounded-xl flex flex-col items-center justify-center shrink-0 relative">
        <span className="text-[#FFD700] font-black text-[9px] uppercase leading-none">
          {new Date(ev.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-white font-black text-base leading-none mt-0.5">
          {new Date(ev.event_date + 'T00:00:00').getDate()}
        </span>
        {ev.priority !== 'none' && (
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${pri.dot}`} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm tracking-tight truncate group-hover:text-[#FFD700] transition-colors">{ev.title}</p>
        <p className="text-white/30 text-[10px] font-medium mt-0.5">{formatDate(ev.event_date)}</p>
      </div>

      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide shrink-0 ${TYPE_COLOR[ev.event_type] ?? 'bg-white/10 text-white'}`}>
        {ev.event_type}
      </span>

      {/* Three-dot menu */}
      <button
        ref={btnRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all"
      >
        <MoreVertical size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-away overlay */}
            <div className="fixed inset-0 z-[150]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
              className="z-[200] w-44 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Edit */}
              <button
                onClick={() => { setOpen(false); onEdit() }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest"
              >
                <Edit2 size={12} /> Edit
              </button>

              {/* Priority divider */}
              <div className="px-4 py-1.5 border-t border-white/5">
                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Flag size={9} /> Priority
                </p>
              </div>

              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setOpen(false); onPriority(p) }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                    ev.priority === p ? 'bg-white/8 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                  {PRIORITY_CONFIG[p].label}
                  {ev.priority === p && <Check size={10} className="ml-auto" />}
                </button>
              ))}

              {ev.priority !== 'none' && (
                <button
                  onClick={() => { setOpen(false); onPriority('none') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest"
                >
                  <div className="w-2 h-2 rounded-full bg-white/20" /> Clear priority
                </button>
              )}

              {/* Delete */}
              <div className="border-t border-white/5">
                <button
                  onClick={() => { setOpen(false); onDelete() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all text-[11px] font-black uppercase tracking-widest"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function OverviewTab({ events, setEvents, loadingEvents, userId, onEventAdded }: {
  events: CalEvent[]
  setEvents: React.Dispatch<React.SetStateAction<CalEvent[]>>
  loadingEvents: boolean
  userId: string
  onEventAdded: (ev: CalEvent) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<CalEvent | null>(null)
  const today = new Date()
  const upcoming = events
    .filter(e => new Date(e.event_date + 'T00:00:00') >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))

  const listLimit = events.length <= 4 ? events.length : events.length <= 9 ? 4 : 3

  async function handleDelete(id: string) {
    await supabase.from('calendar_events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  async function handlePriority(id: string, priority: CalEvent['priority']) {
    await supabase.from('calendar_events').update({ priority }).eq('id', id)
    setEvents(prev => prev.map(e => e.id === id ? { ...e, priority } : e))
  }

  function handleEdited(updated: CalEvent) {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  return (
    <div className="space-y-4">
      {/* Onboarding completion — auto-hides at 100% */}
      <CompletionWidget userId={userId} />

      <div className="flex items-center justify-between">
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
          {upcoming.length > 0 ? `${upcoming.length} upcoming` : 'Upcoming Events'}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
        >
          <Plus size={12} /> Add Event
        </button>
      </div>

      {loadingEvents ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#FFD700]/40 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      ) : upcoming.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
          <Calendar size={24} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/20 text-[11px] font-black uppercase tracking-widest">No upcoming events</p>
          <p className="text-white/10 text-[10px] font-medium mt-1">Add your first release date or campaign</p>
        </div>
      ) : (
        <>
          <DynamicCalendar events={events} />
          <div className="space-y-2">
            {upcoming.slice(0, listLimit).map(ev => (
              <EventRow
                key={ev.id}
                ev={ev}
                onDelete={() => handleDelete(ev.id)}
                onEdit={() => setEditing(ev)}
                onPriority={p => handlePriority(ev.id, p)}
              />
            ))}
            {upcoming.length > listLimit && (
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center pt-1">
                +{upcoming.length - listLimit} more — visible on calendar above
              </p>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {showAdd && (
          <EventFormModal userId={userId} onClose={() => setShowAdd(false)} onSaved={onEventAdded} />
        )}
        {editing && (
          <EventFormModal userId={userId} existing={editing} onClose={() => setEditing(null)} onSaved={handleEdited} />
        )}
      </AnimatePresence>

      {/* uP task feed — tasks from any conversation */}
      <UpTasksFeed userId={userId} />

      {/* Refer & earn */}
      <ReferralWidget userId={userId} />
    </div>
  )
}

// ─── Releases Tab ─────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Single:  { color: 'text-[#FFD700]',  bg: 'bg-[#FFD700]/10',  icon: <Disc3 size={16} /> },
  EP:      { color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: <Layers size={16} /> },
  Album:   { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Music size={16} /> },
  Mixtape: { color: 'text-green-400',  bg: 'bg-green-500/10',  icon: <ListMusic size={16} /> },
}

function ReleasesTab({ releases, loading, onUpdate }: {
  releases: Release[]
  loading: boolean
  onUpdate: () => void
}) {
  async function toggleItem(release: Release, idx: number) {
    const updated = release.checklist.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    )
    await supabase.from('releases').update({ checklist: updated }).eq('id', release.id)
    onUpdate()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-[#FFD700]/40 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  )

  if (releases.length === 0) return (
    <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
      <Rocket size={28} className="text-white/10 mx-auto mb-3" />
      <p className="text-white/20 text-[11px] font-black uppercase tracking-widest">No releases yet</p>
      <p className="text-white/10 text-[10px] font-medium mt-1">Go to Releases in the sidebar to plan your first drop</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {releases.slice(0, 3).map(release => {
        const meta = TYPE_META[release.type] ?? TYPE_META.Single
        const done = release.checklist.filter(c => c.done).length
        const total = release.checklist.length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        const releaseDate = new Date(release.release_date + 'T00:00:00')

        return (
          <div key={release.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg} ${meta.color} shrink-0`}>
                  {meta.icon}
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-tight">{release.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-black uppercase ${meta.color}`}>{release.type}</span>
                    <span className="text-white/20 text-[9px]">·</span>
                    <span className="text-white/30 text-[9px] flex items-center gap-1">
                      <Calendar size={9} />
                      {releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#FFD700] font-black text-xl">{pct}%</p>
                <p className="text-white/20 text-[9px] font-black uppercase">{done}/{total}</p>
              </div>
            </div>

            {total > 0 && (
              <>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFD700]"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <div className="space-y-1.5">
                  {release.checklist.slice(0, 4).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => toggleItem(release, i)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                        item.done ? 'bg-[#FFD700]/8 border-[#FFD700]/15' : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {item.done
                        ? <CheckSquare size={13} className="text-[#FFD700] shrink-0" />
                        : <Square size={13} className="text-white/20 shrink-0" />
                      }
                      <span className={`text-[11px] font-bold ${item.done ? 'text-white/30 line-through' : 'text-white/70'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                  {release.checklist.length > 4 && (
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center pt-1">
                      +{release.checklist.length - 4} more — open Releases to see all
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
      {releases.length > 3 && (
        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center">
          +{releases.length - 3} more releases — open Releases in sidebar
        </p>
      )}
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: 'Spotify for Artists', icon: <Music2 size={18} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', desc: 'Streams, listeners, playlist placements' },
  { name: 'YouTube Studio',      icon: <BarChart2 size={18} />, color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   desc: 'Views, subscribers, watch time' },
  { name: 'TikTok Analytics',   icon: <TrendingUp size={18} />, color: 'text-pink-400',  bg: 'bg-pink-500/10',  border: 'border-pink-500/20',  desc: 'Video views, profile reach, sounds used' },
]

function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-[#FFD700]/8 border border-[#FFD700]/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={12} className="text-[#FFD700]" />
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest">Connect your accounts</p>
        </div>
        <p className="text-white/40 text-[11px] font-medium leading-relaxed">
          Link your streaming platforms to see live streams, listeners, and playlist data directly in your dashboard.
        </p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map(p => (
          <div key={p.name} className={`flex items-center gap-4 p-4 rounded-2xl border ${p.bg} ${p.border}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/20 ${p.color} shrink-0`}>
              {p.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black text-sm uppercase tracking-tight ${p.color}`}>{p.name}</p>
              <p className="text-white/30 text-[10px] font-medium mt-0.5">{p.desc}</p>
            </div>
            <button className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest shrink-0 transition-all hover:scale-105 ${p.color} ${p.border} bg-black/20 hover:bg-black/40`}>
              Connect
            </button>
          </div>
        ))}
      </div>

      <p className="text-white/15 text-[10px] font-black uppercase tracking-widest text-center pt-2">
        Analytics populate automatically once accounts are connected
      </p>
    </div>
  )
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────

const ROLE_META: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Manager:   { color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: <Crown size={11} /> },
  Producer:  { color: 'text-green-400',  bg: 'bg-green-400/10',  icon: <Music2 size={11} /> },
  Marketing: { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: <Briefcase size={11} /> },
  Booking:   { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: <Calendar size={11} /> },
  PR:        { color: 'text-pink-400',   bg: 'bg-pink-400/10',   icon: <TrendingUp size={11} /> },
}

function TeamTab({ members, loading }: { members: TeamMember[]; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-[#FFD700]/40 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  )

  if (members.length === 0) return (
    <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
      <Users size={28} className="text-white/10 mx-auto mb-3" />
      <p className="text-white/20 text-[11px] font-black uppercase tracking-widest">No team members yet</p>
      <p className="text-white/10 text-[10px] font-medium mt-1">Go to Team in the sidebar to invite your crew</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
        Your Team · {members.length} {members.length === 1 ? 'Member' : 'Members'}
      </p>
      {members.map(m => {
        const meta = ROLE_META[m.role] ?? ROLE_META.Manager
        return (
          <div key={m.id} className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-white text-sm uppercase shrink-0">
              {m.invitee_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm uppercase tracking-tight truncate">{m.invitee_name}</p>
              <p className="text-white/30 text-[10px] font-medium truncate">{m.invitee_email}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${meta.bg} ${meta.color} text-[9px] font-black uppercase tracking-wide border border-white/5`}>
                {meta.icon} {m.role}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                m.status === 'accepted' ? 'text-green-400' : 'text-white/20'
              }`}>
                {m.status === 'accepted' ? (
                  <span className="flex items-center gap-1"><Check size={8} /> Active</span>
                ) : 'Pending invite'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS: { id: DashTab; icon: React.ReactNode; label: string; highlight?: boolean }[] = [
  { id: 'Overview',  icon: <Grid size={13} />,           label: 'Overview' },
  { id: 'Releases',  icon: <Rocket size={13} />,         label: 'Releases' },
  { id: 'Analytics', icon: <TrendingUp size={13} />,     label: 'Analytics' },
  { id: 'Team',      icon: <Users size={13} />,          label: 'Team' },
  { id: 'uP',        icon: <MessageCircle size={13} />,  label: 'uP', highlight: true },
]

export function HomeDashboard() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<DashTab>('Overview')

  const { available: points, totalEarned, earn: earnPoints, spend: spendPoints } = usePoints()

  const [events, setEvents] = useState<CalEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const [releases, setReleases] = useState<Release[]>([])
  const [loadingReleases, setLoadingReleases] = useState(true)

  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingTeam, setLoadingTeam] = useState(true)

  const rawName = profile?.artist_name ?? user?.artistName ?? ''
  const displayName = rawName && !rawName.includes('@') ? rawName : 'Artist'

  const loadEvents = useCallback(async () => {
    if (!user) return
    setLoadingEvents(true)
    const { data } = await supabase
      .from('calendar_events')
      .select('id, title, event_type, event_date, priority')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })
    if (data) setEvents(data as CalEvent[])
    setLoadingEvents(false)
  }, [user])

  const loadReleases = useCallback(async () => {
    if (!user) return
    setLoadingReleases(true)
    const { data } = await supabase
      .from('releases')
      .select('id, title, type, release_date, budget, checklist')
      .eq('user_id', user.id)
      .order('release_date', { ascending: true })
    if (data) setReleases(data as Release[])
    setLoadingReleases(false)
  }, [user])

  const loadTeam = useCallback(async () => {
    if (!user) return
    setLoadingTeam(true)
    const { data } = await supabase
      .from('team_invites')
      .select('id, invitee_name, invitee_email, role, status')
      .eq('inviter_id', user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
    if (data) setMembers(data as TeamMember[])
    setLoadingTeam(false)
  }, [user])

  useEffect(() => {
    loadEvents()
    loadReleases()
    loadTeam()
  }, [loadEvents, loadReleases, loadTeam])

  if (!user) return null

  return (
    <div className="w-full bg-zinc-950 rounded-[32px] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/gu-logo.png" alt="uP" className="h-8 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div>
            <h3 className="text-white font-black text-base tracking-tighter uppercase leading-none">
              {displayName.toUpperCase()}
            </h3>
            <p className="text-[#FFD700] text-[9px] font-black tracking-[0.25em] opacity-70 mt-0.5">ARTIST OS · LIVE</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-zinc-900/60 border border-white/5 rounded-2xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? 'bg-[#FFD700] text-black shadow-[0_4px_16px_rgba(255,215,0,0.2)]'
                  : tab.highlight
                  ? 'text-[#FFD700]/60 hover:text-[#FFD700]'
                  : 'text-white/30 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.highlight && activeTab !== tab.id && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_4px_#FFD700]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_8px_#FFD700]" />
          <span className="text-white/30 font-black text-[9px] tracking-widest hidden sm:block">LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-white text-2xl font-black tracking-tighter leading-none uppercase">{activeTab}</h2>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            {activeTab === 'Overview'  && `${events.filter(e => new Date(e.event_date) >= new Date()).length} upcoming events`}
            {activeTab === 'Releases'  && `${releases.length} active ${releases.length === 1 ? 'release' : 'releases'}`}
            {activeTab === 'Analytics' && 'Connect platforms to see live data'}
            {activeTab === 'Team'      && `${members.length} ${members.length === 1 ? 'member' : 'members'}`}
            {activeTab === 'uP'        && 'Your AI music career co-pilot'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'Overview'  && (
              <>
                <div className="mb-6">
                  <MusicStatsCard />
                </div>
                <OverviewTab events={events} setEvents={setEvents} loadingEvents={loadingEvents} userId={user.id} onEventAdded={ev => setEvents(prev => [...prev, ev])} />
                <div className="mt-6 pt-6 border-t border-white/5">
                  <TaskCards
                    title="Quick Tasks"
                    releases={releases}
                    onTaskComplete={(pts, taskTitle) => earnPoints(pts, taskTitle)}
                  />
                </div>
                <div className="mt-6">
                  <PointsWidget
                    available={points}
                    totalEarned={totalEarned}
                    onSpend={spendPoints}
                  />
                </div>
              </>
            )}
            {activeTab === 'Releases'  && <ReleasesTab releases={releases} loading={loadingReleases} onUpdate={loadReleases} />}
            {activeTab === 'Analytics' && <AnalyticsTab />}
            {activeTab === 'Team'      && <TeamTab members={members} loading={loadingTeam} />}
            {activeTab === 'uP'        && <UpSection pointsAvailable={points} totalEarned={totalEarned} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
