/**
 * Blooio iMessage Inbound Webhook
 *
 * Blooio POSTs inbound iMessages here.
 * We look up the artist by phone, ask Claude, reply via Blooio API.
 *
 * Netlify env vars needed:
 *   BLOOIO_API_KEY         — from app.blooio.com
 *   BLOOIO_WEBHOOK_SECRET  — signing secret Blooio provides when you create the webhook
 *   ANTHROPIC_API_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SUPABASE_URL
 *
 * Webhook URL to paste in Blooio dashboard:
 *   https://<your-site>.netlify.app/.netlify/functions/blooio-webhook
 */
import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

// ─── Blooio uses Stripe-style HMAC-SHA256 signatures ─────────────────────────
// Header format: x-blooio-signature: t=<unix>,v1=<hex_hmac>
// Signed payload: "<timestamp>.<rawBody>"
// Key: hex-decode the part after "whsec_"
function verifyBlooioSignature(rawBody: string, sigHeader: string, secret: string): boolean {
  const parts: Record<string, string> = {}
  sigHeader.split(',').forEach(p => {
    const eq = p.indexOf('=')
    if (eq > 0) parts[p.slice(0, eq).trim()] = p.slice(eq + 1).trim()
  })
  const { t: timestamp, v1 } = parts
  if (!timestamp || !v1) return false

  const signedPayload   = `${timestamp}.${rawBody}`
  const secretHex       = (secret.startsWith('whsec_') ? secret.slice(6) : secret).trim()
  const keyBuf          = Buffer.from(secretHex, 'hex')

  // If hex decode gave 0 bytes (not valid hex), fall back to raw string key
  const key = keyBuf.length > 0 ? keyBuf : Buffer.from(secretHex)
  const expected = createHmac('sha256', key).update(signedPayload).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return expected === v1
  }
}

const BLOOIO_API_KEY        = process.env.BLOOIO_API_KEY            ?? ''
const BLOOIO_WEBHOOK_SECRET = process.env.BLOOIO_WEBHOOK_SECRET     ?? ''
const ANTHROPIC_KEY         = process.env.ANTHROPIC_API_KEY          ?? ''
const SUPABASE_URL          = process.env.VITE_SUPABASE_URL          ?? ''
// Service role bypasses RLS; fall back to anon key if not set
const SUPABASE_KEY          = process.env.SUPABASE_SERVICE_ROLE_KEY  ??
                              process.env.VITE_SUPABASE_ANON_KEY     ?? ''
const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY          ?? ''
const STRIPE_PRICE_PRO      = process.env.STRIPE_PRICE_PRO           ?? ''

const BLOOIO_URL = 'https://backend.blooio.com/v1/api/messages'

const TONE_VOICE: Record<string, string> = {
  'Assistant Manager': 'Professional and proactive, like a dedicated assistant manager. Results-focused and warm.',
  'Your Boy':          'Casual, real, ride-or-die energy. Celebrate wins, keep it 100 percent.',
  'Label Rep':         'Polished and data-driven. Industry-savvy, focused on growth and positioning.',
  'Road Manager':      'No-nonsense, practical, logistical. Make things happen fast.',
  'Creative Partner':  'Inspired and collaborative. Push ideas further and match creative energy.',
}

// Blooio inbound payload — adjust field names if their docs differ
interface BlooioInbound {
  from?:    string   // sender phone number
  to?:      string   // your number
  text?:    string   // message body
  message?: string   // alternate field name
  body?:    string   // alternate field name
}

