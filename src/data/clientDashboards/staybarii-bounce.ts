/**
 * Data for /client/staybarii-bounce.
 *
 * `isSample: true` — every metric below is an illustrative placeholder
 * for showing the client what their dashboard will look like, NOT real
 * pulled data (no API is connected yet). The real video title, channel,
 * and thumbnail are real (pulled via YouTube's oEmbed endpoint); the
 * numbers around them are not.
 *
 * TODO (Joseph): once the real campaign is live and you have real
 * numbers, replace the values below, set `isSample: false`, and bump
 * `lastUpdated`. The shape (YouTubePerformance / GoogleAdsPerformance /
 * etc.) is in ./types.ts.
 *
 * Password: CLIENT_DASHBOARD_PASSWORD_STAYBARII_BOUNCE + CLIENT_DASHBOARD_SECRET
 * still need to be set in Netlify env vars before this is reachable live.
 */
import type { ClientDashboardData } from './types'

export const STAYBARII_BOUNCE: ClientDashboardData = {
  slug:        'staybarii-bounce',
  clientName:  'Staybarii',
  campaignName: '"Bounce" — YouTube & TikTok Ad Campaign',
  status:      'optimizing',
  lastUpdated: '2026-09-11T14:00:00Z',
  isSample:    true,

  videoUrl:       'https://www.youtube.com/watch?v=FDjdBhXLIeo',
  videoThumbnail: 'https://i.ytimg.com/vi/FDjdBhXLIeo/hqdefault.jpg',

  timeline: {
    youtube: { startDate: '2026-09-02', note: 'In-stream + Shorts ads' },
    tiktok:  { startDate: '2026-09-02', note: 'In-feed ads + sound page' },
  },

  youtube: {
    views: 186_400,
    adViews: 74_200,
    watchTimeHours: 3_120,
    avgViewDuration: '1:12',
    likes: 6_840,
    comments: 415,
    shares: 1_260,
    subscribersGained: 290,
  },

  googleAds: {
    spend:      3_800,
    impressions: 940_000,
    reach:      512_000,
    views:      74_200,
    clicks:     9_600,
    cpv:        0.051,
    cpc:        0.396,
    viewRate:   7.9,
    targeting: [
      'Age 18–34',
      'Interest: Hip-Hop & Rap',
      'Interest: Dancehall & Afrobeats',
      'In-market: Music streaming subscribers',
      'Custom audience: Similar to Staybarii listeners',
      'Placements: YouTube in-stream, YouTube Shorts',
      'Geo: United States, Jamaica, UK, Canada',
    ],
  },

  website: {
    users: 12_100,
    musicVideoClicks: 4_350,
    conversions: 380,
    trafficSources: [
      { source: 'YouTube', users: 6_400 },
      { source: 'TikTok', users: 3_900 },
      { source: 'Direct', users: 1_100 },
      { source: 'Instagram', users: 700 },
    ],
  },

  tiktok: {
    impressions: 2_600_000,
    videoViews: 1_480_000,
    engagement: 9.1,
    clicks: 28_400,
    bestCreative: 'Dance challenge cut (:15)',
  },

  tiktokCreations: [
    { label: '@bouncechallenge — dance duet using the sound', url: 'https://www.tiktok.com' },
    { label: '@islandvibesdaily — reaction + dance', url: 'https://www.tiktok.com' },
    { label: '@staybarii — official sound page', url: 'https://www.tiktok.com' },
  ],

  audience: {
    ageRange: '18–34',
    locations: ['United States', 'Jamaica', 'United Kingdom', 'Canada'],
    interests: ['Dancehall', 'Afrobeats', 'Hip-Hop', 'Dance Challenges'],
    behaviors: ['Frequent short-form video sharers', 'Music streaming power users', 'Engages with dance trends'],
    contentPreferences: ['Short-form dance clips', 'Behind-the-scenes / studio content', 'Full music video watch-throughs'],
  },

  creativeLibrary: [
    { id: 'mv-official', title: 'Bounce — Official Music Video', type: 'music-video-cut', url: 'https://www.youtube.com/watch?v=FDjdBhXLIeo', thumbnail: 'https://i.ytimg.com/vi/FDjdBhXLIeo/hqdefault.jpg' },
    { id: 'ad-15s', title: ':15 In-Stream Ad Cut', type: 'ad', url: 'https://www.youtube.com/watch?v=FDjdBhXLIeo' },
    { id: 'dance-cut', title: 'Dance Challenge Cut', type: 'dance', url: 'https://www.tiktok.com' },
    { id: 'ugc-1', title: 'Fan Reaction Compilation', type: 'ugc', url: 'https://www.tiktok.com' },
  ],

  insights: [
    {
      date: '2026-09-11',
      text: 'Dance-focused clips are producing more shares and faster engagement on TikTok, while the full music-video cut is generating longer watch time and more subscriber growth on YouTube. We\'re shifting TikTok ad spend toward the dance-challenge creative and using YouTube in-stream to retarget viewers who watched 50%+ of the video toward the full release.',
    },
    {
      date: '2026-09-05',
      text: 'Early CPV came in well under the hip-hop/dancehall benchmark, so we widened the lookalike audience from "similar to Staybarii listeners" to include broader Afrobeats/dancehall fans in the US, UK, and Canada — impressions picked up without CPV rising meaningfully.',
    },
  ],
}
