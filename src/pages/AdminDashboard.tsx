import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const ADMIN_EMAILS = ['1bstaragency@gmail.com', 'josephbarnes@groundupapp.com']

// ── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  user_id: string
  email: string
  artist_name: string
  phone_number: string | null
  plan_tier: string
  has_stripe: boolean
  messages_total: number
  messages_today: number
  api_cost_usd: number
  joined_at: string
  last_sign_in: string | null
  confirmed: boolean
}

interface GuestProfile {
  phone_number: string
  artist_name: string | null
  onboarding_step: number
  message_count: number
  created_at: string
}

interface AdminData {
  stats: {
    total_users: number
    active_today: number
    total_messages: number
    total_cost_usd: number
    guests_in_funnel: number
    plan_breakdown: Record<string, number>
  }
  users: AdminUser[]
  guest_funnel: { step: number; count: number }[]
  guests: GuestProfile[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const STEP_LABELS: Record<number, string> = {
  0: 'New visitor',
  1: 'Got name',
  2: 'Got listeners',
  3: 'Got goal',
  4: 'Got email',
}

const PLAN_COLORS: Record<string, string> = {
  free:   'bg-white/10 text-white/50',
  pro:    'bg-blue-500/20 text-blue-300',
  growth: 'bg-[#FFD700]/20 text-[#FFD700]',
}

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function fmt(n: number) { return n.toLocaleString() }

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-1 ${accent ? 'border-[#FFD700]/30 bg-[#FFD700]/5' : 'border-white/8 bg-white/3'}`}>
      <p className="text-white/40 text-xs font-medium uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-black ${accent ? 'text-[#FFD700]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-white/30 text-xs">{sub}</p>}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const navigate   = useNavigate()
  const [data, setData]       = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [tab, setTab]         = useState<'users' | 'guests'>('users')
  const [sort, setSort]       = useState<{ col: keyof AdminUser; dir: 1 | -1 }>({ col: 'joined_at', dir: -1 })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }
      if (!ADMIN_EMAILS.includes(session.user.email ?? '')) {
        navigate('/dashboard'); return
      }

      const res = await fetch('/.netlify/functions/admin-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { setError(`Error ${res.status}`); setLoading(false); return }
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    load()
  }, [navigate])

  const filteredUsers = useMemo(() => {
    if (!data) return []
    const q = search.toLowerCase()
    return data.users
      .filter(u =>
        !q ||
        u.email.toLowerCase().includes(q) ||
        u.artist_name.toLowerCase().includes(q) ||
        (u.phone_number ?? '').includes(q) ||
        u.plan_tier.includes(q)
      )
      .sort((a, b) => {
        const av = a[sort.col]
        const bv = b[sort.col]
        if (av === null || av === undefined) return 1
        if (bv === null || bv === undefined) return -1
        return av < bv ? -sort.dir : av > bv ? sort.dir : 0
      })
  }, [data, search, sort])

  function toggleSort(col: keyof AdminUser) {
    setSort(s => s.col === col ? { col, dir: s.dir === 1 ? -1 : 1 } : { col, dir: -1 })
  }

  function SortIcon({ col }: { col: keyof AdminUser }) {
    if (sort.col !== col) return <span className="text-white/20 ml-1">↕</span>
    return <span className="text-[#FFD700] ml-1">{sort.dir === -1 ? '↓' : '↑'}</span>
  }

  if (loading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-white/30 text-sm tracking-widest uppercase animate-pulse">Loading Dashwise…</div>
    </div>
  )

  if (error) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-red-400 text-sm">{error}</div>
    </div>
  )

  if (!data) return null
  const { stats } = data

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Header ── */}
      <div className="border-b border-white/8 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/gu-icon.png" alt="" className="w-7 h-7 opacity-80" />
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">Dashwise</h1>
            <p className="text-white/30 text-xs">GrounduP Admin · Internal Only</p>
          </div>
        </div>
        <div className="text-white/20 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"     value={fmt(stats.total_users)}    sub={`${stats.plan_breakdown.pro ?? 0} Pro · ${stats.plan_breakdown.growth ?? 0} Growth`} />
          <StatCard label="Active Today"    value={fmt(stats.active_today)}   sub="sent at least 1 message" />
          <StatCard label="Total Texts"     value={fmt(stats.total_messages)} sub="all-time iMessages sent" />
          <StatCard label="API Spend"       value={`$${stats.total_cost_usd.toFixed(2)}`} sub="Claude Haiku all-time" accent />
        </div>

        {/* ── Plan Breakdown ── */}
        <div className="grid grid-cols-3 gap-4">
          {(['free', 'pro', 'growth'] as const).map(tier => (
            <div key={tier} className="rounded-xl border border-white/8 bg-white/3 p-4 flex items-center justify-between">
              <span className="text-white/50 text-sm capitalize">{tier}</span>
              <span className={`text-2xl font-black ${tier === 'growth' ? 'text-[#FFD700]' : tier === 'pro' ? 'text-blue-300' : 'text-white'}`}>
                {stats.plan_breakdown[tier] ?? 0}
              </span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-white/8">
          {(['users', 'guests'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${tab === t ? 'text-white border-b-2 border-[#FFD700] -mb-px' : 'text-white/40 hover:text-white/60'}`}
            >
              {t === 'users' ? `Registered Users (${data.users.length})` : `Guest Funnel (${data.guests.length})`}
            </button>
          ))}
        </div>

        {/* ── Users Table ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by email, artist name, or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
            />

            <div className="rounded-2xl border border-white/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    {[
                      { label: 'Artist',    col: 'artist_name'    },
                      { label: 'Email',     col: 'email'          },
                      { label: 'Plan',      col: 'plan_tier'      },
                      { label: 'Texts',     col: 'messages_total' },
                      { label: 'Today',     col: 'messages_today' },
                      { label: 'API Cost',  col: 'api_cost_usd'   },
                      { label: 'Last Seen', col: 'last_sign_in'   },
                      { label: 'Joined',    col: 'joined_at'      },
                    ].map(({ label, col }) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col as keyof AdminUser)}
                        className="text-left px-4 py-3 text-white/40 font-medium uppercase text-xs tracking-wider cursor-pointer hover:text-white/60 select-none"
                      >
                        {label}<SortIcon col={col as keyof AdminUser} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-white/20 text-sm">No users found</td></tr>
                  )}
                  {filteredUsers.map((u, i) => (
                    <tr key={u.user_id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{u.artist_name || <span className="text-white/20 italic">—</span>}</div>
                        {u.phone_number && <div className="text-white/30 text-xs">{u.phone_number}</div>}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[u.plan_tier] ?? PLAN_COLORS.free}`}>
                          {u.plan_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-mono">{fmt(u.messages_total)}</td>
                      <td className="px-4 py-3">
                        <span className={u.messages_today > 0 ? 'text-green-400 font-mono' : 'text-white/20 font-mono'}>
                          {u.messages_today}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 font-mono text-xs">${u.api_cost_usd.toFixed(4)}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{timeAgo(u.last_sign_in)}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{new Date(u.joined_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Guest Funnel Tab ── */}
        {tab === 'guests' && (
          <div className="space-y-6">
            {/* Funnel visualization */}
            <div className="grid grid-cols-5 gap-3">
              {data.guest_funnel.map(({ step, count }) => (
                <div key={step} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                  <p className="text-white/30 text-xs mb-1">Step {step}</p>
                  <p className="text-2xl font-black text-white">{count}</p>
                  <p className="text-white/30 text-xs mt-1">{STEP_LABELS[step]}</p>
                </div>
              ))}
            </div>

            {/* Guests table */}
            <div className="rounded-2xl border border-white/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    {['Phone', 'Artist Name', 'Step', 'Messages', 'Started'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-white/40 font-medium uppercase text-xs tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.guests.map((g, i) => (
                    <tr key={g.phone_number} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                      <td className="px-4 py-3 font-mono text-white/60 text-xs">{g.phone_number}</td>
                      <td className="px-4 py-3 text-white">{g.artist_name || <span className="text-white/20 italic">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-white/8 px-2 py-0.5 rounded-full text-white/50">
                          {STEP_LABELS[g.onboarding_step] ?? `Step ${g.onboarding_step}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">{g.message_count}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{new Date(g.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {data.guests.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-white/20 text-sm">No guests in funnel</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
