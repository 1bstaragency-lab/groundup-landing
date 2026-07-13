"use client"

import { useState, useEffect } from "react"
import {
  Camera, MapPin, Link as LinkIcon, Globe, Plus,
  CheckCircle, CheckCircle2, Clock, ChevronRight, ExternalLink,
  Music as MusicIcon, Phone, Save, Loader2, Lock, Pencil,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import { GlassAccountSettingsCard } from "../ui/glass-account-settings-card"
import { PlanGate } from "../ui/PlanGate"
import { CheckInSettingsCard } from "./CheckInSettingsCard"

interface Profile {
  artist_name: string
  bio:          string
  location:     string
  phone_number: string
  tone:         string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function ProfileSection() {
  const { user } = useAuth()

  const [profile, setProfile]   = useState<Profile>({
    artist_name:  '',
    bio:          '',
    location:     '',
    phone_number: '',
    tone:         'Assistant Manager',
  })
  const [original, setOriginal] = useState<Profile | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [phoneState, setPhoneState] = useState<'idle' | 'saving' | 'sent' | 'error' | 'msg_error'>('idle')
  const [phoneErr, setPhoneErr] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState('+1')
  const [editingPhone, setEditingPhone] = useState(false)
  const [loading, setLoading]   = useState(true)

  // ─── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabase
      .from('artist_profiles')
      .select('artist_name, bio, location, phone_number, tone')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const p: Profile = {
            artist_name:  data.artist_name  ?? '',
            bio:          data.bio          ?? '',
            location:     data.location     ?? '',
            phone_number: data.phone_number ?? '',
            tone:         data.tone         ?? 'Assistant Manager',
          }
          setProfile(p)
          setOriginal(p)
        }
        setLoading(false)
      })
  }, [user])

  const isDirty = original !== null && (
    profile.artist_name !== original.artist_name ||
    profile.bio         !== original.bio         ||
    profile.location    !== original.location     ||
    profile.tone        !== original.tone
  )

  // ─── Save general profile ──────────────────────────────────────────────────
  async function saveProfile() {
    if (!user || !isDirty) return
    setSaveState('saving')
    const { error } = await supabase
      .from('artist_profiles')
      .upsert({
        user_id:     user.id,
        artist_name: profile.artist_name,
        bio:         profile.bio,
        location:    profile.location,
        tone:        profile.tone,
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      setSaveState('error')
    } else {
      setOriginal({ ...profile })
      setSaveState('saved')
    }
    setTimeout(() => setSaveState('idle'), 2500)
  }

  // Pretty-format a stored E.164 phone like "+13236295415" → "+1 (323) 629-5415"
  function formatStoredPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return raw
  }

  // ─── Save phone number + trigger welcome iMessage ─────────────────────────
  async function savePhone() {
    if (!user || !profile.phone_number.trim()) return
    setPhoneErr(null)
    setPhoneState('saving')
    // Strip all non-digits and rebuild as E.164 — guarantees lookup will work
    const rawDigits = (countryCode + profile.phone_number).replace(/\D/g, '')
    const fullPhone = '+' + rawDigits

    // 1. Persist to Supabase
    const { error } = await supabase
      .from('artist_profiles')
      .upsert({
        user_id:      user.id,
        phone_number: fullPhone,
        updated_at:   new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      setPhoneState('error')
      setTimeout(() => setPhoneState('idle'), 2500)
      return
    }

    setOriginal(prev => prev
      ? { ...prev, phone_number: fullPhone }
      : { artist_name: '', bio: '', location: '', phone_number: fullPhone, tone: 'Assistant Manager' }
    )
    // Sync the form field to the canonical stored value & exit edit mode
    setProfile(prev => ({ ...prev, phone_number: fullPhone }))
    setEditingPhone(false)

    // 2. Send welcome iMessage via Blooio
    let msgSent = false
    try {
      const welcomeRes = await fetch('/.netlify/functions/up-welcome', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone:      fullPhone,
          artistName: profile.artist_name || user.email,
          tone:       profile.tone,
        }),
      })
      const welcomeData = await welcomeRes.json().catch(() => ({}))
      console.log('[up-welcome] result:', welcomeData)
      msgSent = welcomeData.ok === true
      if (!msgSent) {
        console.warn('[up-welcome] Blooio error:', welcomeData)
        // Surface the real provider message instead of a generic one
        const apiMsg = welcomeData?.data?.message || welcomeData?.error
        if (apiMsg) setPhoneErr(String(apiMsg))
      }
    } catch (err) {
      console.error('[up-welcome] fetch failed:', err)
    }

    if (msgSent) {
      setPhoneState('sent')
      setTimeout(() => setPhoneState('idle'), 5000)
    } else {
      setPhoneState('msg_error')
      setTimeout(() => setPhoneState('idle'), 6000)
    }
  }

  function set(key: keyof Profile, val: string) {
    setProfile(prev => ({ ...prev, [key]: val }))
  }

  const displayName = profile.artist_name || user?.email?.split('@')[0] || 'Artist'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="text-[#FFD700] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-[var(--dash-border)] pb-10">
        <div className="max-w-xl">
          <h2 className="text-5xl font-black text-[rgb(var(--dash-fg))] tracking-tighter mb-4 uppercase">Artist Profile</h2>
          <p className="text-[rgba(var(--dash-fg),0.52)] font-medium text-lg leading-relaxed">Your identity and credentials. Keep everything synced.</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={!isDirty || saveState === 'saving'}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isDirty
              ? 'bg-[#FFD700] text-black hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.25)]'
              : 'bg-[rgba(var(--dash-fg),0.05)] text-[rgba(var(--dash-fg),0.46)] cursor-not-allowed'
          }`}
        >
          {saveState === 'saving' ? <Loader2 size={12} className="animate-spin" /> :
           saveState === 'saved'  ? <CheckCircle size={12} /> :
                                    <Save size={12} />}
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : 'Update Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Bio card */}
          <div className="flex items-start gap-10 bg-[var(--dash-card-alt)] border border-[var(--dash-border)] p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border border-[rgba(var(--dash-fg),0.15)] relative bg-[rgba(var(--dash-fg),0.08)] flex items-center justify-center">
                <span className="text-4xl font-black text-[rgba(var(--dash-fg),0.46)] uppercase">{displayName[0]}</span>
                <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
              {/* Artist name */}
              <input
                value={profile.artist_name}
                onChange={e => set('artist_name', e.target.value)}
                placeholder="Your artist name"
                className="w-full bg-transparent text-4xl font-black text-[rgb(var(--dash-fg))] tracking-tighter uppercase placeholder:text-[rgba(var(--dash-fg),0.35)] outline-none border-b border-transparent focus:border-[#FFD700]/30 transition-all pb-1"
              />

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-[#FFD700] flex-shrink-0" />
                <input
                  value={profile.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="City, State"
                  className="bg-transparent text-[rgba(var(--dash-fg),0.52)] text-[11px] font-black uppercase tracking-widest placeholder:text-[rgba(var(--dash-fg),0.35)] outline-none border-b border-transparent focus:border-[rgba(var(--dash-fg),0.15)] transition-all w-full"
                />
              </div>

              {/* Bio */}
              <textarea
                value={profile.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Write a short bio…"
                className="w-full bg-[rgba(var(--dash-fg),0.04)] border border-[var(--dash-border)] rounded-2xl p-4 text-[rgba(var(--dash-fg),0.6)] font-medium leading-relaxed outline-none focus:border-[#FFD700]/20 transition-all resize-none text-sm"
                rows={3}
              />
            </div>
          </div>

          {/* uP iMessage Connection — Pro+ feature */}
          <PlanGate required="pro" feature="uP iMessage" mode="block">
          <div className="bg-[var(--dash-card-alt)] border border-[#FFD700]/10 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[rgb(var(--dash-fg))] font-black text-xs uppercase tracking-widest">Connect via iMessage</h4>
                {/* Blue verified badge */}
                <span
                  style={{ backgroundColor: '#1D9BF0', width: 16, height: 16 }}
                  className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded-full">uP</span>
              </div>
              <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] font-medium mb-6">
                Add your number and uP will text you right now to introduce itself. After that, text uP anytime — it knows your releases, calendar, and goals.
              </p>

              {/* If a phone is saved AND user isn't editing → show locked state */}
              {!!original?.phone_number && !editingPhone ? (
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="flex-1 flex items-center bg-[var(--dash-card)] border border-green-500/15 rounded-xl px-4 py-3 gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
                      <Lock size={13} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[rgb(var(--dash-fg))] font-bold text-sm tracking-tight truncate">{formatStoredPhone(original.phone_number)}</p>
                      <p className="text-green-400/70 text-[9px] font-black uppercase tracking-widest mt-0.5">
                        ✓ Connected & bound to your account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPhone(true)
                      // Reset to local digits for editing
                      const local = original.phone_number.replace(/^\+1/, '').replace(/\D/g, '')
                      setProfile(prev => ({ ...prev, phone_number: local }))
                      setPhoneState('idle')
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest bg-[rgba(var(--dash-fg),0.05)] border border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.55)] hover:text-[rgb(var(--dash-fg))] hover:border-[rgba(var(--dash-fg),0.25)] transition-all flex-shrink-0"
                  >
                    <Pencil size={11} />
                    Change Number
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center bg-[var(--dash-card)] border border-[var(--dash-border)] focus-within:border-[#FFD700]/25 rounded-xl transition-all overflow-hidden">
                    <Phone size={13} className="text-[rgba(var(--dash-fg),0.46)] flex-shrink-0 ml-4" />
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="bg-transparent text-[rgb(var(--dash-fg))] text-sm font-medium outline-none cursor-pointer py-3 pl-2 pr-1 flex-shrink-0 focus:ring-0 appearance-none"
                      style={{ width: 90 }}
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+1CA">🇨🇦 +1 CA</option>
                      <option value="+1JM">🇯🇲 +1 JM</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+82">🇰🇷 +82</option>
                      <option value="+31">🇳🇱 +31</option>
                      <option value="+34">🇪🇸 +34</option>
                    </select>
                    <div className="w-px h-5 bg-[rgba(var(--dash-fg),0.15)] flex-shrink-0" />
                    <input
                      type="tel"
                      value={profile.phone_number}
                      onChange={e => set('phone_number', e.target.value)}
                      placeholder="(555) 000-0000"
                      className="flex-1 bg-transparent text-[rgb(var(--dash-fg))] text-sm font-medium placeholder:text-[rgba(var(--dash-fg),0.35)] outline-none px-3 py-3"
                    />
                  </div>

                  <button
                    onClick={savePhone}
                    disabled={!profile.phone_number.trim() || phoneState === 'saving' || phoneState === 'sent'}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex-shrink-0 ${
                      phoneState === 'sent'
                        ? 'bg-green-500/15 border border-green-500/20 text-green-400'
                        : phoneState === 'msg_error'
                        ? 'bg-red-500/15 border border-red-500/20 text-red-400'
                        : profile.phone_number.trim()
                        ? 'bg-[#FFD700] text-black hover:scale-105 shadow-[0_0_16px_rgba(255,215,0,0.2)]'
                        : 'bg-[rgba(var(--dash-fg),0.05)] text-[rgba(var(--dash-fg),0.46)] cursor-not-allowed'
                    }`}
                  >
                    {phoneState === 'saving'    && <Loader2 size={11} className="animate-spin" />}
                    {phoneState === 'sent'      && <CheckCircle size={11} />}
                    {phoneState === 'msg_error' && <span>⚠</span>}
                    {(phoneState === 'idle' || phoneState === 'error') && <CheckCircle2 size={11} />}
                    {phoneState === 'saving'    ? 'Sending…' :
                     phoneState === 'sent'      ? 'Check your texts!' :
                     phoneState === 'msg_error' ? 'Text failed — check logs' :
                     phoneState === 'error'     ? 'Error — retry' :
                     original?.phone_number     ? 'Save New Number' :
                     'Connect & text me'}
                  </button>
                </div>
              )}

              {/* Cancel button — only shown when actively editing an existing number */}
              {!!original?.phone_number && editingPhone && phoneState !== 'sent' && phoneState !== 'saving' && (
                <button
                  onClick={() => {
                    setEditingPhone(false)
                    setProfile(prev => ({ ...prev, phone_number: original?.phone_number ?? '' }))
                    setPhoneState('idle')
                  }}
                  className="text-[rgba(var(--dash-fg),0.5)] hover:text-[rgba(var(--dash-fg),0.6)] text-[10px] font-black uppercase tracking-widest mt-3 transition-colors"
                >
                  ← Cancel
                </button>
              )}

              <AnimatePresence>
                {phoneState === 'sent' && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-green-400/70 text-[10px] font-bold mt-3"
                  >
                    ✓ uP just texted you — reply to that thread anytime to chat with your AI from your phone.
                  </motion.p>
                )}
                {phoneState === 'msg_error' && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400/70 text-[10px] font-bold mt-3"
                  >
                    ✗ Number saved, but the welcome text didn't send.
                    {phoneErr ? ` ${phoneErr}` : ' Try again in a moment.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          </PlanGate>

          {/* uP Daily Check-In — Pro+ feature */}
          {user && (
            <PlanGate required="pro" feature="uP Daily Check-Ins" mode="block">
              <CheckInSettingsCard userId={user.id} />
            </PlanGate>
          )}

          {/* Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--dash-card-alt)] border border-[var(--dash-border)] p-8 rounded-[2.5rem]">
              <h4 className="text-[rgb(var(--dash-fg))] font-black text-xs uppercase tracking-widest mb-6 border-b border-[var(--dash-border)] pb-4 flex items-center justify-between">
                Industry Credentials <ChevronRight size={14} className="text-[#FFD700]" />
              </h4>
              <div className="space-y-5">
                {[
                  { label: "PRO",          val: "ASCAP" },
                  { label: "Publisher",    val: "—" },
                  { label: "Distribution", val: "Independent" },
                  { label: "Booking",      val: "—" },
                ].map((cred, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-[rgba(var(--dash-fg),0.46)] text-[10px] font-black uppercase tracking-widest">{cred.label}</span>
                    <span className="text-[rgb(var(--dash-fg))] font-bold text-sm tracking-tight group-hover:text-[#FFD700] transition-colors uppercase">{cred.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--dash-card-alt)] border border-[var(--dash-border)] p-8 rounded-[2.5rem]">
              <h4 className="text-[rgb(var(--dash-fg))] font-black text-xs uppercase tracking-widest mb-6 border-b border-[var(--dash-border)] pb-4 flex items-center justify-between">
                Verification Progress <ChevronRight size={14} className="text-[#FFD700]" />
              </h4>
              <div className="space-y-5">
                {[
                  { label: "Email Verified",         done: !!user?.email },
                  { label: "Phone Connected",         done: !!original?.phone_number },
                  { label: "Catalog Added",           done: false },
                  { label: "Official Artist Profile", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                      step.done ? "bg-[#FFD700] border-transparent text-black" : "bg-[rgba(var(--dash-fg),0.05)] border-[rgba(var(--dash-fg),0.15)]"
                    }`}>
                      {step.done && <CheckCircle size={11} strokeWidth={3} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step.done ? "text-[rgba(var(--dash-fg),0.6)]" : "text-[rgba(var(--dash-fg),0.46)]"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Official links */}
          <div className="bg-[var(--dash-card)] p-8 rounded-[2.5rem] border border-[var(--dash-border)]">
            <h4 className="text-[rgb(var(--dash-fg))] font-black text-xs uppercase tracking-widest mb-6">Official Links</h4>
            <div className="space-y-3">
              {[
                { label: "Official Website", icon: <Globe size={15} /> },
                { label: "Smart Link",       icon: <LinkIcon size={15} /> },
                { label: "Latest Release",   icon: <MusicIcon size={15} /> },
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[rgba(var(--dash-fg),0.05)] border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))] hover:bg-[rgba(var(--dash-fg),0.08)] transition-all">
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                  </div>
                  <ExternalLink size={13} className="opacity-20" />
                </button>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-[rgba(var(--dash-fg),0.03)] border border-dashed border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.46)] hover:text-[rgba(var(--dash-fg),0.52)] transition-colors">
                <Plus size={13} />
                <span className="text-[9px] font-black uppercase tracking-widest">Add link</span>
              </button>
            </div>
          </div>

          {/* Last sync */}
          <div className="bg-[var(--dash-card)] p-8 rounded-[2.5rem] border border-[#FFD700]/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[#FFD700]/5 pointer-events-none">
              <Clock size={70} />
            </div>
            <h4 className="text-[rgb(var(--dash-fg))] font-black text-xs uppercase tracking-widest mb-6 relative z-10">Last Profile Update</h4>
            <div className="relative z-10 space-y-1">
              <p className="text-[rgb(var(--dash-fg))] font-black text-2xl tracking-tighter">Just now</p>
              <p className="text-[rgba(var(--dash-fg),0.46)] text-[9px] font-black uppercase tracking-[0.2em]">Synced to GrounduP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div>
        <h3 className="text-[rgb(var(--dash-fg))] font-black text-2xl uppercase tracking-tighter mb-6">Subscription</h3>
        <GlassAccountSettingsCard />
      </div>
    </div>
  )
}