export const handler: Handler = async (event) => {
  const params = event.queryStringParameters ?? {}

  // ─── ?simulate=1 — inject a fake inbound message, bypass sig check ──────────
  // Must be handled BEFORE the GET check since we want to fall into POST logic.
  // We use a flag instead of mutating event (Netlify event objects are read-only).
  let simulateBody: string | null = null
  if (params.simulate === '1') {
    const fakeFrom = params.from ?? '+10000000000'
    const fakeText = params.text ?? 'hello'
    simulateBody = JSON.stringify({ from: fakeFrom, text: fakeText })
    console.log('[blooio-webhook] SIMULATE MODE — from:', fakeFrom, 'text:', fakeText)
  }

  // ─── Diagnostic GET endpoints (only when NOT simulating) ─────────────────────
  if (event.httpMethod === 'GET' && !simulateBody) {
    if (params.ping === '1') {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
        let phoneSample: Array<{ phone_number: string | null }> = []
        let phoneError: string | null = null
        try {
          const { data, error } = await supabase
            .from('artist_profiles')
            .select('phone_number')
            .not('phone_number', 'is', null)
            .limit(20)
          phoneSample = data ?? []
          phoneError  = error?.message ?? null
        } catch (e) {
          phoneError = String(e)
        }
        const { data: guests } = await supabase
          .from('guest_profiles')
          .select('phone_number, onboarding_step, message_count, goal, created_at')
          .order('created_at', { ascending: false })
          .limit(10)
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            env: {
              BLOOIO_API_KEY:           !!BLOOIO_API_KEY,
              BLOOIO_WEBHOOK_SECRET:    !!BLOOIO_WEBHOOK_SECRET,
              ANTHROPIC_API_KEY:        !!ANTHROPIC_KEY,
              STRIPE_SECRET_KEY:        !!STRIPE_SECRET_KEY,
              STRIPE_PRICE_PRO:         !!STRIPE_PRICE_PRO,
              VITE_SUPABASE_URL:        !!SUPABASE_URL,
              SUPABASE_KEY:             !!SUPABASE_KEY,
              keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : process.env.VITE_SUPABASE_ANON_KEY ? 'anon' : 'MISSING',
            },
            supabase: {
              url: SUPABASE_URL ? SUPABASE_URL.replace(/^https?:\/\//, '').slice(0, 30) + '...' : null,
              phonesInDb: phoneSample.length,
              samplePhones: phoneSample.map(p => p.phone_number),
              queryError: phoneError,
              recentGuests: guests ?? [],
            },
          }, null, 2),
        }
      }
      if (params.recent === '1') {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
        const { data, error } = await supabase
          .from('up_conversations')
          .select('role, content, channel, created_at')
          .eq('channel', 'imessage')
          .order('created_at', { ascending: false })
          .limit(20)
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, error: error?.message }, null, 2),
        }
      }
      if (params.hits === '1') {
        // Show raw webhook events + guest profiles — proves whether Blooio is calling us at all
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
        const [eventsRes, guestsRes] = await Promise.all([
          supabase.from('webhook_events')
            .select('source, headers, payload, created_at')
            .order('created_at', { ascending: false })
            .limit(20),
          supabase.from('guest_profiles')
            .select('phone_number, onboarding_step, message_count, goal, created_at')
            .order('created_at', { ascending: false })
            .limit(10),
        ])
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: { count: eventsRes.data?.length ?? 0, data: eventsRes.data, error: eventsRes.error?.message },
            guests: { count: guestsRes.data?.length ?? 0, data: guestsRes.data, error: guestsRes.error?.message },
          }, null, 2),
        }
      }
      if (params.blooio_probe === '1') {
        // Probe inbound messages endpoint shape
        const headers = { 'Authorization': `Bearer ${BLOOIO_API_KEY}`, 'Content-Type': 'application/json' }
        const probeResults: Record<string, unknown> = {}
        const urls = [
          'https://backend.blooio.com/v1/api/messages?limit=3',
          'https://backend.blooio.com/v1/api/messages?limit=3&direction=inbound',
          'https://backend.blooio.com/v1/api/messages?limit=3&type=inbound',
          'https://backend.blooio.com/v2/api/chats?limit=3',
        ]
        await Promise.all(urls.map(async url => {
          try {
            const r = await fetch(url, { headers })
            const text = await r.text()
            let body: unknown = text
            try { body = JSON.parse(text) } catch { /* keep as string */ }
            probeResults[url] = { status: r.status, body }
          } catch (e) {
            probeResults[url] = { error: String(e) }
          }
        }))
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(probeResults, null, 2),
        }
      }
      if (params.send_vcard_to) {
        const to  = decodeURIComponent(params.send_vcard_to)
        const url = `${process.env.URL ?? 'https://groundupapp.com'}/up.vcf`
        await sendBlooio(to, 'Save uP as a contact 👇', [url])
        return { statusCode: 200, body: `Sent vCard to ${to}` }
      }
      return { statusCode: 405, body: 'Use POST for inbound webhooks. GET ?ping=1, ?hits=1, ?recent=1, ?blooio_probe=1, ?send_vcard_to=+1XXX, or ?simulate=1&from=+1XXX&text=hello for diagnostics.' }
  } // end GET-only block

  if (!simulateBody && event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

  // ─── Log headers (still no strict auth until we identify Blooio's header) ──
  const safeHeaders = Object.fromEntries(
    Object.entries(event.headers).filter(([k]) => !k.toLowerCase().includes('cookie'))
  )
  console.log('[blooio-webhook] Headers:', JSON.stringify(safeHeaders))

  // ─── Unconditional hit log to webhook_events (proves Blooio is calling us) ──
  const sourceIp = event.headers['x-forwarded-for'] ?? event.headers['x-nf-client-connection-ip'] ?? ''
  let rawPayload: unknown = null
  try { rawPayload = JSON.parse(event.body ?? 'null') } catch { rawPayload = event.body }
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabaseHit = createClient(SUPABASE_URL, SUPABASE_KEY)
    await supabaseHit.from('webhook_events').insert({
      source:  'blooio',
      headers: safeHeaders,
      payload: rawPayload as object,
      ip:      sourceIp,
    })
  }

  // ─── Skip outbound status events (queued / sent / delivered / failed) ───────
  const blooioEvent = event.headers['x-blooio-event'] ?? ''
  const OUTBOUND_EVENTS = ['message.queued', 'message.sent', 'message.delivered', 'message.failed']
  if (OUTBOUND_EVENTS.includes(blooioEvent)) {
    console.log('[blooio-webhook] Outbound status event — ignoring:', blooioEvent)
    return { statusCode: 200, body: `Outbound event acknowledged: ${blooioEvent}` }
  }

  // ─── Allow internal poller calls authenticated with our own API key ─────────
  const pollerAuth  = event.headers['x-poller-auth'] ?? ''
  const isPollerCall = !!BLOOIO_API_KEY && pollerAuth === `Bearer ${BLOOIO_API_KEY}`
  if (isPollerCall) {
    console.log('[blooio-webhook] Internal poller call authenticated ✓')
  }

  // ─── HMAC-SHA256 signature verification (skip for simulate + poller) ──────
  if (BLOOIO_WEBHOOK_SECRET && !simulateBody && !isPollerCall) {
    const sigHeader = event.headers['x-blooio-signature'] ?? ''
    if (!sigHeader) {
      console.warn('[blooio-webhook] No x-blooio-signature header — rejecting')
      return { statusCode: 401, body: 'Missing signature' }
    }
    const valid = verifyBlooioSignature(event.body ?? '', sigHeader, BLOOIO_WEBHOOK_SECRET)
    if (!valid) {
      console.warn('[blooio-webhook] HMAC mismatch — rejecting. sig:', sigHeader, 'body_len:', (event.body ?? '').length)
      return { statusCode: 401, body: 'Invalid signature' }
    }
    console.log('[blooio-webhook] Signature verified ✓')
  }

  // Use simulateBody if in simulate mode, otherwise parse the real body
  const rawBodyStr = simulateBody ?? event.body ?? '{}'
  let payload: BlooioInbound
  try {
    payload = JSON.parse(rawBodyStr)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  console.log('[blooio-webhook] Inbound payload:', JSON.stringify(payload))

  // ─── Robust phone + text extraction ──────────────────────────────────────
  // Blooio may use different field names / nesting depending on the event type.
  // We check flat fields first, then look inside nested "data" / "message" objects.
  const anyPayload = payload as Record<string, unknown>
  const nestedData = (anyPayload.data    as Record<string, unknown>) ?? {}
  const nestedMsg  = (typeof anyPayload.message === 'object' && anyPayload.message !== null
    ? anyPayload.message as Record<string, unknown>
    : {})

  const fromPhone = (
    (typeof payload.from          === 'string' ? payload.from          : null) ??
    (typeof anyPayload.sender     === 'string' ? anyPayload.sender     : null) ??
    (typeof anyPayload.external_id=== 'string' ? anyPayload.external_id: null) ??
    (typeof anyPayload.from_number=== 'string' ? anyPayload.from_number: null) ??
    (typeof nestedData.from       === 'string' ? nestedData.from       : null) ??
    (typeof nestedData.sender     === 'string' ? nestedData.sender     : null) ??
    (typeof nestedMsg.from        === 'string' ? nestedMsg.from        : null) ??
    ''
  )

  const inboundText = (
    (typeof payload.text    === 'string' ? payload.text    : null) ??
    (typeof payload.body    === 'string' ? payload.body    : null) ??
    // payload.message is string only (not nested object)
    (typeof payload.message === 'string' ? payload.message : null) ??
    (typeof anyPayload.content === 'string' ? anyPayload.content : null) ??
    (typeof nestedData.text    === 'string' ? nestedData.text    : null) ??
    (typeof nestedData.body    === 'string' ? nestedData.body    : null) ??
    (typeof nestedMsg.text     === 'string' ? nestedMsg.text     : null) ??
    (typeof nestedMsg.body     === 'string' ? nestedMsg.body     : null) ??
    ''
  )

  console.log('[blooio-webhook] Extracted — fromPhone:', JSON.stringify(fromPhone), 'inboundText:', JSON.stringify(inboundText))

  if (!fromPhone || !inboundText) {
    console.log('[blooio-webhook] Missing from/text — full payload was:', JSON.stringify(anyPayload))
    return { statusCode: 200, body: JSON.stringify({ status: 'no_sender_text', keys: Object.keys(anyPayload) }) }
  }

  if (!BLOOIO_API_KEY || !ANTHROPIC_KEY) {
    console.log('[blooio-webhook] Missing required API keys')
    return { statusCode: 200, body: 'Not configured' }
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[blooio-webhook] Supabase not configured — set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)')
    await sendBlooio(fromPhone, "uP is misconfigured — Supabase credentials missing on the server. Reach out to support.")
    return { statusCode: 200, body: 'Supabase not configured' }
  }

  const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY)
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

  // ─── Bulletproof phone lookup: try multiple formats ───────────────────────
  const digits = fromPhone.replace(/\D/g, '')
  const last10 = digits.slice(-10)
  const candidates = Array.from(new Set([
    fromPhone,                  // raw as Blooio sent it
    `+${digits}`,               // +<all digits>
    `+1${last10}`,              // +1<last10>
    last10,                     // last 10 digits only
    digits,                     // all digits
  ].filter(Boolean)))

  console.log('[blooio-webhook] Looking up phone — candidates:', JSON.stringify(candidates), 'last10:', last10)

  // Try exact match first (any candidate)
  let { data: profile } = await supabase
    .from('artist_profiles')
    .select('user_id, artist_name, tone, phone_number')
    .in('phone_number', candidates)
    .limit(1)
    .maybeSingle()

  // Fallback: fuzzy match on last 10 digits using ilike
  if (!profile && last10.length === 10) {
    const fuzzy = await supabase
      .from('artist_profiles')
      .select('user_id, artist_name, tone, phone_number')
      .ilike('phone_number', `%${last10}%`)
      .limit(1)
      .maybeSingle()
    profile = fuzzy.data
    console.log('[blooio-webhook] Fuzzy match result:', JSON.stringify({ found: !!profile, stored: profile?.phone_number }))
  } else {
    console.log('[blooio-webhook] Exact match result:', JSON.stringify({ found: !!profile, stored: profile?.phone_number }))
  }

  // ─── Auto-normalize mangled phone records to canonical E.164 ──────────────
  if (profile?.phone_number) {
    const storedDigits = profile.phone_number.replace(/\D/g, '')
    const canonical = '+' + (storedDigits.length > 10 ? storedDigits.slice(-11) : '1' + storedDigits)
    if (profile.phone_number !== canonical) {
      console.log(`[blooio-webhook] Normalizing stored phone "${profile.phone_number}" → "${canonical}"`)
      supabase.from('artist_profiles').update({ phone_number: canonical }).eq('user_id', profile.user_id)
        .then(() => console.log('[blooio-webhook] Phone normalized'))
    }
  }

  if (!profile) {
    // ── Guest / new-user onboarding flow ─────────────────────────────────────
    // 3-question onboarding: monthly listeners → goal → email → auto account creation
    // NOTE: monthly_listeners column may not exist yet — use a safe subset first,
    // then attempt to read it separately so a missing column doesn't break the whole flow.
    const { data: guest, error: guestErr } = await supabase
      .from('guest_profiles')
      .select('phone_number, artist_name, goal, onboarding_step, message_count')
      .eq('phone_number', fromPhone)
      .maybeSingle()
    if (guestErr) console.warn('[blooio-webhook] guest_profiles select error:', guestErr.message)

    // Try to fetch monthly_listeners separately (column may not exist yet)
    let guestListeners: string | null = null
    if (guest) {
      const { data: lRow } = await supabase
        .from('guest_profiles')
        .select('monthly_listeners')
        .eq('phone_number', fromPhone)
        .maybeSingle()
      guestListeners = (lRow as { monthly_listeners?: string } | null)?.monthly_listeners ?? null
    }

    const step       = guest?.onboarding_step ?? 0
    const msgCount   = guest?.message_count   ?? 0
    const guestName  = guest?.artist_name ?? ''
    const GUEST_FREE_LIMIT = 10
    const now = new Date().toISOString()

    // Hard gate for step 5+ — limit reached → Stripe checkout
    if (step >= 5 && msgCount >= GUEST_FREE_LIMIT) {
      const checkoutUrl = await createGuestCheckoutUrl(fromPhone)
      if (checkoutUrl) {
        await sendBlooio(fromPhone,
          `You've used all ${GUEST_FREE_LIMIT} free messages with uP 🎵\n\nStart your 7-day free trial to keep your career moving — Spotify pitching, Meta ads, rollout plans, and more. No charge until the trial ends.\n\n👉 ${checkoutUrl}`)
      } else {
        await sendBlooio(fromPhone,
          `You've used all ${GUEST_FREE_LIMIT} free messages with uP 🎵\n\nCreate your full account to keep going — release planning, Spotify curator pitching, Meta ads, and your career dashboard.\n\n👉 groundupapp.com/signup`)
      }
      return { statusCode: 200, body: 'Guest limit reached' }
    }

    // ── Step 0 — brand new: welcome + contact card + ask artist name ──────────
    if (step === 0) {
      await supabase.from('guest_profiles').upsert(
        { phone_number: fromPhone, onboarding_step: 1, message_count: 1, updated_at: now },
        { onConflict: 'phone_number' }
      )
      await sendBlooio(fromPhone,
        `Hey 👋 I'm uP — your daily music career assistant.\n\nEvery day I help artists grow streams, plan releases, run ads, and pitch to Spotify curators — all from iMessage. No app switching, no fluff.\n\nSave my contact → groundupapp.com/contact\n\nWhat's your artist name?`
      )
      return { statusCode: 200, body: 'Guest step 1 — asked artist name' }
    }

    // ── Step 1 — have name → ask monthly listeners ────────────────────────────
    if (step === 1) {
      const artistName = inboundText.trim().slice(0, 80)
      await supabase.from('guest_profiles').upsert(
        { phone_number: fromPhone, artist_name: artistName, onboarding_step: 2, message_count: msgCount + 1, updated_at: now },
        { onConflict: 'phone_number' }
      )
      await sendBlooio(fromPhone,
        `${artistName} 🔥 Love it.\n\nHow many monthly listeners do you have right now? (Spotify, SoundCloud, Apple Music — any platform)`)
      return { statusCode: 200, body: 'Guest step 2 — asked listeners' }
    }

    // ── Step 2 — have listeners (artist) or roster size (manager) → ask goal ───
    if (step === 2) {
      const isManager = (guest?.goal ?? '').startsWith('__manager__') || detectB2BSignal(inboundText)
      const inputValue = inboundText.trim().slice(0, 80)

      if (isManager) {
        // B2B path — treat input as roster info, store it, ask manager-specific goal
        const baseUpsert = {
          phone_number: fromPhone,
          goal: `__manager__:roster=${inputValue}`,
          onboarding_step: 3,
          message_count: msgCount + 1,
          updated_at: now,
        }
        await supabase.from('guest_profiles').upsert(baseUpsert, { onConflict: 'phone_number' })
        await sendBlooio(fromPhone,
          `Got it — managing ${inputValue} is a real operation 🎯\n\nWhat's the main focus for your roster right now?\n\n1️⃣ Dropping new music\n2️⃣ Growing streams & listeners\n3️⃣ Running paid ads & scaling\n4️⃣ Building fanbase & social presence\n\nReply with a number or tell me in your own words.`)
        return { statusCode: 200, body: 'Manager step 3 — asked roster goal' }
      }

      // Artist path — normal listener count + goal question
      const baseUpsert = { phone_number: fromPhone, onboarding_step: 3, message_count: msgCount + 1, updated_at: now }
      const { error: upsertErr } = await supabase.from('guest_profiles').upsert(
        { ...baseUpsert, monthly_listeners: inputValue },
        { onConflict: 'phone_number' }
      )
      if (upsertErr) {
        console.warn('[blooio-webhook] monthly_listeners upsert failed, retrying without it:', upsertErr.message)
        await supabase.from('guest_profiles').upsert(baseUpsert, { onConflict: 'phone_number' })
      }
      await sendBlooio(fromPhone,
        `Got it 🎵 What's your #1 goal as an artist this year?\n\n1️⃣ Grow my streams & listeners\n2️⃣ Drop a major release\n3️⃣ Run paid ads & scale\n4️⃣ Build my fanbase / following\n\nReply with a number — or just tell me in your own words.`)
      return { statusCode: 200, body: 'Guest step 3 — asked goal' }
    }

    // ── Step 3 — have goal → ask email ────────────────────────────────────────
    if (step === 3) {
      const isManager = (guest?.goal ?? '').startsWith('__manager__')

      const ARTIST_GOAL_MAP: Record<string, string> = {
        '1': 'Grow streams & listeners',
        '2': 'Drop a major release',
        '3': 'Run paid ads & scale',
        '4': 'Build fanbase & following',
      }
      const MANAGER_GOAL_MAP: Record<string, string> = {
        '1': 'Dropping new music',
        '2': 'Growing streams & listeners',
        '3': 'Running paid ads & scaling',
        '4': 'Building fanbase & social presence',
      }
      const goalMap = isManager ? MANAGER_GOAL_MAP : ARTIST_GOAL_MAP
      const goalText = goalMap[inboundText.trim()] ?? inboundText.trim().slice(0, 100)

      // For managers, preserve the __manager__ prefix so step 4 knows
      const storedGoal = isManager ? `__manager__:goal=${goalText}` : goalText

      await supabase.from('guest_profiles').upsert(
        { phone_number: fromPhone, goal: storedGoal, onboarding_step: 4, message_count: msgCount + 1, updated_at: now },
        { onConflict: 'phone_number' }
      )

      if (isManager) {
        await sendBlooio(fromPhone,
          `${goalText} — let's build that out 🔥\n\nLast thing: what's your email? I'll set up your GrounduP manager account:\n\n• Multi-artist release calendar\n• Spotify curator pitching for your whole roster\n• Meta & TikTok ad tools per artist\n• Daily AI strategy via iMessage`)
      } else {
        const name = guestName || 'you'
        await sendBlooio(fromPhone,
          `${goalText} — let's get to work 🔥\n\nLast thing: what's your email? I'll set up ${name}'s GrounduP account:\n\n• Spotify curator pitching\n• Meta & TikTok ad builder\n• Release rollout calendar\n• Daily AI strategy in iMessage`)
      }
      return { statusCode: 200, body: 'Guest step 4 — asked email' }
    }

    // ── Step 4 — have email → create Supabase account + send temp password ────
    if (step === 4) {
      const rawEmail = inboundText.trim().toLowerCase()
      const isManager = (guest?.goal ?? '').startsWith('__manager__')

      // Basic email validation
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
      if (!emailValid) {
        await sendBlooio(fromPhone,
          `Hmm, that doesn't look like a valid email. Try again — what's your email address?`)
        return { statusCode: 200, body: 'Invalid email — retry' }
      }

      // Generate a human-readable temp password
      const tempPassword = generateTempPassword()
      const artistName   = guestName || ''

      // Create the Supabase user
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: rawEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          must_change_password: true,
          artist_name:          artistName,
          monthly_listeners:    guestListeners ?? '',
          goal:                 guest?.goal ?? '',
          account_type:         isManager ? 'manager' : 'artist',
        },
      })

      if (createError) {
        const alreadyExists = createError.message.toLowerCase().includes('already')
          || createError.message.toLowerCase().includes('duplicate')
          || createError.message.toLowerCase().includes('unique')
        if (alreadyExists) {
          await sendBlooio(fromPhone,
            `That email already has a GrounduP account. Log in at groundupapp.com/login — or use a different email address.`)
          return { statusCode: 200, body: 'Email already exists' }
        }
        console.error('[blooio-webhook] createUser error:', createError.message)
        await sendBlooio(fromPhone,
          `Hit a snag setting up your account — try again in a moment or go to groundupapp.com/signup`)
        return { statusCode: 200, body: 'createUser error' }
      }

      const newUserId = newUserData.user.id
      const goalText  = guest?.goal ?? ''
      const listeners = guestListeners ?? ''

      // Sync all iMessage onboarding data into the artist's dashboard profile
      await Promise.all([
        // artist_profiles: phone link + artist name + tone
        supabase.from('artist_profiles').upsert({
          user_id:      newUserId,
          artist_name:  artistName,
          phone_number: fromPhone,
          tone:         'Assistant Manager',
        }, { onConflict: 'user_id' }),

        // artist_preferences: artist name + goal → bio + tone
        // onboarding_complete stays false so web onboarding prompts genre
        supabase.from('artist_preferences').upsert({
          user_id:             newUserId,
          artist_name:         artistName,
          bio:                 goalText,
          tone:                'Assistant Manager',
          plan_tier:           'free',
          onboarding_complete: false,
          genre:               '',
        }, { onConflict: 'user_id' }),

        // Migrate guest conversation history to up_conversations so AI has full context
        supabase.from('guest_conversations')
          .select('role, content, created_at')
          .eq('phone_number', fromPhone)
          .order('created_at', { ascending: true })
          .then(({ data: history }) => {
            if (!history?.length) return
            return supabase.from('up_conversations').insert(
              history.map(h => ({
                user_id:    newUserId,
                role:       h.role,
                content:    h.content,
                channel:    'imessage',
                created_at: h.created_at,
              }))
            )
          }),

        // Mark guest profile complete
        supabase.from('guest_profiles').upsert(
          { phone_number: fromPhone, onboarding_step: 5, message_count: msgCount + 1, updated_at: now },
          { onConflict: 'phone_number' }
        ),
      ])

      // Store self-reported listener count as a platform snapshot so it shows in dashboard
      if (listeners) {
        await supabase.from('platform_snapshots').upsert({
          user_id:    newUserId,
          platform:   'self_reported',
          stats:      { monthlyListeners: listeners, goal: goalText },
          fetched_at: now,
        }, { onConflict: 'user_id, platform' })
      }

      // Text them the temp password + login link
      if (isManager) {
        await sendBlooio(fromPhone,
          `You're set up as a GrounduP manager! 🔥\n\nAccount: ${rawEmail}\nTemp password: ${tempPassword}\n\n👉 groundupapp.com/login\n\nChange your password on first login. Your dashboard lets you manage releases, run Spotify pitching, and build ad campaigns for your whole roster. Come back here anytime — I'm ready to work 🎵`)
      } else {
        await sendBlooio(fromPhone,
          `You're set up! 🔥\n\nAccount: ${rawEmail}\nTemp password: ${tempPassword}\n\n👉 groundupapp.com/login\n\nYou'll be asked to create a new password when you first log in. Then come back here — I'm ready to work 🎵`)
      }

      return { statusCode: 200, body: 'Account created' }
    }

    // ── Step 5+ — active guest chat via AI ────────────────────────────────────
    const newCount = msgCount + 1
    const today    = new Date().toISOString().split('T')[0]

    // Fetch last 8 messages of conversation history
    const { data: guestHistory } = await supabase
      .from('guest_conversations')
      .select('role, content')
      .eq('phone_number', fromPhone)
      .order('created_at', { ascending: false })
      .limit(8)

    const priorMsgs = (guestHistory ?? [])
      .reverse()
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    await Promise.all([
      supabase.from('guest_profiles')
        .update({ message_count: newCount, updated_at: now })
        .eq('phone_number', fromPhone),
      supabase.from('guest_conversations').insert({
        phone_number: fromPhone,
        role: 'user',
        content: inboundText,
      }),
    ])

    const remaining = GUEST_FREE_LIMIT - newCount

    const isManagerGuest = (guest?.goal ?? '').startsWith('__manager__')

    let guestReply = "I'm on it — let me get back to you on that."
    try {
      const guestSystemPrompt = isManagerGuest
        ? `You are uP, GrounduP's AI music career assistant. You're texting with a music manager or label rep named ${guestName || 'the manager'} who manages a roster of artists.

Today: ${today}

Speak to them in a B2B, professional tone — like a senior music industry advisor. They need help managing releases, pitching to Spotify curators, running Meta/TikTok ads, and scaling their artists. Keep replies under 130 words. Be specific and actionable.

GrounduP features for managers (reference naturally):
- Multi-artist release calendar & rollout planning
- Spotify curator pitching for full rosters
- Meta & TikTok ad campaign builder per artist
- TikTok influencer network for promo
- AI strategy via iMessage — no app switching

Guide them to log into their manager dashboard: groundupapp.com/login`
        : `You are uP, GrounduP's AI music career assistant. You're texting with an artist whose goal is: ${guest?.goal ?? 'grow their career'} and who has ${guestListeners ?? 'some'} monthly listeners.

Today: ${today}

Be direct, real, and conversational — like a manager in their corner. Keep replies under 130 words. Give specific, actionable advice.

GrounduP features (reference naturally, don't list all at once):
- Spotify playlist curator matching & direct pitching
- Meta ad campaign builder targeting fans of similar artists
- TikTok influencer network for promo content
- Release rollout planning & calendar
- AI career strategy via iMessage

Guide them to log into their dashboard: groundupapp.com/login`

      const guestRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 280,
        system: guestSystemPrompt,
        messages: [...priorMsgs, { role: 'user', content: inboundText }],
      })
      guestReply = guestRes.content[0].type === 'text' ? guestRes.content[0].text : guestReply
      // Log token usage for cost tracking
      const gIn = guestRes.usage?.input_tokens ?? 0
      const gOut = guestRes.usage?.output_tokens ?? 0
      supabase.from('api_usage').insert({
        phone_number: fromPhone,
        model: 'claude-haiku-4-5',
        input_tokens: gIn,
        output_tokens: gOut,
        cost_usd: (gIn * 0.0000008 + gOut * 0.000004).toFixed(6),
        channel: 'imessage',
      }).then(() => {})
    } catch (err) {
      console.error('[blooio-webhook] Claude guest error:', err)
    }

    // Low-message nudge
    if (remaining > 0 && remaining <= 3) {
      guestReply += `\n\n(${remaining} free message${remaining === 1 ? '' : 's'} left — log in at groundupapp.com to keep going)`
    }

    await Promise.all([
      supabase.from('guest_conversations').insert({ phone_number: fromPhone, role: 'assistant', content: guestReply }),
      sendBlooio(fromPhone, guestReply),
    ])
    return { statusCode: 200, body: 'Guest message handled' }
  }

  const userId = profile.user_id
  const voice  = TONE_VOICE[profile.tone ?? ''] ?? TONE_VOICE['Assistant Manager']

  // ─── Parallel: releases, events, history, plan tier, today's message count ──
  const today = new Date().toISOString().split('T')[0]
  const startOfDay = `${today}T00:00:00.000Z`
  const [releasesRes, eventsRes, historyRes, prefsRes, countRes, snapsRes] = await Promise.all([
    supabase.from('releases').select('title, type, release_date, checklist').eq('user_id', userId).order('release_date', { ascending: true }).limit(5),
    supabase.from('calendar_events').select('title, event_type, event_date').eq('user_id', userId).gte('event_date', today).order('event_date', { ascending: true }).limit(5),
    supabase.from('up_conversations').select('role, content').eq('user_id', userId).eq('channel', 'imessage').order('created_at', { ascending: false }).limit(6),
    supabase.from('artist_preferences').select('plan_tier').eq('user_id', userId).maybeSingle(),
    supabase.from('up_conversations').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('channel', 'imessage').eq('role', 'user')
      .gte('created_at', startOfDay),
    supabase.from('platform_snapshots').select('platform, stats, fetched_at').eq('user_id', userId).order('fetched_at', { ascending: false }).limit(15),
  ])

  // ─── Enforce plan-based daily iMessage limit ───────────────────────────────
  const planTier = (prefsRes.data?.plan_tier ?? 'free') as 'free' | 'pro' | 'growth'
  const dailyMax: Record<typeof planTier, number> = { free: 5, pro: 100, growth: 500 }
  const usedToday = countRes.count ?? 0
  console.log('[blooio-webhook] Plan check —', JSON.stringify({ planTier, usedToday, max: dailyMax[planTier] }))

  if (usedToday >= dailyMax[planTier]) {
    // Generate a magic link so tapping it auto-logs them into their existing
    // account and lands them directly on the pricing page — no "create account" prompt.
    // Wrap it in a short groundupapp.com/go/:code URL so iMessage shows a clean link.
    const siteUrl = process.env.URL ?? 'https://groundupapp.com'
    let upgradeUrl = `${siteUrl}/pricing`
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      const email = authUser?.user?.email
      if (email) {
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: { redirectTo: `${siteUrl}/pricing` },
        })
        const magicLink = linkData?.properties?.action_link
        if (magicLink) {
          // Store under a short code — expires in 24 hours
          const code = Math.random().toString(36).slice(2, 10)
          await supabase.from('short_links').insert({
            code,
            url: magicLink,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          upgradeUrl = `${siteUrl}/go/${code}`
        }
      }
    } catch (e) {
      console.warn('[blooio-webhook] Could not generate magic link:', e)
    }

    const upgradeLine = planTier === 'free'
      ? `You hit your daily uP limit on the Starter plan. Tap to upgrade to Pro (100 messages/day — free trial):\n\n👉 ${upgradeUrl}`
      : planTier === 'pro'
      ? `You hit today's 100-message Pro limit. Tap to upgrade to Growth (500/day):\n\n👉 ${upgradeUrl}`
      : 'You hit today\'s 500-message limit. Wild. Reach out to support if you need more. Resets at midnight.'

    await sendBlooio(fromPhone, upgradeLine)
    await supabase.from('up_conversations').insert([
      { user_id: userId, role: 'user',      content: inboundText,  channel: 'imessage' },
      { user_id: userId, role: 'assistant', content: upgradeLine,  channel: 'imessage' },
    ])
    return { statusCode: 200, body: 'Rate limited' }
  }

  const releases = releasesRes.data ?? []
  const events   = eventsRes.data ?? []
  const priorMessages = (historyRes.data ?? [])
    .reverse()
    .map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }))

  const releaseSummary = releases.length > 0
    ? releases.map(r => {
        const cl = r.checklist ?? []
        const done = cl.filter((t: { done: boolean }) => t.done).length
        return `"${r.title}" (${r.type}) — ${r.release_date} — ${done}/${cl.length} tasks done`
      }).join('; ')
    : 'No upcoming releases'

  const eventSummary = events.length > 0
    ? events.map(e => `${e.title} on ${e.event_date}`).join('; ')
    : 'No upcoming events'

  // Latest platform snapshot per platform
  const snaps = (snapsRes.data ?? []) as Array<{ platform: string; stats: Record<string, unknown> }>
  const latestByPlatform: Record<string, Record<string, unknown>> = {}
  for (const s of snaps) if (!latestByPlatform[s.platform]) latestByPlatform[s.platform] = s.stats

  const fmt = (n: unknown) => typeof n === 'number' ? n.toLocaleString() : '—'
  const sp = latestByPlatform['spotify']
  const sc = latestByPlatform['soundcloud']
  const yt = latestByPlatform['youtube']
  const statLines: string[] = []
  if (sp?.monthlyListeners) statLines.push(`Spotify ${fmt(sp.monthlyListeners)} monthly listeners`)
  if (sc?.followers)        statLines.push(`SoundCloud ${fmt(sc.followers)} followers`)
  if (yt?.subscribers)      statLines.push(`YouTube ${fmt(yt.subscribers)} subs`)
  const statSummary = statLines.length > 0 ? statLines.join(', ') : 'No platforms linked'

  const systemPrompt = `You are uP, the AI music career assistant for ${profile.artist_name} on GrounduP. ${voice}

Today's date: ${today}

Artist context:
- Live stats: ${statSummary}
- Releases: ${releaseSummary}
- Events: ${eventSummary}

FORMAT: iMessage only — plain text, no markdown, no bullet symbols. Use numbers or line breaks when listing steps. Keep it conversational and direct.

RELEASE INTAKE FLOW — when the artist mentions dropping, releasing, or uploading any song or project, run through these qualifying questions ONE AT A TIME (ask one, wait for the answer, then move to the next):

Step 1 — Platform & upload type:
  - SoundCloud: "Is this going on your own profile, or is a DJ / producer uploading it to their page?"
  - Spotify / Apple Music: "Are you distributing through DistroKid, TuneCore, or another distributor?"
  - TikTok / YouTube: "Is this an original post on your channel, or a collab with another creator?"

Step 2 — Timeline & assets: Confirm the exact drop date and whether cover art, caption, and audio file are locked.

Step 3 — Promo angle: Ask who the target audience is and whether they have any TikTok hooks, playlist targets, blog outreach, or curators lined up.

After you have that context, send a short numbered rollout checklist (3-5 steps max) tailored to their platform and timeline. Reference their real stats and mention that their GrounduP dashboard has an influencer network and curator tool they can use to find the right people.

Never ask all questions at once — one question per reply, wait for their answer.

RELEASE SYNC: Once you know the song title AND release date (even approximate like "this Friday"), emit this block at the VERY END so the release gets added to the artist's dashboard calendar automatically:
<up_release>{"title":"song title","type":"single","platform":"SoundCloud","release_date":"YYYY-MM-DD"}</up_release>
Rules: Only emit ONCE per release — when both title and date are confirmed. Use today's date (${today}) to calculate relative dates like "this Friday" or "next Monday". type = single | EP | album. Omit entirely if title or date is still unknown.
When you emit this, naturally mention in your text reply that you've added it to their dashboard.

TASK EXTRACTION: If you identify any action items for the artist, append them at the VERY END (auto-stripped, not seen by artist):
<up_tasks>["Task 1 (5-10 words)", "Task 2"]</up_tasks>
Only if genuinely actionable. Omit entirely if no tasks.`

  // ─── Call Claude — use Haiku for speed (perfect for short iMessage replies) ─
  let reply = ''
  try {
    const res = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 300,
      system:     systemPrompt,
      messages:   [...priorMessages, { role: 'user', content: inboundText }],
    })
    reply = res.content[0].type === 'text' ? res.content[0].text : "I'm on it — check the app for full details."
    // Log token usage for cost tracking
    const rIn = res.usage?.input_tokens ?? 0
    const rOut = res.usage?.output_tokens ?? 0
    supabase.from('api_usage').insert({
      user_id: userId,
      phone_number: fromPhone,
      model: 'claude-haiku-4-5',
      input_tokens: rIn,
      output_tokens: rOut,
      cost_usd: (rIn * 0.0000008 + rOut * 0.000004).toFixed(6),
      channel: 'imessage',
    }).then(() => {})
  } catch (err) {
    console.error('[blooio-webhook] Claude error:', err)
    reply = "Ran into something on my end — open the GrounduP app for now."
  }

  // ─── Extract release, tasks, and clean reply (order matters — release first) ─
  const { cleaned: afterRelease, release } = extractRelease(reply)
  const { cleaned: cleanReply, tasks }     = extractTasks(afterRelease)

  // ─── Auto-create release in Supabase if confirmed ─────────────────────────
  let releaseP: Promise<unknown> = Promise.resolve()
  if (release?.title && release?.release_date) {
    // Avoid duplicates: only insert if no release with this title exists
    releaseP = supabase
      .from('releases')
      .select('id')
      .eq('user_id', userId)
      .ilike('title', release.title)
      .maybeSingle()
      .then(({ data: existing }) => {
        if (!existing) {
          return supabase.from('releases').insert({
            user_id:      userId,
            title:        release.title,
            type:         release.type || 'single',
            release_date: release.release_date,
            checklist:    buildChecklist(release.platform || ''),
          })
        }
      })
  }

  // ─── Send reply + log in parallel; await both so Lambda doesn't freeze logging ──
  const sendP = sendBlooio(fromPhone, cleanReply)
  const logP  = supabase.from('up_conversations').insert([
    { user_id: userId, role: 'user',      content: inboundText, channel: 'imessage' },
    { user_id: userId, role: 'assistant', content: cleanReply,  channel: 'imessage' },
  ])
  const tasksP = tasks.length > 0
    ? supabase.from('up_tasks').insert(tasks.map(content => ({ user_id: userId, content, source: 'imessage' })))
    : Promise.resolve()

  const [, logRes, tasksRes] = await Promise.all([sendP, logP, tasksP, releaseP])
  if (logRes && (logRes as { error?: unknown }).error) {
    console.error('[blooio-webhook] Conversation log error:', (logRes as { error: unknown }).error)
  }
  if (tasksRes && (tasksRes as { error?: unknown }).error) {
    console.error('[blooio-webhook] Task log error:', (tasksRes as { error: unknown }).error)
  }

  return { statusCode: 200, body: 'OK' }
}

