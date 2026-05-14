"use client"

import { useState } from "react"
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

const EVENT_TYPES = [
  { label: "Release", color: "bg-[#FFD700] text-black" },
  { label: "Social", color: "bg-white/10 text-white" },
  { label: "PR", color: "bg-[#FFD700]/20 text-[#FFD700]" },
  { label: "Meeting", color: "bg-blue-500/20 text-blue-400" },
  { label: "TikTok", color: "bg-pink-500/20 text-pink-400" },
  { label: "Interview", color: "bg-purple-500/20 text-purple-400" },
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-white font-black text-xl uppercase tracking-tighter">New Event</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
          />
          <div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-3">Type</p>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.label}
                  onClick={() => setType(t)}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all ${
                    type.label === t.label ? `${t.color} border-transparent` : "bg-zinc-800 border-white/5 text-white/40 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2">Day of Month</p>
            <input
              type="number"
              min={1}
              max={31}
              placeholder="Day (1–31)"
              value={day}
              onChange={e => setDay(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
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
              <p className="text-white font-black text-xl uppercase tracking-tighter mb-2">You're in</p>
              <p className="text-white/40 text-sm font-medium leading-relaxed">
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
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Smartphone size={24} className="text-[#FFD700]" />
              </div>
              <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">Text Notifications</h3>
              <p className="text-white/40 text-sm font-medium mb-6 leading-relaxed">
                Enter your phone number and uP will text you reminders for your scheduled events.
              </p>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20 mb-4 text-center"
              />
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
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

export function SchedulerSection() {
  const today = new Date()
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

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
  const upcomingEvents = events.filter(e => e.day >= (todayDay > 0 ? todayDay : 1)).slice(0, 3)

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Campaign Scheduler</h2>
          <p className="text-white/40 font-medium text-sm mt-1">Coordinate releases, content drops, and team meetings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="bg-zinc-900 px-5 py-2.5 rounded-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] text-white">
            {MONTHS[currentMonth]} {currentYear}
          </div>
          <button
            onClick={nextMonth}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-white/40 hover:text-white transition-colors"
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
        <div className="lg:col-span-8 bg-zinc-900/20 border border-white/5 rounded-[2rem] p-5 backdrop-blur-3xl overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {DAYS.map(day => (
                <div key={day} className="text-center text-[9px] font-black text-white/20 tracking-widest uppercase py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {/* blank cells for the start-day offset */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[60px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const event = events.find(e => e.day === dayNum)
                const isToday = dayNum === todayDay
                return (
                  <div key={i} className={`min-h-[60px] rounded-xl border p-2 transition-all duration-300 relative group ${
                    isToday ? "border-[#FFD700]/40 bg-[#FFD700]/5" :
                    event ? "border-white/10 bg-white/5" : "border-white/5 hover:border-white/10 hover:bg-white/5"
                  }`}>
                    <span className={`text-[10px] font-black ${isToday ? "text-[#FFD700]" : event ? "text-white" : "text-white/20 group-hover:text-white/40"}`}>
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
          <div className="bg-zinc-900/40 border border-[#FFD700]/20 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[#FFD700]/10">
              <Clock size={60} />
            </div>
            <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3">
              Next Up <span className="text-[#FFD700] text-[10px] bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/20">Live</span>
            </h3>

            {upcomingEvents.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-white/20 text-[11px] font-black uppercase tracking-widest leading-relaxed">No upcoming events.<br />Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.map((ev, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
                      {i < upcomingEvents.length - 1 && <div className="w-px h-full bg-white/5 my-2" />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm tracking-tight mb-1 group-hover:text-[#FFD700] transition-colors">{ev.title}</p>
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Day {ev.day} · {ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-white/5 mt-6">
              <button
                onClick={() => setShowPhone(true)}
                className="w-full py-4 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform"
              >
                Notify Me / Text Me
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <CircularProgressCard
              title="Career Progress"
              description="Release milestones completed this quarter"
              currentValue={7}
              goalValue={10}
              label="milestones"
              progressColor="#FFD700"
            />
            <CircularProgressCard
              title="Rollout Health"
              description="Tasks completed across active releases"
              currentValue={23}
              goalValue={30}
              label="tasks done"
              progressColor="#4ade80"
            />
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
