/**
 * Blooio Inbound Message Poller
 *
 * Runs every minute. Polls Blooio's messages API for new inbound messages
 * and forwards them to blooio-webhook for processing. This is a reliable
 * fallback since Blooio's inbound webhooks are unreliable.
 *
 * Env vars required (same as blooio-webhook):
 *   BLOOIO_API_KEY
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const BLOOIO_API_KEY = process.env.BLOOIO_API_KEY            ?? ''
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL          ?? ''
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY  ??
                       process.env.VITE_SUPABASE_ANON_KEY     ?? ''

// In production this function always runs at groundupapp.com
const SITE_URL = process.env.URL ?? 'https://groundupapp.com'

interface BlooioMessage {
  message_id: string
  external_id: string  // sender phone number
  text:        string
  direction:   string
  time_sent:   number  // unix ms
}

export const handler: Handler = async () => {
  if (!BLOOIO_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.log('[blooio-poller] Missing env vars — skipping')
    return { statusCode: 200, body: 'Not configured' }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // ─── Get last processed cutoff from poller_state ────────────────────────────
  const { data: state } = await supabase
    .from('poller_state')
    .select('value')
    .eq('key', 'blooio_last_time_sent')
    .maybeSingle()

  // Default: look back 5 minutes on first run to pick up recent test messages
  const lastTimeSent: number = state?.value
    ? Number(state.value)
    : Date.now() - 5 * 60 * 1000

  console.log(`[blooio-poller] Checking for messages after ${new Date(lastTimeSent).toISOString()}`)

  // ─── Fetch recent inbound messages from Blooio ──────────────────────────────
  let messages: BlooioMessage[] = []
  try {
    const r = await fetch(
      'https://backend.blooio.com/v1/api/messages?direction=inbound&limit=50',
      { headers: { 'Authorization': `Bearer ${BLOOIO_API_KEY}` } }
    )
    if (!r.ok) {
      console.error('[blooio-poller] Blooio API error:', r.status, await r.text())
      return { statusCode: 200, body: `Blooio API error: ${r.status}` }
    }
    const body = await r.json() as { messages?: BlooioMessage[] }
    messages = body.messages ?? []
  } catch (err) {
    console.error('[blooio-poller] Fetch error:', err)
    return { statusCode: 200, body: 'Fetch error' }
  }

  // ─── Filter: only new inbound messages ──────────────────────────────────────
  const newMessages = messages
    .filter(m => m.direction === 'inbound' && m.time_sent > lastTimeSent)
    .sort((a, b) => a.time_sent - b.time_sent) // oldest first

  console.log(`[blooio-poller] Found ${newMessages.length} new messages`)

  if (newMessages.length === 0) {
    return { statusCode: 200, body: 'No new messages' }
  }

  // ─── Forward each message to blooio-webhook for processing ─────────────────
  // We use x-poller-auth to bypass HMAC verification on the webhook side.
  const webhookUrl = `${SITE_URL}/.netlify/functions/blooio-webhook`
  let maxTimeSent = lastTimeSent

  for (const msg of newMessages) {
    if (!msg.text?.trim()) {
      console.log(`[blooio-poller] Skipping empty message ${msg.message_id}`)
      continue
    }
    console.log(`[blooio-poller] Forwarding ${msg.message_id} from ${msg.external_id}: "${msg.text.slice(0, 80)}"`)
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type':       'application/json',
          'x-poller-auth':      `Bearer ${BLOOIO_API_KEY}`,
          'x-blooio-event':     'message.received',
          'x-blooio-message-id': msg.message_id,
        },
        body: JSON.stringify({ from: msg.external_id, text: msg.text }),
      })
      console.log(`[blooio-poller] Webhook response for ${msg.message_id}: ${res.status}`)
    } catch (err) {
      console.error(`[blooio-poller] Failed to forward ${msg.message_id}:`, err)
    }
    maxTimeSent = Math.max(maxTimeSent, msg.time_sent)
  }

  // ─── Update cutoff to highest time_sent we processed ───────────────────────
  await supabase
    .from('poller_state')
    .upsert(
      { key: 'blooio_last_time_sent', value: String(maxTimeSent), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  return { statusCode: 200, body: `Processed ${newMessages.length} messages` }
}
