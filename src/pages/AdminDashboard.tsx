/**
 * AdminDashboard — private operator console for GrounduP. WEB-ONLY.
 * Lives at /admin. Auth: sign in with an admin-allowlisted Supabase account.
 */
import { useEffect, useMemo, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  user_id: string
  email: string
  artist_name: string
  genre: string
  plan_tier: string
  streak: number
  referrals: number
  has_avatar: boolean
  onboarded: boolean
  releases: number
  up_messages: number
  messages_today: number
  outreach_sent: number
  placements: number
  up_cost_usd: number
  tokens_in: number
  tokens_out: number
  joined_at: string
  last_sign_in: string | null
  confirmed: boolean
}

interface Ticket {
  id: string
  user_id: string | null
  category: string
  subject: string
  body: string
  status: string
  created_at: string
}

interface Bug {
  id: string
  user_id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

interface ModelUsage {
  id: string
  user_id: string
  model_name: string
  tokens_input: number
  tokens_output: number
  cost_usd: number
  created_at: string
}

interface Creator {
  id: string
  name: string
  email: string
  platform: string
  followers: string
  handle: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'active' | 'rejected'
  ref_code: string
  referrals_count: number
  created_at: string
}

interface WaitlistEntry {
  id: string
  created_at: string
  email: string
  phone: string | null
  artist_name: string | null
  platform: string | null
  social_handle: string | null
  role: string | null
  referral_code: string | null
  referred_by: string | null
  years_active: string | null
  momentum_level: string | null
  investment_level: string | null
  source: string | null
  status: 'pending' | 'approved'
  approved_at: string | null
}

interface AdminData {
  stats: {
    total_users: number
    paid_users: number
    active_today: number
    total_releases: number
    total_outreach: number
    total_up_cost_usd: number
    open_tickets: number
    open_bugs: number
    total_model_cost_usd: number
    active_creators: number
    waitlist_count: number
    plan_breakdown: Record<string, number>
  }
  users: AdminUser[]
  tickets: Ticket[]
  bugs: Bug[]
  model_usage: ModelUsage[]
  creators: Creator[]
  waitlist: WaitlistEntry[]
}

const GOLD = '#FFD700'
const PLAN_COLOR: Record<string, string> = {
  solo: '#8A93A6', weekly: '#60A5FA', monthly: GOLD,
  strategic: '#A78BFA', enterprise: '#34D399',
}

function money(n: number) { return '$' + n.toFixed(n < 1 ? 4 : 2) }
function dateShort(s: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}
function statusColor(s: Creator['status']) {
  return s === 'active' ? '#81C784' : s === 'approved' ? GOLD : s === 'pending' ? '#FFA726' : '#FF6B6B'
}

// ── Root export ───────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [tab, setTab]       = useState<'users' | 'tickets' | 'bugs' | 'costs' | 'creators' | 'waitlist'>('users')
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState<{ col: keyof AdminUser; dir: 1 | -1 }>({ col: 'joined_at', dir: -1 })

  const [data, setData]                   = useState<AdminData | null>(null)
  const [fetchLoading, setFetchLoading]   = useState(false)
  const [fetchError, setFetchError]       = useState('')
  const [lastRefresh, setLastRefresh]     = useState<Date | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setFetchLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/.netlify/functions/admin-data')
      const json = await res.json()
      if (!res.ok) { setFetchError(json.error || 'Failed to load admin data'); setFetchLoading(false); return }
      setData(json)
      setLastRefresh(new Date())
    } catch {
      setFetchError('Network error — could not reach admin API')
    }
    setFetchLoading(false)
  }

  async function handleCreatorAction(creatorId: string, status: Creator['status']) {
    setActionLoading(creatorId)
    try {
      const res = await fetch('/.netlify/functions/admin-update-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: creatorId, status }),
      })
      if (res.ok && data) {
        setData({ ...data, creators: data.creators.map(c => c.id === creatorId ? { ...c, status } : c) })
      }
    } catch { /* silent */ }
    setActionLoading(null)
  }

  const [waitlistActionError, setWaitlistActionError] = useState<string | null>(null)

  async function handleWaitlistApprove(waitlistId: string) {
    setActionLoading(waitlistId)
    setWaitlistActionError(null)
    try {
      const res = await fetch('/.netlify/functions/admin-approve-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlist_id: waitlistId }),
      })
      const json = await res.json().catch(() => ({}))
      if (json.ok && data) {
        setData({
          ...data,
          waitlist: data.waitlist.map(w => w.id === waitlistId ? { ...w, status: 'approved', approved_at: new Date().toISOString() } : w),
        })
      } else {
        setWaitlistActionError(json.error ?? 'Could not approve — try again.')
      }
    } catch {
      setWaitlistActionError('Network error — try again.')
    }
    setActionLoading(null)
  }

  if (fetchLoading || !data) {
    return (
      <div style={S.shell}>
        <div style={S.center}>
          {fetchError
            ? <><div style={{ color: '#FF6B6B', marginBottom: 12, fontWeight: 700 }}>{fetchError}</div>
                <button style={{ ...S.signInBtn, maxWidth: 160 }} onClick={loadData}>Retry</button></>
            : 'Loading admin data…'}
        </div>
      </div>
    )
  }

  return (
    <DashboardView
      data={data}
      tab={tab} setTab={setTab}
      search={search} setSearch={setSearch}
      sort={sort} setSort={setSort}
      onRefresh={loadData}
      onCreatorAction={handleCreatorAction}
      onWaitlistApprove={handleWaitlistApprove}
      waitlistActionError={waitlistActionError}
      actionLoading={actionLoading}
      lastRefresh={lastRefresh}
    />
  )
}

