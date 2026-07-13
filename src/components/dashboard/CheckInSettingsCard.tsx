"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Bell, Clock, Globe2, Loader2, Send, Check, AlertCircle } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

// Common timezones for the dropdown — short list keeps the UI tight.
const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Mexico_City', 'America/Sao_Paulo',
  'Europe/London',   'Europe/Berlin',     'Europe/Paris',
  'Africa/Lagos',    'Africa/Johannesburg',
  'Asia/Tokyo',      'Asia/Seoul',        'Asia/Singapore', 'Asia/Dubai',
  'Australia/Sydney',
]

const FREQUENCIES = [
  { id: 'daily',    label: 'Every day' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly',   label: 'Mondays only' },
] as const

type Frequency = typeof FREQUENCIES[number]['id']

interface Props {
  userId: string
  /** Disable the controls and show a "needs Pro" upgrade prompt. */
  locked?: boolean
}

export function CheckInSettingsCard({ userId, locked }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [testing, setTesting] = useState(false)
  const [enabled, setEnabled]     = useState(false)
  const [hour, setHour]           = useState(9)
  const [timezone, setTimezone]   = useState('America/New_York')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [phone, setPhone]         = useState<string | null>(null)
  const [testMsg, setTestMsg]     = useState<{ ok: boolean; text: string } | null>(null)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [prefsRes, profileRes] = await Promise.all([
        supabase.from('artist_preferences')
          .select('checkin_enabled, checkin_hour, checkin_timezone, checkin_frequency, last_checkin_at')
          .eq('user_id', userId).maybeSingle(),
        supabase.from('artist_profiles').select('phone_number').eq('user_id', userId).maybeSingle(),
      ])
      if (cancelled) return
      const p = prefsRes.data
      if (p) {
        setEnabled(!!p.checkin_enabled)
        setHour(Number(p.checkin_hour ?? 9))
        setTimezone(String(p.checkin_timezone ?? 'America/New_York'))
        setFrequency((p.checkin_frequency ?? 'daily') as Frequency)
        setLastSentAt(p.last_checkin_at ?? null)
      } else {
        // Initialize timezone guess from the browser
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          if (tz && TIMEZONES.includes(tz)) setTimezone(tz)
        } catch { /* noop */ }
      }
      setPhone(profileRes.data?.phone_number ?? null)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId])

  async function save(next: Partial<{ enabled: boolean; hour: number; timezone: string; frequency: Frequency }>) {
    setSaving(true)
    const payload: Record<string, unknown> = {}
    if (next.enabled    !== undefined) payload.checkin_enabled   = next.enabled
    if (next.hour       !== undefined) payload.checkin_hour      = next.hour
    if (next.timezone   !== undefined) payload.checkin_timezone  = next.timezone
    if (next.frequency  !== undefined) payload.checkin_frequency = next.frequency

    const { error } = await supabase.from('artist_preferences').update(payload).eq('user_id', userId)
    if (error) console.error('[CheckInSettings] save error:', error)
    setSaving(false)
  }

  async function sendTestNow() {
    setTesting(true)
    setTestMsg(null)
    try {
      const res = await fetch('/.netlify/functions/up-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, test: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.ok) {
        setTestMsg({ ok: true, text: data.preview ?? 'Check-in sent — look at your iMessage.' })
        setLastSentAt(new Date().toISOString())
      } else {
        const msg =
          data.error === 'no_phone'     ? 'Connect your phone number first.' :
          data.error === 'requires_pro' ? 'Upgrade to Pro to use proactive check-ins.' :
                                          'Could not send — check Netlify logs.'
        setTestMsg({ ok: false, text: msg })
      }
    } catch {
      setTestMsg({ ok: false, text: 'Network error.' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[var(--dash-card-alt)] border border-[#FFD700]/10 p-8 rounded-[2.5rem] flex items-center justify-center">
        <Loader2 size={18} className="text-[#FFD700]/40 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[var(--dash-card-alt)] border border-[#FFD700]/10 p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#FFD700]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center">
            <Sparkles size={13} className="text-[#FFD700]" />
          </div>
          <h4 className="text-[rgb(var(--dash-fg))] font-black text-xs uppercase tracking-widest">uP Daily Check-In</h4>
          <span className="text-[8px] font-black uppercase tracking-widest text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded-full">Pro</span>
        </div>
        <p className="text-[rgba(var(--dash-fg),0.5)] text-[11px] font-medium mb-5 max-w-md">
          uP texts you each morning with today's priorities — release deadlines, top tasks, stat shifts.
          Personalized to your tone and platform data.
        </p>

        {!phone && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-orange-500/8 border border-orange-500/20 mb-5">
            <AlertCircle size={12} className="text-orange-400 mt-0.5 shrink-0" />
            <p className="text-orange-400 text-[11px] font-medium">
              Connect your phone number above first — check-ins are sent via iMessage.
            </p>
          </div>
        )}

        {/* Master toggle */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[var(--dash-card)] border border-[var(--dash-border)] mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Bell size={14} className={enabled ? 'text-[#FFD700]' : 'text-[rgba(var(--dash-fg),0.5)]'} />
            <div>
              <p className="text-[rgb(var(--dash-fg))] font-bold text-sm">Send me a morning check-in</p>
              <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] font-medium">{enabled ? 'On — uP will text you each day' : 'Off — no proactive texts'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (locked || !phone) return
              const next = !enabled
              setEnabled(next)
              save({ enabled: next })
            }}
            disabled={locked || !phone || saving}
            aria-pressed={enabled}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-40 ${
              enabled ? 'bg-[#FFD700]' : 'bg-[rgba(var(--dash-fg),0.12)]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Frequency + time + tz (only when enabled) */}
        <AnimatePresence>
          {enabled && !locked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                {/* Frequency */}
                <label className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[rgba(var(--dash-fg),0.5)] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Bell size={9} /> Frequency
                  </span>
                  <select
                    value={frequency}
                    onChange={e => {
                      const v = e.target.value as Frequency
                      setFrequency(v); save({ frequency: v })
                    }}
                    className="bg-transparent text-[rgb(var(--dash-fg))] text-sm font-bold outline-none cursor-pointer"
                  >
                    {FREQUENCIES.map(f => <option key={f.id} value={f.id} className="bg-[var(--dash-card)]">{f.label}</option>)}
                  </select>
                </label>

                {/* Hour */}
                <label className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[rgba(var(--dash-fg),0.5)] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={9} /> Time
                  </span>
                  <select
                    value={hour}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10)
                      setHour(v); save({ hour: v })
                    }}
                    className="bg-transparent text-[rgb(var(--dash-fg))] text-sm font-bold outline-none cursor-pointer"
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                      <option key={h} value={h} className="bg-[var(--dash-card)]">
                        {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Timezone */}
                <label className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[rgba(var(--dash-fg),0.5)] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Globe2 size={9} /> Timezone
                  </span>
                  <select
                    value={timezone}
                    onChange={e => {
                      const v = e.target.value
                      setTimezone(v); save({ timezone: v })
                    }}
                    className="bg-transparent text-[rgb(var(--dash-fg))] text-sm font-bold outline-none cursor-pointer truncate"
                  >
                    {TIMEZONES.map(tz => <option key={tz} value={tz} className="bg-[var(--dash-card)]">{tz}</option>)}
                  </select>
                </label>
              </div>

              {/* Test button + last-sent display */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={sendTestNow}
                  disabled={!phone || testing}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {testing ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                  {testing ? 'Sending…' : 'Send Test Now'}
                </button>
                {lastSentAt && (
                  <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] font-bold flex items-center gap-1.5">
                    <Check size={10} className="text-green-400" />
                    Last sent {new Date(lastSentAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Test result preview */}
              <AnimatePresence>
                {testMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-3 px-4 py-3 rounded-xl border text-[11px] font-medium leading-relaxed ${
                      testMsg.ok
                        ? 'bg-green-500/8 border-green-500/20 text-green-300'
                        : 'bg-red-500/8 border-red-500/20 text-red-300'
                    }`}
                  >
                    {testMsg.ok && <span className="block text-[9px] font-black uppercase tracking-widest text-green-400 mb-1">✓ uP just texted you</span>}
                    {testMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
