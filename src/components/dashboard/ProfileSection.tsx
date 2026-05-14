"use client"

import { useState, useEffect } from "react"
import {
  Camera, MapPin, Link as LinkIcon, Globe, Plus,
  CheckCircle, CheckCircle2, Clock, ChevronRight, ExternalLink,
  Music as MusicIcon, Phone, Save, Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../hooks/useAuth"
import { GlassAccountSettingsCard } from "../ui/glass-account-settings-card"

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
  const [countryCode, setCountryCode] = useState('+1')
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

  // ─── Save phone number + trigger welcome iMessage ─────────────────────────
  async function savePhone() {
    if (!user || !profile.phone_number.trim()) return
    setPhoneState('saving')
    const fullPhone = countryCode + profile.phone_number.trim()

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

    setOriginal(prev => prev ? { ...prev, phone_number: fullPhone } : null)

    // 2. Send welcome iMessage via LoopMessage
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
      if (!msgSent) console.warn('[up-welcome] LoopMessage error:', welcomeData)
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
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="max-w-xl">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Artist Profile</h2>
          <p className="text-white/40 font-medium text-lg leading-relaxed">Your identity and credentials. Keep everything synced.</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={!isDirty || saveState === 'saving'}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isDirty
              ? 'bg-[#FFD700] text-black hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.25)]'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
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
          <div className="flex items-start gap-10 bg-zinc-900/20 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border border-white/10 relative bg-zinc-800 flex items-center justify-center">
                <span className="text-4xl font-black text-white/20 uppercase">{displayName[0]}</span>
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
                className="w-full bg-transparent text-4xl font-black text-white tracking-tighter uppercase placeholder-white/15 outline-none border-b border-transparent focus:border-[#FFD700]/30 transition-all pb-1"
              />

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-[#FFD700] flex-shrink-0" />
                <input
                  value={profile.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="City, State"
                  className="bg-transparent text-white/40 text-[11px] font-black uppercase tracking-widest placeholder-white/15 outline-none border-b border-transparent focus:border-white/10 transition-all w-full"
                />
              </div>

              {/* Bio */}
              <textarea
                value={profile.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Write a short bio…"
                className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-white/60 font-medium leading-relaxed outline-none focus:border-[#FFD700]/20 transition-all resize-none text-sm"
                rows={3}
              />
            </div>
          </div>

          {/* uP iMessage Connection */}
          <div className="bg-zinc-900/20 border border-[#FFD700]/10 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Connect via iMessage</h4>
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
              <p className="text-white/30 text-[10px] font-medium mb-6">
                Add your number and uP will text you right now to introduce itself. After that, text uP anytime — it knows your releases, calendar, and goals.
              </p>

              <div className="flex gap-3">
                <div className="flex-1 flex items-center bg-zinc-950 border border-white/5 focus-within:border-[#FFD700]/25 rounded-xl transition-all overflow-hidden">
                  <Phone size={13} className="text-white/20 flex-shrink-0 ml-4" />
                  {/* Country code select */}
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer py-3 pl-2 pr-1 flex-shrink-0 focus:ring-0 appearance-none"
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
                  {/* Subtle divider */}
                  <div className="w-px h-5 bg-white/10 flex-shrink-0" />
                  {/* Local phone number */}
                  <input
                    type="tel"
                    value={profile.phone_number}
                    onChange={e => set('phone_number', e.target.value)}
                    placeholder="(555) 000-0000"
                    className="flex-1 bg-transparent text-white text-sm font-medium placeholder-white/15 outline-none px-3 py-3"
                  />
                </div>

                <button
                  onClick={savePhone}
                  disabled={!profile.phone_number.trim() || phoneState === 'saving' || phoneState === 'sent'}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex-shrink-0 ${
                    phoneState === 'sent'
                      ? 'bg-green-500/15 border border-green-500/20 text-green-400'
                      : phoneState === 'msg_error'
                      ? 'bg-red-500/15 border border-red-500/20 text-red-400'
                      : profile.phone_number.trim()
                      ? 'bg-[#FFD700] text-black hover:scale-105 shadow-[0_0_16px_rgba(255,215,0,0.2)]'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
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
                   'Connect & text me'}
                </button>
              </div>

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
                    ✗ Number saved, but the text didn't send. Check that BLOOIO_API_KEY is set in Netlify env vars, then retry.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem]">
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
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
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{cred.label}</span>
                    <span className="text-white font-bold text-sm tracking-tight group-hover:text-[#FFD700] transition-colors uppercase">{cred.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem]">
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
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
                      step.done ? "bg-[#FFD700] border-transparent text-black" : "bg-white/5 border-white/10"
                    }`}>
                      {step.done && <CheckCircle size={11} strokeWidth={3} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step.done ? "text-white/60" : "text-white/20"}`}>
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
          <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5">
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Official Links</h4>
            <div className="space-y-3">
              {[
                { label: "Official Website", icon: <Globe size={15} /> },
                { label: "Smart Link",       icon: <LinkIcon size={15} /> },
                { label: "Latest Release",   icon: <MusicIcon size={15} /> },
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/8 transition-all">
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                  </div>
                  <ExternalLink size={13} className="opacity-20" />
                </button>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/3 border border-dashed border-white/10 text-white/20 hover:text-white/40 transition-colors">
                <Plus size={13} />
                <span className="text-[9px] font-black uppercase tracking-widest">Add link</span>
              </button>
            </div>
          </div>

          {/* Last sync */}
          <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-[#FFD700]/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[#FFD700]/5 pointer-events-none">
              <Clock size={70} />
            </div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 relative z-10">Last Profile Update</h4>
            <div className="relative z-10 space-y-1">
              <p className="text-white font-black text-2xl tracking-tighter">Just now</p>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">Synced to GrounduP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div>
        <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-6">Subscription</h3>
        <GlassAccountSettingsCard />
      </div>
    </div>
  )
}