// ─── B2B / Manager Signal Detection ──────────────────────────────────────────
function detectB2BSignal(text: string): boolean {
  const lower = text.toLowerCase()
  return [
    'my client', 'my clients', 'i manage', 'i rep ', 'i represent',
    'my artist', 'my artists', 'their music', 'millanote',
    'roster', 'my roster', 'management company', 'artist data',
    'artist date', 'on behalf', 'i work with', 'we manage',
    'label rep', 'music manager', 'managing artists', 'all the artist',
    "i'm a manager", 'im a manager', 'i am a manager',
  ].some(kw => lower.includes(kw))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractTasks(text: string): { cleaned: string; tasks: string[] } {
  const match = text.match(/<up_tasks>([\s\S]*?)<\/up_tasks>/)
  if (!match) return { cleaned: text.trim(), tasks: [] }
  let tasks: string[] = []
  try { tasks = JSON.parse(match[1].trim()) } catch { tasks = [] }
  if (!Array.isArray(tasks)) tasks = []
  const cleaned = text.replace(/<up_tasks>[\s\S]*?<\/up_tasks>/, '').trim()
  return { cleaned, tasks }
}

interface ExtractedRelease {
  title: string
  type: string
  platform: string
  release_date: string
}

function extractRelease(text: string): { cleaned: string; release: ExtractedRelease | null } {
  const match = text.match(/<up_release>([\s\S]*?)<\/up_release>/)
  if (!match) return { cleaned: text.trim(), release: null }
  let release: ExtractedRelease | null = null
  try {
    const parsed = JSON.parse(match[1].trim())
    if (parsed?.title && parsed?.release_date) release = parsed as ExtractedRelease
  } catch { /* noop */ }
  const cleaned = text.replace(/<up_release>[\s\S]*?<\/up_release>/, '').trim()
  return { cleaned, release }
}

function buildChecklist(platform: string): Array<{ label: string; done: boolean }> {
  const base = [
    { label: 'Finalize audio master', done: false },
    { label: 'Create cover art (3000×3000px)', done: false },
    { label: 'Write release caption / description', done: false },
  ]
  if (platform === 'SoundCloud') return [
    ...base,
    { label: 'Upload track to SoundCloud', done: false },
    { label: 'Add tags and genre', done: false },
    { label: 'Pitch to SoundCloud DJs via Influencer Network', done: false },
    { label: 'Pin track to profile on release day', done: false },
    { label: 'Post on social media with SoundCloud link', done: false },
  ]
  if (platform === 'Spotify' || platform === 'Apple Music') return [
    ...base,
    { label: 'Submit to distributor (DistroKid / TuneCore)', done: false },
    { label: 'Pitch to Spotify editorial via dashboard', done: false },
    { label: 'Build pre-save link and share early', done: false },
    { label: 'Reach out to playlist curators in Influencer Network', done: false },
    { label: 'Plan social content for release week', done: false },
  ]
  if (platform === 'YouTube') return [
    ...base,
    { label: 'Upload and schedule YouTube video', done: false },
    { label: 'Write SEO-optimized title and description', done: false },
    { label: 'Create eye-catching thumbnail', done: false },
    { label: 'Share YouTube Short on drop day', done: false },
    { label: 'Pitch to YouTube curators in Influencer Network', done: false },
  ]
  return [
    ...base,
    { label: 'Upload and schedule release', done: false },
    { label: 'Plan promotional content for release day', done: false },
    { label: 'Reach out to curators and influencers in dashboard', done: false },
    { label: 'Post on all social platforms', done: false },
  ]
}

// ─── Generate a human-readable temp password like "uP-7X2K9M" ────────────────
function generateTempPassword(): string {
  // Excludes confusable characters: 0, O, I, 1, l
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = 'uP-'
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// ─── Create a Stripe Checkout session for a guest user (phone-keyed) ─────────
// client_reference_id is "guest_<phone>" so the stripe-webhook can bind the
// new account to their existing guest profile when they pay.
async function createGuestCheckoutUrl(phone: string): Promise<string | null> {
  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_PRO) {
    console.warn('[blooio-webhook] Stripe not configured — skipping guest checkout')
    return null
  }
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' })
    const encodedPhone = encodeURIComponent(phone)
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items:           [{ price: STRIPE_PRICE_PRO, quantity: 1 }],
      client_reference_id:  `guest_${phone}`,
      success_url:          `https://groundupapp.com/signup?phone=${encodedPhone}&from=checkout`,
      cancel_url:           'https://groundupapp.com/app',
      subscription_data: {
        trial_period_days: 7,
        metadata: { guest_phone: phone },
      },
      metadata: { guest_phone: phone },
      allow_promotion_codes: true,
    })
    return session.url
  } catch (err) {
    console.error('[blooio-webhook] Stripe checkout session error:', err)
    return null
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

async function sendBlooio(to: string, text: string, attachments?: string[]) {
  if (!BLOOIO_API_KEY) return
  try {
    const body: Record<string, unknown> = { to, text }
    if (attachments?.length) body.attachments = attachments
    const res = await fetch(BLOOIO_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${BLOOIO_API_KEY}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[blooio-webhook] Send error:', res.status, err)
    }
  } catch (err) {
    console.error('[blooio-webhook] Network error:', err)
  }
}
