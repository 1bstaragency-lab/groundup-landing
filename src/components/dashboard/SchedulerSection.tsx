"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Clock, X, Smartphone, Check } from "lucide-react"
import { CircularProgressCard } from "../ui/circular-progress-card"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]

interface CalEvent {
  day: number;
  title: string;
  type: string;
  color: string;
}

// Event-type tags consolidated to gold-monochrome (was a decorative
// white/blue/pink/purple system per-type) — Release stays solid gold as the
// primary distinction, everything else shares a gold-tinted look; the label
// text still carries the type.
const EVENT_TYPES = [
  { label: "Release", color: "bg-[#FFD700] text-black" },
  { label: "Social", color: "bg-[#FFD700]/15 text-[#B8860B]" },
  { label: "PR", color: "bg-[#FFD700]/15 text-[#B8860B]" },
  { label: "Meeting", color: "bg-[#FFD700]/15 text-[#B8860B]" },
  { label: "TikTok", color: "bg-[#FFD700]/15 text-[#B8860B]" },
  { label: "Interview", color: "bg-[#FFD700]/15 text-[#B8860B]" },
]

function AddEventModal({ onClose, onSave }: { onClose: () => void; onSave: (ev: CalEvent) => void }) {
  const [title, setTitle] = useState("")
  const [day, setDay] = useState("")
  const [type, setType] = useState(EVENT_TYPES[0])

  function save() {
    if (!title || !day) return
    onSave({ day: Number(day), title, type: type.label, color: type.color })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[rgb(var(--dash-fg))] font-black text-xl uppercase tracking-tighter">New Event</h3>
          <button onClick={onClose} className="text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-2xl px-5 py-4 text-[rgb(var(--dash-fg))] font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-[rgba(var(--dash-fg),0.48)]"
          />
          <div>
            <p className="text-[rgba(var(--dash-fg),0.48)] text-[10px] font-black uppercase tracking-widest mb-3">Type</p>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.label}
                  onClick={() => setType(t)}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all ${
                    type.label === t.label ? `${t.color} border-transparent` : "bg-[var(--dash-card-alt)] border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[rgba(var(--dash-fg),0.48)] text-[10px] font-black uppercase tracking-widest mb-2">Day of Month</p>
            <input
              type="number"
              min={1}
              max={31}
              placeholder="Day (1–31)"
              value={day}
              onChange={e => setDay(e.target.value)}
              className="w-full bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-2xl px-5 py-4 text-[rgb(var(--dash-fg))] font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-[rgba(var(--dash-fg),0.48)]"
            />
          </div>
          <button
            onClick={save}
            disabled={!title || !day}
            className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Add to Calendar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PhoneModal({ onClose, userId }: { onClose: () => void; userId?: string }) {
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!phone) return
    setSaving(true)
    if (userId) {
      await supabase
        .from('artist_preferences')
        .update({ phone, sms_notifications: true })
        .eq('id', userId)
    }
    setSaving(false)
    setSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6"
            >
              <div className="w-16 h-16 bg-[#FFD700]/20 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-[#FFD700]/30">
                <Check size={28} className="text-[#FFD700]" />
              </div>
              <p className="text-[rgb(var(--dash-fg))] font-black text-xl uppercase tracking-tighter mb-2">You're in</p>
              <p className="text-[rgba(var(--dash-fg),0.52)] text-sm font-medium leading-relaxed">
                uP will now be texting you updates for your upcoming events.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2">
              <div className="w-14 h-14 bg-[var(--dash-card-alt)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--dash-border)]">
                <Smartphone size={24} className="text-[#FFD700]" />
              </div>
              <h3 className="text-[rgb(var(--dash-fg))] font-black text-xl uppercase tracking-tighter mb-2">Text Notifications</h3>
              <p className="text-[rgba(var(--dash-fg),0.52)] text-sm font-medium mb-6 leading-relaxed">
                Enter your phone number and uP will text you reminders for your scheduled events.
              </p>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-2xl px-5 py-4 text-[rgb(var(--dash-fg))] font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-[rgba(var(--dash-fg),0.48)] mb-4 text-center"
              />
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] font-black text-[10px] uppercase tracking-widest hover:text-[rgb(var(--dash-fg))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={!phone || saving}
                  className="flex-1 py-3 bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {saving ? 'Saving...' : 'Notify Me'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

interface Release {
  id: string
  title: string
  checklist: { label: string; done: boolean }[]
  release_date: string
}

export function SchedulerSection() {
  const today = new Date()
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [releases, setReleases] = useState<Release[]>([])

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('releases')
      .select('id, title, checklist, release_date')
      .eq('user_id', user.id)
      .then(({ data }) => { if (data) setReleases(data as Release[]) })
  }, [user?.id])

  // Career Progress: total checklist items done / total across ALL releases
  const totalItems    = releases.reduce((s, r) => s + (r.checklist?.length ?? 0), 0)
  const completedItems = releases.reduce((s, r) => s + (r.checklist?.filter(c => c.done).length ?? 0), 0)

  // Rollout Health: done / total on the most-recent upcoming release
  const upcoming = releases
    .filter(r => r.release_date)
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
    .find(r => new Date(r.release_date) >= new Date()) ?? releases[releases.length - 1]
  const rolloutTotal   = upcoming?.checklist?.length ?? 0
  const rolloutDone    = upcoming?.checklist?.filter(c => c.done).length ?? 0

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  // Accurate days-in-month and start offset
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay() // 0=Sun

  function addEvent(ev: CalEvent) {
    setEvents(prev => [...prev, ev].sort((a, b) => a.day - b.day))
  }

  const todayDay = today.getMonth() === currentMonth && today.getFullYear() === currentYear ? today.getDate() : -1

  // Parse a "YYYY-MM-DD" string in LOCAL time (not UTC) to avoid the date-off-by-one
  // that happens when new Date("2024-06-01") is treated as UTC midnight and rolls back
  // to the previous day in any negative-offset timezone (US, etc.)
  function parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  // Merge Supabase release dates into the calendar as auto events
  const releaseEvents: CalEvent[] = releases
    .filter(r => {
      if (!r.release_date) return false
      const d = parseLocalDate(r.release_date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .map(r => ({
      day: parseLocalDate(r.release_date).getDate(),
      title: r.title,
      type: 'Release',
      color: 'bg-[#FFD700] text-black',
    }))
  const allEvents = [...releaseEvents, ...events]
  const upcomingEvents = allEvents.filter(e => e.day >= (todayDay > 0 ? todayDay : 1)).slice(0, 3)

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--dash-border)] pb-5">
        <div>
          <h2 className="text-3xl font-black text-[rgb(var(--dash-fg))] tracking-tighter uppercase">Campaign Scheduler</h2>
          <p className="text-[rgba(var(--dash-fg),0.52)] font-medium text-sm mt-1">Coordinate releases, content drops, and team meetings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-xl bg-[var(--dash-card)] border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="bg-[var(--dash-card)] px-5 py-2.5 rounded-xl border border-[var(--dash-border)] font-black text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--dash-fg))]">
            {MONTHS[currentMonth]} {currentYear}
          </div>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-xl bg-[var(--dash-card)] border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setShowAddEvent(true)}
            className="ml-2 px-4 py-2.5 rounded-xl bg-[#FFD700] text-black font-black flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={15} /> <span className="text-[10px] uppercase tracking-widest">New Event</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-8 bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-[2rem] p-5 backdrop-blur-3xl overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {DAYS.map(day => (
                <div key={day} className="text-center text-[9px] font-black text-[rgba(var(--dash-fg),0.48)] tracking-widest uppercase py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {/* blank cells for the start-day offset */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[60px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const event = allEvents.find(e => e.day === dayNum)
                const isToday = dayNum === todayDay
                return (
                  <div key={i} className={`min-h-[60px] rounded-xl border p-2 transition-all duration-300 relative group ${
                    isToday ? "border-[#FFD700]/40 bg-[#FFD700]/5" :
                    event ? "border-[var(--dash-border)] bg-[rgba(var(--dash-fg),0.05)]" : "border-[var(--dash-border)] hover:border-[var(--dash-border)] hover:bg-[rgba(var(--dash-fg),0.05)]"
                  }`}>
                    <span className={`text-[10px] font-black ${isToday ? "text-[#FFD700]" : event ? "text-[rgb(var(--dash-fg))]" : "text-[rgba(var(--dash-fg),0.48)] group-hover:text-[rgba(var(--dash-fg),0.52)]"}`}>
                      {dayNum}
                    </span>
                    {isToday && <div className="absolute top-2 right-2 w-1 h-1 bg-[#FFD700] rounded-full" />}
                    {event && (
                      <div className={`mt-1 p-1 rounded-md text-[8px] font-black leading-tight uppercase tracking-tight truncate ${event.color}`}>
                        {event.title}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--dash-card-alt)] border border-[#FFD700]/20 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[#FFD700]/10">
              <Clock size={60} />
            </div>
            <h3 className="text-xl font-black text-[rgb(var(--dash-fg))] mb-8 tracking-tight uppercase flex items-center gap-3">
              Next Up <span className="text-[#FFD700] text-[10px] bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/20">Live</span>
            </h3>

            {upcomingEvents.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[rgba(var(--dash-fg),0.48)] text-[11px] font-black uppercase tracking-widest leading-relaxed">No upcoming events.<br />Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.map((ev, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
                      {i < upcomingEvents.length - 1 && <div className="w-px h-full bg-[rgba(var(--dash-fg),0.05)] my-2" />}
                    </div>
                    <div>
                      <p className="text-[rgb(var(--dash-fg))] font-bold text-sm tracking-tight mb-1 group-hover:text-[#FFD700] transition-colors">{ev.title}</p>
                      <p className="text-[rgba(var(--dash-fg),0.48)] text-[10px] font-black uppercase tracking-widest">Day {ev.day} · {ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-[var(--dash-border)] mt-6">
              <button
                onClick={() => setShowPhone(true)}
                className="w-full py-4 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform"
              >
                Notify Me / Text Me
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {totalItems === 0 ? (
              <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-card-alt)] p-6 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[rgba(var(--dash-fg),0.48)] mb-2">Career Progress</p>
                <p className="text-[rgba(var(--dash-fg),0.48)] text-xs font-medium">Create a release to track milestones</p>
              </div>
            ) : (
              <CircularProgressCard
                title="Career Progress"
                description="Checklist items completed across all releases"
                currentValue={completedItems}
                goalValue={totalItems}
                label="completed"
                progressColor="#FFD700"
              />
            )}
            {rolloutTotal === 0 ? (
              <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-card-alt)] p-6 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[rgba(var(--dash-fg),0.48)] mb-2">Rollout Health</p>
                <p className="text-[rgba(var(--dash-fg),0.48)] text-xs font-medium">Add tasks to your active release</p>
              </div>
            ) : (
              <CircularProgressCard
                title="Rollout Health"
                description={upcoming ? `${upcoming.title} rollout progress` : "Active release progress"}
                currentValue={rolloutDone}
                goalValue={rolloutTotal}
                label="tasks done"
                progressColor="#4ade80"
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onSave={addEvent} />}
        {showPhone && <PhoneModal onClose={() => setShowPhone(false)} userId={user?.id} />}
      </AnimatePresence>
    </div>
  )
}
