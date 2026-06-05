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
    subline:  'Full Pro access — Spotify curator pitching, Meta ad management, and AI release strategy. Free for 30 days. No credit card required.',
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
    subline:  'uP matches your sound to 50 active editorial + indie playlist curators and writes a personalized pitch for each. Yours free for your next release.',
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
    subline:  'uP builds the creative, targets fans of similar artists, and runs the campaign — pushing streams to Spotify and Apple Music. $50 credit to start.',
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
    subline:  'Tell uP your release date. Get a custom 8-week rollout — Spotify pitches, content drops, ad timing, curator outreach — all scheduled and run automatically.',
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

  // ─── 5. Pre-Save Boost ──────────────────────────────────────────────────
  presave: {
    slug:     'presave',
    eyebrow:  'Pre-Save Boost',
    headline: '3x your pre-saves.\nBy launch day.',
    subline:  'uP generates your smart link, runs the pre-save campaign across socials, and DMs curators on release day. All managed from iMessage — no dashboards.',
    chips:    ['🔗 Smart Pre-Save Link', '📣 Auto Promo', '🎯 Curator Day-Of DM', '📊 Live Tracking'],
    messages: [
      { from: 'up',   text: 'Drop the release info — title, date, distributor (DistroKid, UnitedMasters, etc.)?' },
      { from: 'user', text: 'Track is "Nights" · drops July 18 · DistroKid' },
      { from: 'up',   text: 'Generated your pre-save link: groundup.fm/nights\n\nI\'ll:\n• Push it to your IG / TikTok bio links\n• Run 7-day pre-save campaign\n• DM 30 curators on release day\n\nExpected: 1k+ pre-saves. Run it?' },
      { from: 'user', text: 'Run it 🔥' },
      { from: 'up',   text: 'Locked. I\'ll text you a pre-save count every morning until release.' },
    ],
    ctaText:     'Boost My Pre-Save',
    ctaIcon:     'message',
    trustLine:   'Avg artist hits 1k+ pre-saves · Built into iMessage',
    successLine: 'Check your iMessage — uP is asking for your release info.',
  },
}

export type OfferSlug = keyof typeof OFFERS
