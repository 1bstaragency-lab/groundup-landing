/**
 * Offer page configurations.
 *
 * Each offer has its own headline, eyebrow, demo iMessage conversation,
 * CTA copy, and trust line. The OfferPage component reads these by slug
 * and renders the shared OfferShell with the right content.
 *
 * To add a new offer: add an entry here + a Route in App.tsx.
 *
 * To track which offer drives a signup, create a dedicated Blooio short
 * link per offer (e.g. `start.msg.new/free`) and swap IMESSAGE_LINK below.
 */

export const IMESSAGE_LINK = 'https://start.msg.new/EEHfxKYWDk'

export type DemoMessage = {
  from: 'up' | 'user'
  text: string
}

export interface OfferConfig {
  slug:        string
  eyebrow:     string
  /** Use \n in the string for forced line breaks (rendered with whitespace-pre-line). */
  headline:    string
  subline:     string
  chips:       string[]
  messages:    DemoMessage[]
  ctaText:     string
  ctaIcon?:    'message' | 'check' | 'spark'
  trustLine:   string
  successLine: string
}

export const OFFERS: Record<string, OfferConfig> = {
  // ─── 1. 30 Days Free ────────────────────────────────────────────────────
  free: {
    slug:     'free',
    eyebrow:  '30 Days Free Pro · Limited',
    headline: '30 days of uP.\nOn us.',
    subline:  'uP is your AI music manager — texts you through iMessage to run Spotify curator pitches, Meta ad campaigns, and release strategy. Full Pro free for 30 days. No card.',
    chips:    ['💬 iMessage AI', '🎵 Release Planning', '🎯 Curator Matching', '📊 Meta Ads'],
    messages: [
      { from: 'up',   text: "Welcome to uP. I'm your AI music manager — I run rollouts, pitch curators, and build ad campaigns through iMessage. Got a track in mind?" },
      { from: 'user', text: 'Drop a new single in 3 weeks.' },
      { from: 'up',   text: "Locked in. I'll build the 3-week rollout: curator pitches at week 2, teasers across socials, Meta ad warmup at week 3. Pro is on the house for 30 days — no card needed. Cool to start?" },
      { from: 'user', text: "Let's go." },
      { from: 'up',   text: "🔥 You're activated. First task: send me the track title and release date and I'll line up your curator list tonight." },
    ],
    ctaText:     'Claim 30 Days Free',
    ctaIcon:     'message',
    trustLine:   'No credit card · Cancel anytime · Full Pro access',
    successLine: 'Check your iMessage — uP is texting you now.',
  },

  // ─── 2. 50 Free Curator Pitches ─────────────────────────────────────────
  curators: {
    slug:     'curators',
    eyebrow:  'Free Curator Pitch Pack',
    headline: '50 Spotify curators.\nPitched for you.',
    subline:  'uP is your AI music manager — runs through iMessage. Drop your Spotify link and your next release date, and it pitches 50 active editorial + indie playlist curators on your behalf. Free.',
    chips:    ['🎵 Sound Matching', '✉️ Personalized Pitches', '📈 Response Tracking', '🎯 Editorial + Indie'],
    messages: [
      { from: 'up',   text: 'Drop your Spotify artist link and your next release date — I\'ll pull a curator list tonight.' },
      { from: 'user', text: 'open.spotify.com/artist/2x4… · drops June 14' },
      { from: 'up',   text: 'Pulled 50 curators in your lane. Top hits: Chill R&B Vibes (480K · Mara Lee), Late Night Feels (210K · Devon K), 48 more.\n\nWant me to write the pitches and send June 7 (7 days pre-release sweet spot)?' },
      { from: 'user', text: 'Yes.' },
      { from: 'up',   text: 'Done ✓ All 50 queued, personalized to each curator. I\'ll text you every time one replies.' },
    ],
    ctaText:     'Get My Pitch Pack',
    ctaIcon:     'message',
    trustLine:   'Average artist lands 3+ placements per pack',
    successLine: 'Check your iMessage — uP is asking for your Spotify link.',
  },

  // ─── 3. $50 Meta Ad Credit ──────────────────────────────────────────────
  ads: {
    slug:     'ads',
    eyebrow:  '$50 Meta Ad Credit',
    headline: '$50 in Meta ads.\nOn us.',
    subline:  "uP is your AI music manager — texts you through iMessage. Tell it the track you want to push and it builds the Meta ad creative, picks the audience, and runs the campaign. $50 ad credit included.",
    chips:    ['🎨 Auto Creative', '🎯 Lookalike Targeting', '📊 Daily Reporting', '⚡ Same-Day Launch'],
    messages: [
      { from: 'up',   text: 'Drop the track you want to push — Spotify or Apple Music link works.' },
      { from: 'user', text: 'open.spotify.com/track/4Pzc…' },
      { from: 'up',   text: 'Got it. Building the campaign:\n• Audience: fans of Brent Faiyaz + Steve Lacy + Daniel Caesar\n• Creative: 3 short-form video ads from your assets\n• Budget: $50 credit (~400 new listeners est.)\n\nLaunch tonight?' },
      { from: 'user', text: 'Send it.' },
      { from: 'up',   text: '🚀 Live in 2 hours after Meta review. I\'ll text you the results every morning.' },
    ],
    ctaText:     'Claim $50 Ad Credit',
    ctaIcon:     'message',
    trustLine:   'Avg $0.12 / new listener · No ad experience needed',
    successLine: 'Check your iMessage — uP is asking for your track link.',
  },

  // ─── 4. Free 8-Week Rollout ─────────────────────────────────────────────
  rollout: {
    slug:     'rollout',
    eyebrow:  'Free Release Rollout Plan',
    headline: 'Your next release.\nMapped week by week.',
    subline:  'uP is your AI music manager — runs through iMessage. Tell it your release date and get a custom 8-week rollout: Spotify pitches, content drops, ad timing, curator outreach — all scheduled and managed by text.',
    chips:    ['📅 8-Week Plan', '🎯 Curator Pitching', '📱 Content Calendar', '💰 Ad Scheduling'],
    messages: [
      { from: 'up',   text: 'What\'s the release date and what type of drop — single, EP, album?' },
      { from: 'user', text: 'Single. August 22.' },
      { from: 'up',   text: 'Building your 8-week plan:\nWk 1–2: Teasers + asset prep\nWk 3–4: Curator pitches (50 targets)\nWk 5–6: TikTok seeding + influencer outreach\nWk 7: Pre-save campaign + Meta ad warmup\nWk 8: Release day push\n\nLock it in?' },
      { from: 'user', text: 'Yes lock it.' },
      { from: 'up',   text: '✓ Calendar live. I\'ll text you each task as the dates hit — no logging in required.' },
    ],
    ctaText:     'Plan My Rollout',
    ctaIcon:     'message',
    trustLine:   'Custom 8-week plan built for your release date',
    successLine: 'Check your iMessage — uP is asking for your release date.',
  },

  // ─── 5. AI Manager · $300 Starter Bundle ────────────────────────────────
  manager: {
    slug:     'manager',
    eyebrow:  'Manager Bundle · $300 Value',
    headline: '$300 of music\nmanagement. Free.',
    subline:  "uP is your AI music manager — runs through iMessage. Sign up and get $300 in services on us: 100 Spotify curator pitches ($150), $50 Meta ad credit, a custom 8-week release plan ($100), plus full Pro access for 60 days.",
    chips:    ['💵 100 Curator Pitches', '📊 $50 Ad Credit', '📅 Release Plan', '⚡ 60 Days Pro'],
    messages: [
      { from: 'up',   text: "I'm uP — your AI manager. You're starting with $300 of services on the house. What do you want to use first — curator pitches, the ad credit, or the release plan?" },
      { from: 'user', text: 'Start with the curator pitches.' },
      { from: 'up',   text: 'Locked in. Drop your Spotify artist link and I\'ll pull 100 curators in your lane tonight — personalized pitches sent over the next 7 days.' },
      { from: 'user', text: 'open.spotify.com/artist/2x4… here you go.' },
      { from: 'up',   text: "✓ Pulled. 100 curators queued. I'll text you each reply as it lands. Your $50 ad credit + release plan stay in the bank until you're ready." },
    ],
    ctaText:     'Claim $300 Free',
    ctaIcon:     'spark',
    trustLine:   '$300+ in services · 60 days Pro · No card required',
    successLine: 'Check your iMessage — uP is unlocking your $300 bundle.',
  },

  // ─── 6. Comeback · $250 Re-launch Bundle ────────────────────────────────
  comeback: {
    slug:     'comeback',
    eyebrow:  'Comeback Bundle · $250 Value',
    headline: '$250 to re-launch\nyour last single.',
    subline:  "uP is your AI music manager — runs through iMessage. Pick a past track that didn't pop. Get a $250 re-launch bundle on us: $100 Meta ad credit, 30 curator re-pitches ($90), 5 TikTok creator seeds ($60). All run by uP.",
    chips:    ['💵 $100 Ad Credit', '🎯 30 Curator Re-pitches', '📱 5 TikTok Seeds', '📈 5x Avg Stream Lift'],
    messages: [
      { from: 'up',   text: "Which past release do you want to re-launch? Drop the Spotify or Apple Music link and I'll spin up your $250 comeback pack." },
      { from: 'user', text: 'open.spotify.com/track/3HFm… · dropped 8 months ago, stalled at 12k streams' },
      { from: 'up',   text: 'Pulled it. Comeback pack ready:\n• $100 Meta ad credit (3 fresh creatives)\n• 30 curator re-pitches ("rediscover" angle)\n• 5 TikTok creators to seed the hook\n• I\'ll repackage it as an EP teaser too\n\nLaunch this week?' },
      { from: 'user', text: 'Let\'s run it.' },
      { from: 'up',   text: '🚀 $250 pack deployed. Live in 48h. I\'ll text you stream lift every morning — most re-launches hit 5x in 30 days.' },
    ],
    ctaText:     'Claim $250 Re-launch',
    ctaIcon:     'spark',
    trustLine:   '$250 bundle · Avg 5x stream lift in 30 days · No card',
    successLine: 'Check your iMessage — uP is asking which track to re-launch.',
  },
}

export type OfferSlug = keyof typeof OFFERS
