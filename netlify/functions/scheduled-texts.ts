/**
 * Runs on a schedule (configured in netlify.toml) to send routine iMessage
 * texts to users based on their artist profile and upcoming calendar events.
 *
 * Netlify schedule: every Sunday at 10am ET  →  "0 14 * * 0"
 */

import type { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL   = process.env.SUPABASE_URL!
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BB_URL         = process.env.BLUEBUBBLES_SERVER_URL
const BB_PASS        = process.env.BLUEBUBBLES_PASSWORD

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Message templates ────────────────────────────────────────────────────────

type Profile = {
  id: string
  phone: string | null
  sms_notifications: boolean
  artist_name: string | null
  genre: string | null
  goals: string[] | null
  plan_tier: string
}

function weeklyTip(profile: Profile): string {
  const name = profile.artist_name ?? 'Artist'
  const genre = (profile.genre ?? 'hip-hop').toLowerCase()
  const goals = profile.goals ?? []

  const tips: string[] = []

  if (goals.includes('spotify') || goals.includes('playlists')) {
    tips.push(
      `Hey ${name} 👋 uP reminder: if you have a release dropping this week, pitch it to Spotify editorial NOW — pitches submitted 7+ days early get 3x more placements. Open your dashboard to find curators.`,
    )
  }
  if (goals.includes('tiktok') || goals.includes('social')) {
    tips.push(
      `${name}, your weekly uP tip 🎵 Post 3–5 TikToks this week using your latest release audio. The algorithm rewards consistency. Even a 15-second hook clip can trigger exponential reach.`,
    )
  }
  if (goals.includes('email') || goals.includes('outreach') || goals.includes('blogs')) {
    tips.push(
      `${name} — uP outreach reminder 📬 Your curator list has fresh contacts. Block 30 min today to send 5 personalized emails. Consistency beats volume in blog outreach.`,
    )
  }

  // Default tip if no specific goals matched
  if (tips.length === 0) {
    const defaults = [
      `${name} — your weekly uP check-in 🔥 What's one thing you can ship this week? Even a short clip or story keeps your audience engaged between releases.`,
      `Hey ${name} 👊 Quick uP reminder: artists who post content daily in the week after a release see 40% more algorithmic reach. Your window is open — use it.`,
      `${name}, uP here 🎯 Have you followed up with any playlist curators this week? One email a day keeps the drought away. Check your Influencer Network in the app.`,
    ]
    tips.push(defaults[Math.floor(Math.random() * defaults.length)])
  }

  return tips[Math.floor(Math.random() * tips.length)]
}

function eventReminder(profile: Profile, eventTitle: string, daysUntil: number): string {
  const name = profile.artist_name ?? 'Artist'
  if (daysUntil === 1) {
    return `${name} — tomorrow is "${eventTitle}" 🗓️ Make sure everything is lined up: assets ready, team notified, posts scheduled. You've got this. — uP`
  }
  return `${name} — "${eventTitle}" is in ${daysUntil} days ⏰ Now's the time to prep your rollout checklist. Open your Campaign Scheduler in uP to review. — uP`
}

function outreachNudge(profile: Profile): string {
  const name = profile.artist_name ?? 'Artist'
  return `${name} 📣 Your influencer network has 627 curators waiting. Pick 3 from your dashboard and reach out today — even a short DM on Twitter or email gets results. — uP`
}

// ─── Send via BlueBubbles ─────────────────────────────────────────────────────

async function sendMessage(phone: string, message: string): Promise<boolean> {
  if (!BB_URL || !BB_PASS) {
    console.log(`[demo] Would send to ${phone}: ${message.slice(0, 60)}...`)
    return true
  }
  const e164 = phone.replace(/\D/g, '').replace(/^1?(\d{10})$/, '+1$1')
  const res = await fetch(`${BB_URL}/api/v1/message/text?password=${encodeURIComponent(BB_PASS)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatGuid: `iMessage;-;${e164}`,
      tempGuid: crypto.randomUUID(),
      message,
      method: 'private-api',
    }),
  })
  return res.ok
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const handler: Handler = async (_event: HandlerEvent) => {
  const { data: profiles, error } = await supabase
    .from('artist_preferences')
    .select('id, phone, sms_notifications, artist_name, genre, goals, plan_tier')
    .eq('sms_notifications', true)
    .not('phone', 'is', null)

  if (error) {
    console.error('Supabase error:', error)
    return { statusCode: 500, body: error.message }
  }

  const today = new Date()
  let sent = 0

  for (const profile of (profiles ?? []) as Profile[]) {
    if (!profile.phone) continue

    // --- Weekly tip (always send on Sunday) ---
    if (today.getDay() === 0) {
      await sendMessage(profile.phone, weeklyTip(profile))
      sent++
    }

    // --- Outreach nudge (every other Wednesday) ---
    if (today.getDay() === 3 && Math.floor(today.getDate() / 7) % 2 === 0) {
      await sendMessage(profile.phone, outreachNudge(profile))
      sent++
    }

    // --- Check for events coming up in 1 or 3 days ---
    const { data: events } = await supabase
      .from('calendar_events')
      .select('title, event_date')
      .eq('user_id', profile.id)
      .gte('event_date', today.toISOString().slice(0, 10))

    for (const ev of (events ?? []) as { title: string; event_date: string }[]) {
      const diff = Math.round((new Date(ev.event_date).getTime() - today.getTime()) / 86_400_000)
      if (diff === 1 || diff === 3) {
        await sendMessage(profile.phone, eventReminder(profile, ev.title, diff))
        sent++
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ sent }) }
}
