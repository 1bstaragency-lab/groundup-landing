"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Circle, ChevronRight, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"

interface Step {
  id:    string
  label: string
  done:  boolean
  cta:   string
  href:  string
}

export function CompletionWidget({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const [steps, setSteps] = useState<Step[] | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      const [profileRes, prefsRes, releaseCountRes] = await Promise.all([
        supabase.from('artist_profiles').select('artist_name, bio, location, phone_number, tone').eq('user_id', userId).maybeSingle(),
        supabase.from('artist_preferences').select('genre, tone, onboarding_complete').eq('user_id', userId).maybeSingle(),
        supabase.from('releases').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ])
      if (cancelled) return

      const p = profileRes.data ?? {} as Record<string, string | null>
      const prefs = prefsRes.data ?? {} as Record<string, string | null>
      const releaseCount = releaseCountRes.count ?? 0

      const list: Step[] = [
        { id: 'name',    label: 'Artist name',         done: !!(p.artist_name ?? '').trim(),  cta: 'Set name',       href: '/dashboard/profile' },
        { id: 'bio',     label: 'Short bio',            done: !!(p.bio ?? '').trim(),          cta: 'Write bio',       href: '/dashboard/profile' },
        { id: 'genre',   label: 'Primary genre',        done: !!(prefs.genre ?? '').trim(),    cta: 'Pick genre',      href: '/dashboard/profile' },
        { id: 'tone',    label: 'uP voice (Tone)',     done: !!(p.tone ?? prefs.tone),         cta: 'Choose tone',     href: '/dashboard/profile' },
        { id: 'phone',   label: 'Connect iMessage',     done: !!(p.phone_number ?? '').trim(), cta: 'Add number',      href: '/dashboard/profile' },
        { id: 'release', label: 'First release',        done: releaseCount > 0,                cta: 'Add release',     href: '/dashboard/releases' },
      ]
      setSteps(list)
    })()
    return () => { cancelled = true }
  }, [userId])

  if (!steps) return null

  const completed = steps.filter(s => s.done).length
  const total = steps.length
  const pct = Math.round((completed / total) * 100)

  if (pct === 100) return null // hide once everything is done

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full rounded-3xl border border-white/8 bg-zinc-950/80 p-6 overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FFD700]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center">
              <Sparkles size={11} className="text-[#FFD700]" />
            </div>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Get Set Up</p>
          </div>
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            {completed} / {total} done
          </span>
        </div>

        <h4 className="text-white font-black text-lg tracking-tighter mb-1">
          Finish your Artist OS
        </h4>
        <p className="text-white/40 text-xs font-medium mb-4">
          {pct < 50
            ? "Quick wins to unlock uP's full context for you."
            : "Almost there — just a few left."}
        </p>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mb-5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#B8860B] rounded-full"
          />
        </div>

        {/* Step list */}
        <ul className="space-y-1.5">
          {steps.map(step => (
            <li key={step.id}>
              <button
                onClick={() => !step.done && navigate(step.href)}
                disabled={step.done}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
                  step.done
                    ? 'opacity-50 cursor-default'
                    : 'hover:bg-white/5 cursor-pointer'
                }`}
              >
                {step.done ? (
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center shrink-0">
                    <Check size={11} strokeWidth={3} className="text-[#FFD700]" />
                  </div>
                ) : (
                  <Circle size={20} className="text-white/15 shrink-0 group-hover:text-[#FFD700]/40 transition-colors" />
                )}
                <span className={`flex-1 text-sm font-medium ${step.done ? 'text-white/30 line-through' : 'text-white/70 group-hover:text-white'}`}>
                  {step.label}
                </span>
                {!step.done && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60 group-hover:text-[#FFD700]">
                    {step.cta} <ChevronRight size={11} />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
