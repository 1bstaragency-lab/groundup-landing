/**
 * AdminDashboard — private operator console for GrounduP. WEB-ONLY,
 * never part of the iOS app. Lives at /admin.
 *
 * Auth: you sign in with a Supabase account whose email is in the
 * server's ADMIN_EMAILS allowlist. The page sends your access token as
 * a Bearer header; admin-data verifies it before returning anything.
 *
 * Tabs:
 *   Users   — every account: plan, activity, uP cost, releases, outreach
 *   Tickets — support tickets submitted from the app
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
  status: 'pending' | 'approved' | 'active' | 'rejected'
  ref_code: string
  referrals_count: number
  created_at: string
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
    plan_breakdown: Record<string, number>
  }
  users: AdminUser[]
  tickets: Ticket[]
  bugs: Bug[]
  model_usage: ModelUsage[]
  creators: Creator[]
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

export function AdminDashboard() {
  const [data, setData]       = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<'users' | 'tickets' | 'bugs' | 'costs' | 'creators'>('users')
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState<{ col: keyof AdminUser; dir: 1 | -1 }>({ col: 'joined_at', dir: -1 })

  useEffect(() => {
    setLoading(true)
    // Fetch without auth for development
    fetch('/.netlify/functions/admin-data')
      .then(async r => {
        if (!r.ok) throw new Error('Failed to load admin data.')
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={S.shell}><div style={S.center}>Loading…</div></div>
  if (error)   return <div style={S.shell}><div style={S.center}>{error}</div></div>
  if (!data)   return null

  return <Dashboard data={data} tab={tab} setTab={setTab} search={search} setSearch={setSearch}
                    sort={sort} setSort={setSort} onSignOut={() => {}} GOLD={GOLD} />
}

// ── Dashboard body ────────────────────────────────────────────────────────────
function Dashboard(props: {
  data: AdminData
  tab: 'users' | 'tickets' | 'bugs' | 'costs' | 'creators'; setTab: (t: 'users' | 'tickets' | 'bugs' | 'costs' | 'creators') => void
  search: string; setSearch: (s: string) => void
  sort: { col: keyof AdminUser; dir: 1 | -1 }; setSort: (s: { col: keyof AdminUser; dir: 1 | -1 }) => void
  onSignOut: () => void
  GOLD: string
}) {
  const { data, tab, setTab, search, setSearch, sort, setSort, onSignOut, GOLD } = props
  const { stats } = data

  const rows = useMemo(() => {
    let r = data.users
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(u => u.email.toLowerCase().includes(q) || u.artist_name.toLowerCase().includes(q))
    }
    return [...r].sort((a, b) => {
      const av = a[sort.col], bv = b[sort.col]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir
      return String(av).localeCompare(String(bv)) * sort.dir
    })
  }, [data.users, search, sort])

  const setCol = (col: keyof AdminUser) =>
    setSort(sort.col === col ? { col, dir: (sort.dir * -1) as 1 | -1 } : { col, dir: -1 })

  return (
    <div style={S.shell}>
      <div style={S.header}>
        <div style={S.logoRow}><span style={S.logoG}>G</span><h1 style={S.logoText}>GrounduP Admin</h1></div>
        <button style={S.linkBtn} onClick={onSignOut}>Sign out</button>
      </div>

      <div style={S.cards}>
        <Card label="Total users"   value={String(stats.total_users)} />
        <Card label="Paid"          value={String(stats.paid_users)} accent />
        <Card label="Active today"  value={String(stats.active_today)} />
        <Card label="Releases"      value={String(stats.total_releases)} />
        <Card label="Outreach sent" value={String(stats.total_outreach)} />
        <Card label="uP spend"      value={money(stats.total_up_cost_usd)} accent />
        <Card label="Model costs"   value={money(stats.total_model_cost_usd)} accent />
        <Card label="Open bugs"     value={String(stats.open_bugs)} alert={stats.open_bugs > 0} />
        <Card label="Open tickets"  value={String(stats.open_tickets)} alert={stats.open_tickets > 0} />
        <Card label="Active creators" value={String(stats.active_creators)} accent />
      </div>

      <div style={S.planRow}>
        {Object.entries(stats.plan_breakdown).sort((a, b) => b[1] - a[1]).map(([plan, n]) => (
          <span key={plan} style={{ ...S.planChip, borderColor: (PLAN_COLOR[plan] ?? GOLD) + '66', color: PLAN_COLOR[plan] ?? GOLD }}>
            {plan} · {n}
          </span>
        ))}
      </div>

      <div style={S.tabs}>
        {(['users', 'tickets', 'bugs', 'costs', 'creators'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
                  style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
            {t === 'tickets' ? `Tickets (${data.tickets.length})` :
             t === 'users' ? 'Users' :
             t === 'bugs' ? `Bugs (${data.bugs.length})` :
             t === 'costs' ? 'Model Costs' :
             `Creators (${data.creators.length})`}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          <input style={S.search} placeholder="Search email or artist name…"
                 value={search} onChange={e => setSearch(e.target.value)} />
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {([
                    ['artist_name', 'Artist'], ['email', 'Email'], ['plan_tier', 'Plan'],
                    ['releases', 'Releases'], ['up_messages', 'uP msgs'], ['up_cost_usd', 'uP $'],
                    ['outreach_sent', 'Outreach'], ['placements', 'Placed'], ['streak', '🔥'],
                    ['last_sign_in', 'Last seen'], ['joined_at', 'Joined'],
                  ] as [keyof AdminUser, string][]).map(([col, label]) => (
                    <th key={col} style={S.th} onClick={() => setCol(col)}>
                      {label}{sort.col === col ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(u => (
                  <tr key={u.user_id} style={S.tr}>
                    <td style={S.td}>
                      {u.artist_name || <span style={S.dim}>—</span>}
                      {!u.onboarded && <span style={S.tagDim}>new</span>}
                    </td>
                    <td style={{ ...S.td, ...S.dim }}>{u.email}</td>
                    <td style={S.td}>
                      <span style={{ ...S.planChip, borderColor: (PLAN_COLOR[u.plan_tier] ?? GOLD) + '66', color: PLAN_COLOR[u.plan_tier] ?? GOLD }}>
                        {u.plan_tier}
                      </span>
                    </td>
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
                {rows.length === 0 && (
                  <tr><td style={{ ...S.td, ...S.dim }} colSpan={11}>No users match.</td></tr>
                )}
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
                <span style={{ ...S.catChip, ...(t.status === 'open' ? { borderColor: GOLD + '66', color: GOLD } : {}) }}>
                  {t.category}
                </span>
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
          {data.bugs.map(b => (
            <div key={b.id} style={S.ticket}>
              <div style={S.ticketHead}>
                <span style={{ ...S.catChip, color: b.severity === 'critical' ? '#FF6B6B' : b.severity === 'high' ? '#FFA726' : b.severity === 'medium' ? '#FFD700' : '#81C784', borderColor: (b.severity === 'critical' ? '#FF6B6B' : b.severity === 'high' ? '#FFA726' : b.severity === 'medium' ? '#FFD700' : '#81C784') + '66' }}>
                  {b.severity}
                </span>
                <span style={{ ...S.catChip, color: b.status === 'open' ? GOLD : b.status === 'in_progress' ? '#60A5FA' : '#81C784', borderColor: (b.status === 'open' ? GOLD : b.status === 'in_progress' ? '#60A5FA' : '#81C784') + '66' }}>
                  {b.status}
                </span>
                <span style={{ ...S.dim, marginLeft: 'auto', fontSize: 12 }}>{dateShort(b.created_at)}</span>
              </div>
              <div style={S.ticketSubject}>{b.title}</div>
              <div style={S.ticketBody}>{b.description}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'costs' && (
        <>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>User</th>
                  <th style={S.th}>Model</th>
                  <th style={S.th}>Tokens In</th>
                  <th style={S.th}>Tokens Out</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Cost</th>
                  <th style={S.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.model_usage.length === 0 && (
                  <tr><td style={{ ...S.td, ...S.dim }} colSpan={6}>No model usage tracked yet.</td></tr>
                )}
                {data.model_usage.map(m => (
                  <tr key={m.id} style={S.tr}>
                    <td style={S.td}>
                      <span style={S.dim}>{m.user_id.slice(0, 8)}</span>
                    </td>
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
        </>
      )}

      {tab === 'creators' && (
        <>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Platform</th>
                  <th style={S.th}>Followers</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Ref Code</th>
                  <th style={S.th}>Referrals</th>
                  <th style={S.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.creators.length === 0 && (
                  <tr><td style={{ ...S.td, ...S.dim }} colSpan={8}>No creators yet.</td></tr>
                )}
                {data.creators.map(c => (
                  <tr key={c.id} style={S.tr}>
                    <td style={S.td}>{c.name}</td>
                    <td style={{ ...S.td, ...S.dim }}>{c.email}</td>
                    <td style={S.td}>{c.platform}</td>
                    <td style={S.td}>{c.followers}</td>
                    <td style={S.td}>
                      <span style={{ ...S.planChip, borderColor: (c.status === 'active' ? '#81C784' : c.status === 'approved' ? GOLD : c.status === 'pending' ? '#FFD700' : '#FF6B6B') + '66', color: c.status === 'active' ? '#81C784' : c.status === 'approved' ? GOLD : c.status === 'pending' ? '#FFD700' : '#FF6B6B' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: 11, fontFamily: 'monospace' }}>{c.ref_code}</td>
                    <td style={S.tdNum}>{c.referrals_count}</td>
                    <td style={{ ...S.tdNum, ...S.dim }}>{dateShort(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
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

// ── Styles (inline; dark, matches brand) ───────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  shell:  { minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: '-apple-system, system-ui, sans-serif', padding: 24 },
  center: { textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.6)' },

  loginCard: { maxWidth: 360, margin: '12vh auto', display: 'flex', flexDirection: 'column', gap: 12 },
  loginSub:  { color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 8px' },
  input:     { height: 48, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: '#111', color: '#fff', padding: '0 14px', fontSize: 15 },
  signInBtn: { height: 50, borderRadius: 12, border: 'none', background: GOLD, color: '#000', fontWeight: 900, fontSize: 14, cursor: 'pointer', marginTop: 4 },
  errMsg:    { color: '#FF6B6B', fontSize: 13, fontWeight: 600 },

  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  logoG:   { width: 30, height: 30, borderRadius: 8, background: GOLD, color: '#000', fontWeight: 900, display: 'grid', placeItems: 'center', fontSize: 18 },
  logoText:{ fontWeight: 900, fontSize: 18, letterSpacing: -0.3, margin: 0 },
  linkBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 600 },

  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 },
  card:  { background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 },
  cardAlert: { borderColor: GOLD + '55' },
  cardValue: { fontSize: 28, fontWeight: 900, letterSpacing: -1 },
  cardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },

  planRow:  { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  planChip: { padding: '3px 9px', borderRadius: 7, border: '1px solid', fontSize: 11, fontWeight: 800, textTransform: 'capitalize' },

  tabs:      { display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 },
  tab:       { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  tabActive: { color: '#fff', borderBottom: `2px solid ${GOLD}`, marginBottom: -1 },

  search: { width: '100%', maxWidth: 360, height: 42, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#111', color: '#fff', padding: '0 14px', fontSize: 14, marginBottom: 14 },

  tableWrap: { overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 },
  table:  { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:     { textAlign: 'left', padding: '12px 14px', color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' },
  tr:     { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td:     { padding: '12px 14px', whiteSpace: 'nowrap' },
  tdNum:  { padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
  dim:    { color: 'rgba(255,255,255,0.45)' },
  tagDim: { marginLeft: 8, fontSize: 10, color: GOLD, border: `1px solid ${GOLD}55`, borderRadius: 5, padding: '1px 5px' },

  ticketList:    { display: 'flex', flexDirection: 'column', gap: 10 },
  ticket:        { background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 },
  ticketHead:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  catChip:       { padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' },
  ticketStatus:  { fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 },
  ticketSubject: { fontWeight: 800, fontSize: 15, marginBottom: 4 },
  ticketBody:    { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.5 },
}