// ── Dashboard view ────────────────────────────────────────────────────────────
function DashboardView({ data, tab, setTab, search, setSearch, sort, setSort, onRefresh, onCreatorAction, onWaitlistApprove, waitlistActionError, actionLoading, lastRefresh }: {
  data: AdminData
  tab: 'users' | 'tickets' | 'bugs' | 'costs' | 'creators' | 'waitlist'
  setTab: (t: 'users' | 'tickets' | 'bugs' | 'costs' | 'creators' | 'waitlist') => void
  search: string; setSearch: (s: string) => void
  sort: { col: keyof AdminUser; dir: 1 | -1 }; setSort: (s: { col: keyof AdminUser; dir: 1 | -1 }) => void
  onRefresh: () => void
  onCreatorAction: (id: string, status: Creator['status']) => void
  onWaitlistApprove: (id: string) => void
  waitlistActionError: string | null
  actionLoading: string | null
  lastRefresh: Date | null
}) {
  const { stats } = data

  const rows = useMemo(() => {
    let r = data.users
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(u => u.email.toLowerCase().includes(q) || u.artist_name?.toLowerCase().includes(q))
    }
    return [...r].sort((a, b) => {
      const av = a[sort.col], bv = b[sort.col]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir
      return String(av ?? '').localeCompare(String(bv ?? '')) * sort.dir
    })
  }, [data.users, search, sort])

  const waitlistRows = useMemo(() => {
    let r = data.waitlist
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(w => w.email.toLowerCase().includes(q) || w.artist_name?.toLowerCase().includes(q))
    }
    return [...r].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [data.waitlist, search])

  const setCol = (col: keyof AdminUser) =>
    setSort(sort.col === col ? { col, dir: (sort.dir * -1) as 1 | -1 } : { col, dir: -1 })

  return (
    <div style={S.shell}>
      <div style={S.header}>
        <div style={S.logoRow}><span style={S.logoG}>G</span><h1 style={S.logoText}>GrounduP Admin</h1></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {lastRefresh && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          <button style={S.linkBtn} onClick={onRefresh}>↻ Refresh</button>
        </div>
      </div>

      <div style={S.cards}>
        <Card label="Total users"     value={String(stats.total_users)} />
        <Card label="Paid"            value={String(stats.paid_users)} accent />
        <Card label="Active today"    value={String(stats.active_today)} />
        <Card label="Releases"        value={String(stats.total_releases)} />
        <Card label="Outreach sent"   value={String(stats.total_outreach)} />
        <Card label="uP spend"        value={money(stats.total_up_cost_usd)} accent />
        <Card label="Model costs"     value={money(stats.total_model_cost_usd)} accent />
        <Card label="Open bugs"       value={String(stats.open_bugs)} alert={stats.open_bugs > 0} />
        <Card label="Open tickets"    value={String(stats.open_tickets)} alert={stats.open_tickets > 0} />
        <Card label="Active creators" value={String(stats.active_creators)} accent />
        <Card label="Waitlist"        value={String(stats.waitlist_count)} accent />
      </div>

      <div style={S.planRow}>
        {Object.entries(stats.plan_breakdown).sort((a, b) => b[1] - a[1]).map(([plan, n]) => (
          <span key={plan} style={{ ...S.planChip, borderColor: (PLAN_COLOR[plan] ?? GOLD) + '66', color: PLAN_COLOR[plan] ?? GOLD }}>
            {plan} · {n}
          </span>
        ))}
      </div>

      <div style={S.tabs}>
        {(['users', 'waitlist', 'tickets', 'bugs', 'costs', 'creators'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
            {t === 'tickets' ? `Tickets (${data.tickets.length})`
             : t === 'bugs' ? `Bugs (${data.bugs.length})`
             : t === 'costs' ? 'Model Costs'
             : t === 'creators' ? `Creators (${data.creators.length})`
             : t === 'waitlist' ? `Waitlist (${data.waitlist.length})`
             : 'Users'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          <input style={S.search} placeholder="Search email or artist name…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                {([['artist_name','Artist'],['email','Email'],['plan_tier','Plan'],['releases','Releases'],['up_messages','uP msgs'],['up_cost_usd','uP $'],['outreach_sent','Outreach'],['placements','Placed'],['streak','🔥'],['last_sign_in','Last seen'],['joined_at','Joined']] as [keyof AdminUser, string][]).map(([col, label]) => (
                  <th key={col} style={S.th} onClick={() => setCol(col)}>{label}{sort.col === col ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}</th>
                ))}
              </tr></thead>
              <tbody>
                {rows.map(u => (
                  <tr key={u.user_id} style={S.tr}>
                    <td style={S.td}>{u.artist_name || <span style={S.dim}>—</span>}{!u.onboarded && <span style={S.tagDim}>new</span>}</td>
                    <td style={{ ...S.td, ...S.dim }}>{u.email}</td>
                    <td style={S.td}><span style={{ ...S.planChip, borderColor: (PLAN_COLOR[u.plan_tier] ?? GOLD) + '66', color: PLAN_COLOR[u.plan_tier] ?? GOLD }}>{u.plan_tier}</span></td>
                    <td style={S.tdNum}>{u.releases}</td>
                    <td style={S.tdNum}>{u.up_messages}</td>
                    <td style={{ ...S.tdNum, color: GOLD }}>{money(u.up_cost_usd)}</td>
                    <td style={S.tdNum}>{u.outreach_sent}</td>
                    <td style={S.tdNum}>{u.placements}</td>
                    <td style={S.tdNum}>{u.streak}</td>
                    <td style={{ ...S.tdNum, ...S.dim }}>{dateShort(u.last_sign_in)}</td>
                    <td style={{ ...S.tdNum, ...S.dim }}>{dateShort(u.joined_at)}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td style={{ ...S.td, ...S.dim }} colSpan={11}>No users match.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'waitlist' && (
        <>
          <input style={S.search} placeholder="Search email or artist name…" value={search} onChange={e => setSearch(e.target.value)} />
          {waitlistActionError && <p style={{ ...S.errMsg, marginBottom: 10 }}>{waitlistActionError}</p>}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>Artist</th><th style={S.th}>Email</th><th style={S.th}>Phone</th>
                <th style={S.th}>Years Active</th><th style={S.th}>Motion</th><th style={S.th}>Investment</th>
                <th style={S.th}>Source</th><th style={S.th}>Ref Code</th><th style={S.th}>Referred By</th>
                <th style={S.th}>Joined</th><th style={S.th}>Status</th>
              </tr></thead>
              <tbody>
                {waitlistRows.map(w => {
                  const busy = actionLoading === w.id
                  return (
                    <tr key={w.id} style={S.tr}>
                      <td style={S.td}>{w.artist_name || <span style={S.dim}>—</span>}</td>
                      <td style={{ ...S.td, ...S.dim }}>{w.email}</td>
                      <td style={{ ...S.td, ...S.dim }}>{w.phone || '—'}</td>
                      <td style={S.td}>{w.years_active || <span style={S.dim}>—</span>}</td>
                      <td style={S.td}>{w.momentum_level || <span style={S.dim}>—</span>}</td>
                      <td style={S.td}>{w.investment_level || <span style={S.dim}>—</span>}</td>
                      <td style={S.td}><span style={{ ...S.catChip }}>{w.source || 'unknown'}</span></td>
                      <td style={{ ...S.td, fontSize: 11, fontFamily: 'monospace' }}>{w.referral_code || '—'}</td>
                      <td style={{ ...S.td, ...S.dim }}>{w.referred_by || '—'}</td>
                      <td style={{ ...S.tdNum, ...S.dim }}>{dateShort(w.created_at)}</td>
                      <td style={S.td}>
                        {w.status === 'approved' ? (
                          <span style={{ ...S.planChip, borderColor: '#81C78466', color: '#81C784' }}>Approved</span>
                        ) : (
                          <Btn color={GOLD} disabled={busy} onClick={() => onWaitlistApprove(w.id)}>{busy ? '…' : 'Approve'}</Btn>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {waitlistRows.length === 0 && <tr><td style={{ ...S.td, ...S.dim }} colSpan={11}>No waitlist signups match.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'tickets' && (
        <div style={S.ticketList}>
          {data.tickets.length === 0 && <div style={S.center}>No support tickets yet.</div>}
          {data.tickets.map(t => (
            <div key={t.id} style={S.ticket}>
              <div style={S.ticketHead}>
                <span style={{ ...S.catChip, ...(t.status === 'open' ? { borderColor: GOLD + '66', color: GOLD } : {}) }}>{t.category}</span>
                <span style={S.ticketStatus}>{t.status}</span>
                <span style={{ ...S.dim, marginLeft: 'auto', fontSize: 12 }}>{dateShort(t.created_at)}</span>
              </div>
              <div style={S.ticketSubject}>{t.subject}</div>
              <div style={S.ticketBody}>{t.body}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bugs' && (
        <div style={S.ticketList}>
          {data.bugs.length === 0 && <div style={S.center}>No bugs reported.</div>}
          {data.bugs.map(b => {
            const sevColor = b.severity === 'critical' ? '#FF6B6B' : b.severity === 'high' ? '#FFA726' : b.severity === 'medium' ? '#FFD700' : '#81C784'
            const staColor = b.status === 'open' ? GOLD : b.status === 'in_progress' ? '#60A5FA' : '#81C784'
            return (
              <div key={b.id} style={S.ticket}>
                <div style={S.ticketHead}>
                  <span style={{ ...S.catChip, color: sevColor, borderColor: sevColor + '66' }}>{b.severity}</span>
                  <span style={{ ...S.catChip, color: staColor, borderColor: staColor + '66' }}>{b.status}</span>
                  <span style={{ ...S.dim, marginLeft: 'auto', fontSize: 12 }}>{dateShort(b.created_at)}</span>
                </div>
                <div style={S.ticketSubject}>{b.title}</div>
                <div style={S.ticketBody}>{b.description}</div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'costs' && (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>User</th><th style={S.th}>Model</th>
              <th style={S.th}>Tokens In</th><th style={S.th}>Tokens Out</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Cost</th><th style={S.th}>Date</th>
            </tr></thead>
            <tbody>
              {data.model_usage.length === 0 && <tr><td style={{ ...S.td, ...S.dim }} colSpan={6}>No model usage tracked yet.</td></tr>}
              {data.model_usage.map(m => (
                <tr key={m.id} style={S.tr}>
                  <td style={S.td}><span style={S.dim}>{m.user_id.slice(0, 8)}</span></td>
                  <td style={S.td}>{m.model_name}</td>
                  <td style={S.tdNum}>{m.tokens_input.toLocaleString()}</td>
                  <td style={S.tdNum}>{m.tokens_output.toLocaleString()}</td>
                  <td style={{ ...S.tdNum, color: GOLD }}>{money(m.cost_usd)}</td>
                  <td style={{ ...S.tdNum, ...S.dim }}>{dateShort(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'creators' && (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Name</th><th style={S.th}>Email</th>
              <th style={S.th}>Platform</th><th style={S.th}>Followers</th>
              <th style={S.th}>Handle</th><th style={S.th}>Status</th>
              <th style={S.th}>Ref Code</th><th style={S.th}>Referrals</th>
              <th style={S.th}>Joined</th><th style={S.th}>Actions</th>
            </tr></thead>
            <tbody>
              {data.creators.length === 0 && (
                <tr><td style={{ ...S.td, ...S.dim }} colSpan={10}>
                  No creators yet — share <strong style={{ color: '#fff' }}>groundupapp.com/creators</strong> to start receiving applications.
                </td></tr>
              )}
              {data.creators.map(c => {
                const busy = actionLoading === c.id
                return (
                  <tr key={c.id} style={S.tr}>
                    <td style={S.td}>
                      <div>{c.name}</div>
                      {c.notes && <div style={{ ...S.dim, fontSize: 11, marginTop: 2, maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4 }}>{c.notes}</div>}
                    </td>
                    <td style={{ ...S.td, ...S.dim }}>{c.email}</td>
                    <td style={S.td}>{c.platform}</td>
                    <td style={S.td}>{c.followers || '—'}</td>
                    <td style={{ ...S.td, ...S.dim }}>{c.handle ? `@${c.handle}` : '—'}</td>
                    <td style={S.td}><span style={{ ...S.planChip, borderColor: statusColor(c.status) + '66', color: statusColor(c.status) }}>{c.status}</span></td>
                    <td style={{ ...S.td, fontSize: 11, fontFamily: 'monospace' }}>{c.ref_code}</td>
                    <td style={S.tdNum}>{c.referrals_count}</td>
                    <td style={{ ...S.tdNum, ...S.dim }}>{dateShort(c.created_at)}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.status === 'pending' && <>
                          <Btn color="#81C784" disabled={busy} onClick={() => onCreatorAction(c.id, 'approved')}>{busy ? '…' : 'Approve'}</Btn>
                          <Btn color="#FF6B6B" disabled={busy} onClick={() => onCreatorAction(c.id, 'rejected')}>{busy ? '…' : 'Reject'}</Btn>
                        </>}
                        {c.status === 'approved' && <Btn color={GOLD} disabled={busy} onClick={() => onCreatorAction(c.id, 'active')}>{busy ? '…' : 'Activate'}</Btn>}
                        {c.status === 'active' && <Btn color="#8A93A6" disabled={busy} onClick={() => onCreatorAction(c.id, 'rejected')}>{busy ? '…' : 'Deactivate'}</Btn>}
                        {c.status === 'rejected' && <Btn color="#60A5FA" disabled={busy} onClick={() => onCreatorAction(c.id, 'pending')}>{busy ? '…' : 'Restore'}</Btn>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Btn({ children, color, onClick, disabled }: { children: React.ReactNode; color: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '3px 10px', borderRadius: 7, border: `1px solid ${color}66`, background: `${color}18`, color, fontSize: 11, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s' }}>
      {children}
    </button>
  )
}

function Card({ label, value, accent, alert }: { label: string; value: string; accent?: boolean; alert?: boolean }) {
  return (
    <div style={{ ...S.card, ...(alert ? S.cardAlert : {}) }}>
      <div style={{ ...S.cardValue, color: accent ? GOLD : '#fff' }}>{value}</div>
      <div style={S.cardLabel}>{label}</div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  shell:  { minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: '-apple-system, system-ui, sans-serif', padding: 24 },
  center: { textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.6)' },
  loginCard: { maxWidth: 360, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
  loginSub:  { color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' },
  input:     { height: 48, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: '#111', color: '#fff', padding: '0 14px', fontSize: 15 },
  signInBtn: { height: 50, borderRadius: 12, border: 'none', background: GOLD, color: '#000', fontWeight: 900, fontSize: 14, cursor: 'pointer', marginTop: 4 },
  errMsg:    { color: '#FF6B6B', fontSize: 13, fontWeight: 600 },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  logoG:   { width: 30, height: 30, borderRadius: 8, background: GOLD, color: '#000', fontWeight: 900, display: 'grid', placeItems: 'center', fontSize: 18 },
  logoText:{ fontWeight: 900, fontSize: 18, letterSpacing: -0.3, margin: 0 },
  linkBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  cards:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 },
  card:      { background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 },
  cardAlert: { borderColor: GOLD + '55' },
  cardValue: { fontSize: 28, fontWeight: 900, letterSpacing: -1 },
  cardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  planRow:  { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  planChip: { padding: '3px 9px', borderRadius: 7, border: '1px solid', fontSize: 11, fontWeight: 800, textTransform: 'capitalize' },
  tabs:      { display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 },
  tab:       { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  tabActive: { color: '#fff', borderBottom: `2px solid ${GOLD}`, marginBottom: -1 },
  search:    { width: '100%', maxWidth: 360, height: 42, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#111', color: '#fff', padding: '0 14px', fontSize: 14, marginBottom: 14 },
  tableWrap: { overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { textAlign: 'left', padding: '12px 14px', color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td:        { padding: '12px 14px', whiteSpace: 'nowrap' },
  tdNum:     { padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
  dim:       { color: 'rgba(255,255,255,0.45)' },
  tagDim:    { marginLeft: 8, fontSize: 10, color: GOLD, border: `1px solid ${GOLD}55`, borderRadius: 5, padding: '1px 5px' },
  ticketList:    { display: 'flex', flexDirection: 'column', gap: 10 },
  ticket:        { background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 },
  ticketHead:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  catChip:       { padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' },
  ticketStatus:  { fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 },
  ticketSubject: { fontWeight: 800, fontSize: 15, marginBottom: 4 },
  ticketBody:    { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.5 },
}
