"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, TrendingUp, Calendar, BookOpen,
  Users, Network, BarChart2, Zap, Check, Play, Disc3,
  MessageCircle, Sparkles } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Callout {
  text: string
  x: string
  y: string
  point?: "top" | "bottom" | "left" | "right"
  delay?: number
}

interface Slide {
  id: string
  label: string
  title: string
  subtitle: string
  accent: string
  mockup: React.FC
  callouts: Callout[]
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

function Home2({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}

function MockupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full bg-zinc-950 rounded-2xl overflow-hidden border border-white/8 flex">
      <div className="w-14 bg-black border-r border-white/5 flex flex-col items-center py-4 gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#FFD700]/20 flex items-center justify-center mb-2">
          <div className="w-3 h-3 rounded-sm bg-[#FFD700]" />
        </div>
        {[Home2, TrendingUp, Calendar, BookOpen, Network, Users].map((Icon, i) => (
          <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-white/10 text-white' : 'text-white/20'}`}>
            <Icon size={14} />
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="h-10 border-b border-white/5 bg-black/40 flex items-center px-4 gap-2 shrink-0">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
          </div>
          <div className="flex-1 mx-4 h-5 bg-white/5 rounded-full" />
        </div>
        <div className="flex-1 overflow-hidden p-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Mockups — static renders, no per-element motion ─────────────────────────

function MockupUP() {
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Chat with uP</div>
        <div className="flex-1 space-y-2 overflow-hidden">
          {[
            { from: "bot", text: "Hey! I'm uP, your GrounduP assistant. What are we working on today?" },
            { from: "user", text: "Check my release schedule for next month" },
            { from: "bot", text: "You have 'Midnight City' on Oct 14 and 'Echos of Us' Oct 28. Assets needed for both." },
          ].map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
              {msg.from === "bot" && (
                <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[6px] font-black text-[#FFD700]">uP</span>
                </div>
              )}
              <div className={`max-w-[78%] px-3 py-2 rounded-xl text-[9px] font-medium leading-relaxed ${
                msg.from === "user" ? "bg-[#FFD700]/15 border border-[#FFD700]/20 text-white" : "bg-zinc-800/80 border border-white/5 text-white/70"
              }`}>{msg.text}</div>
            </div>
          ))}
        </div>
        <div className="h-8 bg-zinc-900/60 rounded-xl border border-white/5 flex items-center px-3 gap-2">
          <span className="text-white/20 text-[9px]">Ask uP anything…</span>
          <div className="ml-auto w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center">
            <ChevronRight size={10} className="text-black" strokeWidth={3} />
          </div>
        </div>
      </div>
    </MockupShell>
  )
}

function MockupDashboard() {
  const stats = [
    { label: "Streams", val: "2.4M", color: "text-green-400", up: "+12%" },
    { label: "Listeners", val: "94K", color: "text-[#FFD700]", up: "+8%" },
    { label: "IG Reach", val: "340K", color: "text-pink-400", up: "+22%" },
    { label: "TikTok", val: "1.1M", color: "text-sky-400", up: "+41%" },
  ]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Dashboard Overview</div>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-xl p-2">
              <p className={`text-[8px] font-black uppercase tracking-wide ${s.color} mb-1`}>{s.label}</p>
              <p className="text-white font-black text-sm leading-none">{s.val}</p>
              <p className="text-green-400 text-[8px] font-bold mt-0.5">{s.up}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Stream Trend</p>
          <svg viewBox="0 0 200 50" className="w-full" style={{ height: 50 }}>
            <defs>
              <linearGradient id="demo-dg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M 0 40 C 20 35, 40 20, 60 22 S 100 30, 120 15 S 160 5, 200 10 L 200 50 L 0 50 Z" fill="url(#demo-dg)" />
            <path d="M 0 40 C 20 35, 40 20, 60 22 S 100 30, 120 15 S 160 5, 200 10" fill="none" stroke="#FFD700" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </MockupShell>
  )
}

function MockupReleases() {
  const releases = [
    { title: "Midnight City", type: "Single", date: "Oct 14", progress: 72, color: "bg-[#FFD700]" },
    { title: "Echos of Us", type: "EP", date: "Oct 28", progress: 35, color: "bg-blue-400" },
  ]
  const tasks = ["Cover art approved", "Pre-save link live", "Spotify pitch submitted", "TikTok assets ready"]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Release Pipeline</div>
        <div className="space-y-2">
          {releases.map((r, i) => (
            <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-black text-[11px]">{r.title}</p>
                  <p className="text-white/30 text-[8px] font-bold uppercase">{r.type} · {r.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Disc3 size={12} className="text-[#FFD700]" />
                  <span className="text-[#FFD700] text-[9px] font-black">{r.progress}%</span>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-3 space-y-1.5">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Rollout Checklist</p>
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${i < 3 ? 'bg-[#FFD700]/20 border border-[#FFD700]/40' : 'bg-white/5 border border-white/10'}`}>
                {i < 3 && <Check size={7} className="text-[#FFD700]" strokeWidth={3} />}
              </div>
              <span className={`text-[8px] font-bold ${i < 3 ? 'text-white/50 line-through' : 'text-white/70'}`}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

function MockupAnalytics() {
  const platforms = [
    { name: "Spotify", val: "2.4M", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", bar: 80 },
    { name: "Apple Music", val: "890K", color: "text-pink-300", bg: "bg-pink-300/10 border-pink-300/20", bar: 45 },
    { name: "TikTok", val: "1.1M", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20", bar: 65 },
    { name: "YouTube", val: "540K", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", bar: 35 },
  ]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Real-time Analytics</div>
        <div className="space-y-2 flex-1">
          {platforms.map((p, i) => (
            <div key={i} className={`border rounded-xl p-2.5 flex items-center gap-3 ${p.bg}`}>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wide ${p.color}`}>{p.name}</span>
                  <span className="text-white font-black text-[10px]">{p.val}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color.replace('text-', 'bg-')}`} style={{ width: `${p.bar}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <BarChart2 size={14} className="text-[#FFD700]" />
          <div>
            <p className="text-white font-black text-[10px]">All platforms. One view.</p>
            <p className="text-white/30 text-[8px]">Updated every 15 minutes</p>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>
    </MockupShell>
  )
}

function MockupLearn() {
  const guides = [
    { cat: "TikTok", title: "TikTok Algorithm Decoded", pages: 18, color: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
    { cat: "Spotify", title: "Algorithmic Playlisting Bible", pages: 22, color: "text-green-400 bg-green-400/10 border-green-400/20" },
    { cat: "Outreach", title: "Blog Outreach Playbook", pages: 15, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  ]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Knowledge Base</div>
        <div className="space-y-2 flex-1">
          {guides.map((g, i) => (
            <div key={i} className={`border rounded-xl p-3 flex items-center gap-3 ${g.color}`}>
              <BookOpen size={14} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-[9px] truncate">{g.title}</p>
                <p className="text-white/30 text-[8px]">{g.pages} pages · Read aloud</p>
              </div>
              <Play size={10} className="text-white/40 shrink-0" />
            </div>
          ))}
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Play size={10} className="text-[#FFD700]" />
            <span className="text-white font-black text-[9px]">Now Reading</span>
            <span className="ml-auto text-white/20 text-[8px]">4:32 / 12:00</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD700] rounded-full" style={{ width: "38%" }} />
          </div>
        </div>
      </div>
    </MockupShell>
  )
}

function MockupInfluencer() {
  const influencers = [
    { name: "HipHopDX", niche: "Hip-Hop Media", followers: "2.1M", pro: true },
    { name: "Pigeons & Planes", niche: "Music Blog", followers: "890K", pro: true },
    { name: "EARMILK", niche: "Discovery Blog", followers: "450K", pro: false },
  ]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Influencer Network</div>
        <div className="space-y-2 flex-1">
          {influencers.map((inf, i) => (
            <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <Network size={12} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-[10px]">{inf.name}</p>
                <p className="text-white/30 text-[8px]">{inf.niche} · {inf.followers}</p>
              </div>
              <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-wide ${
                inf.pro ? 'bg-[#FFD700] text-black' : 'bg-white/5 border border-white/10 text-white/40'
              }`}>{inf.pro ? 'Email' : 'Unlock'}</div>
            </div>
          ))}
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-2">
          <MessageCircle size={12} className="text-[#FFD700]" />
          <span className="text-white/50 text-[9px] font-bold">Auto-drafts personalized pitch emails</span>
        </div>
      </div>
    </MockupShell>
  )
}

function MockupScheduler() {
  const posts = [
    { time: "Mon 9AM", type: "TikTok", content: "Behind the scenes clip", color: "border-sky-400/30 bg-sky-400/5" },
    { time: "Wed 12PM", type: "Instagram", content: "Cover art reveal", color: "border-pink-400/30 bg-pink-400/5" },
    { time: "Fri 6PM", type: "YouTube", content: "Music video premiere", color: "border-red-400/30 bg-red-400/5" },
  ]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Content Scheduler</div>
        <div className="space-y-2 flex-1">
          {posts.map((p, i) => (
            <div key={i} className={`border rounded-xl p-3 flex items-center gap-3 ${p.color}`}>
              <div className="text-center shrink-0">
                <p className="text-[7px] font-black text-white/30 uppercase">{p.time.split(' ')[0]}</p>
                <p className="text-white font-black text-[10px]">{p.time.split(' ')[1]}</p>
              </div>
              <div className="w-px h-6 bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-[8px] font-black uppercase tracking-wide">{p.type}</p>
                <p className="text-white font-bold text-[9px] truncate">{p.content}</p>
              </div>
              <Calendar size={11} className="text-white/20 shrink-0" />
            </div>
          ))}
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-2">
          <Zap size={12} className="text-[#FFD700]" />
          <span className="text-white/50 text-[9px] font-bold">AI suggests optimal posting times based on your audience</span>
        </div>
      </div>
    </MockupShell>
  )
}

function MockupTeam() {
  const members = [
    { name: "You", role: "Artist", avatar: "🎤", active: true },
    { name: "Jordan M.", role: "Manager", avatar: "💼", active: true },
    { name: "Kai L.", role: "Producer", avatar: "🎧", active: false },
    { name: "Sam R.", role: "Designer", avatar: "🎨", active: true },
  ]
  return (
    <MockupShell>
      <div className="h-full flex flex-col gap-3">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Team Workspace</div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {members.map((m, i) => (
            <div key={i} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-base relative">
                {m.avatar}
                {m.active && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-zinc-900" />}
              </div>
              <p className="text-white font-black text-[9px]">{m.name}</p>
              <p className="text-white/30 text-[7px] font-bold uppercase tracking-wide">{m.role}</p>
            </div>
          ))}
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-2">
          <Users size={12} className="text-[#FFD700]" />
          <span className="text-white/50 text-[9px] font-bold">Shared tasks, assets & release access — all in one place</span>
        </div>
      </div>
    </MockupShell>
  )
}

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES: Slide[] = [
  {
    id: "up", label: "01 / uP AI", accent: "#FFD700",
    title: "Meet uP — Your AI Concierge",
    subtitle: "uP is your always-on music career assistant. Ask it about your release schedule, get strategy recommendations, draft outreach emails, and more — 24/7.",
    mockup: MockupUP,
    callouts: [
      { text: "uP answers questions about your career in real time", x: "62%", y: "12%", point: "left", delay: 0.5 },
      { text: "Auto-drafts personalized messages on your behalf", x: "5%", y: "72%", point: "right", delay: 1.0 },
    ],
  },
  {
    id: "dashboard", label: "02 / Dashboard", accent: "#FFD700",
    title: "Your Artist OS at a Glance",
    subtitle: "Every metric that matters — streams, listeners, social growth, and more — unified in one real-time command center. No more jumping between 8 different apps.",
    mockup: MockupDashboard,
    callouts: [
      { text: "Live stats across every platform you're on", x: "60%", y: "10%", point: "left", delay: 0.4 },
      { text: "Stream trend updated every 15 minutes", x: "5%", y: "68%", point: "right", delay: 0.9 },
    ],
  },
  {
    id: "releases", label: "03 / Releases", accent: "#4299E1",
    title: "Plan Every Release Like a Pro",
    subtitle: "Build your rollout from scratch in minutes. uP generates a customized release checklist based on your timeline, budget, and focus areas — then tracks it automatically.",
    mockup: MockupReleases,
    callouts: [
      { text: "Visual progress tracker per release", x: "5%", y: "22%", point: "right", delay: 0.4 },
      { text: "AI-generated rollout checklist auto-adapts to your plan", x: "5%", y: "70%", point: "right", delay: 0.9 },
    ],
  },
  {
    id: "analytics", label: "04 / Analytics", accent: "#48BB78",
    title: "Real-Time Performance Data",
    subtitle: "Connect Spotify, Apple Music, TikTok, YouTube, Instagram and more. GrounduP pulls it all into one view — no APIs to maintain, no spreadsheets.",
    mockup: MockupAnalytics,
    callouts: [
      { text: "7 platforms connected in one view", x: "60%", y: "8%", point: "left", delay: 0.4 },
      { text: "Compare platform performance side by side", x: "60%", y: "75%", point: "left", delay: 0.9 },
    ],
  },
  {
    id: "learn", label: "05 / Knowledge", accent: "#9F7AEA",
    title: "Industry Knowledge On Demand",
    subtitle: "Curated playbooks on TikTok algorithms, Spotify playlisting, blog outreach, and more. Read or listen — uP reads them aloud so you can learn while you create.",
    mockup: MockupLearn,
    callouts: [
      { text: "Guides written specifically for independent artists", x: "60%", y: "12%", point: "left", delay: 0.4 },
      { text: "Text-to-speech so you can listen while you work", x: "5%", y: "80%", point: "right", delay: 0.9 },
    ],
  },
  {
    id: "influencers", label: "06 / Network", accent: "#F6E05E",
    title: "Direct Access to the Industry",
    subtitle: "Browse curators, blogs, playlist owners, and media contacts. Click any card and uP auto-drafts a personalized pitch email — ready to send in seconds.",
    mockup: MockupInfluencer,
    callouts: [
      { text: "200+ curators, blogs, and playlist owners", x: "60%", y: "10%", point: "left", delay: 0.4 },
      { text: "One click generates a personalized outreach email", x: "38%", y: "52%", point: "top", delay: 0.9 },
    ],
  },
  {
    id: "scheduler", label: "07 / Scheduler", accent: "#63B3ED",
    title: "Content Scheduling, Simplified",
    subtitle: "Plan your entire content calendar across TikTok, Instagram, and YouTube in one place. AI suggests optimal posting times based on your audience's activity patterns.",
    mockup: MockupScheduler,
    callouts: [
      { text: "Schedule across all platforms from one calendar", x: "60%", y: "10%", point: "left", delay: 0.4 },
      { text: "AI timing recommendations based on your audience", x: "5%", y: "80%", point: "right", delay: 0.9 },
    ],
  },
  {
    id: "team", label: "08 / Team", accent: "#68D391",
    title: "Collaborate With Your Whole Team",
    subtitle: "Invite your manager, producer, designer, and label — everyone sees the same releases, tasks, and data. Role-based access keeps the right people in the right places.",
    mockup: MockupTeam,
    callouts: [
      { text: "Real-time presence — see who's active right now", x: "60%", y: "10%", point: "left", delay: 0.4 },
      { text: "Shared tasks, assets, and release access for every role", x: "5%", y: "80%", point: "right", delay: 0.9 },
    ],
  },
]

// ─── Callout bubble — no backdrop-blur ───────────────────────────────────────

function CalloutBubble({ callout, slideKey }: { callout: Callout; slideKey: string }) {
  return (
    <motion.div
      key={`${slideKey}-${callout.text}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: callout.delay ?? 0.5, duration: 0.25 }}
      className="absolute z-20 pointer-events-none"
      style={{ left: callout.x, top: callout.y, transform: "translate(-50%, -50%)" }}
    >
      <div className="relative bg-[#FFD700]/90 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(255,215,0,0.3)] max-w-[140px]">
        <div className={`absolute w-2 h-2 bg-[#FFD700]/90 rotate-45 ${
          callout.point === 'left'   ? 'right-[-4px] top-1/2 -translate-y-1/2' :
          callout.point === 'right'  ? 'left-[-4px] top-1/2 -translate-y-1/2' :
          callout.point === 'top'    ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                                       'top-[-4px] left-1/2 -translate-x-1/2'
        }`} />
        <p className="text-black font-black text-[9px] leading-snug relative z-10">{callout.text}</p>
      </div>
    </motion.div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface DemoModalProps { onClose: () => void }

export function DemoModal({ onClose }: DemoModalProps) {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]
  const Mockup = slide.mockup

  function prev() { setCurrent(c => Math.max(0, c - 1)) }
  function next() { if (current < SLIDES.length - 1) setCurrent(c => c + 1); else onClose() }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [current])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/88"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-5xl bg-zinc-950 border border-white/8 rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
              <Sparkles size={11} className="text-[#FFD700]" />
            </div>
            <span className="text-white font-black text-[11px] uppercase tracking-widest">GrounduP Product Tour</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-200 ${i === current ? 'w-4 h-1.5 bg-[#FFD700]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left info panel */}
          <div className="w-full md:w-[38%] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 shrink-0">
            <div className="relative flex-1 overflow-hidden mb-6">
              <AnimatePresence mode="sync">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: slide.accent }}>
                    {slide.label}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">
                    {slide.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={current === 0}
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                style={{ background: slide.accent, color: '#000' }}
              >
                {current === SLIDES.length - 1 ? "Get Started" : "Next"}
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>

            <p className="text-white/15 text-[9px] font-black uppercase tracking-widest mt-3 text-center">
              {current + 1} of {SLIDES.length} · Press → to advance
            </p>
          </div>

          {/* Right mockup panel */}
          <div className="flex-1 p-5 relative min-h-[320px]">
            <AnimatePresence mode="sync">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-5 relative"
              >
                <div className="w-full h-full" style={{ minHeight: 320 }}>
                  <Mockup />
                </div>
                {slide.callouts.map((callout, i) => (
                  <CalloutBubble key={i} callout={callout} slideKey={slide.id} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
