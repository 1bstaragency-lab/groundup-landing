/**
 * Data for /client/staybarii-bounce.
 *
 * Real numbers only from here on (pulled via yt-dlp against the public
 * YouTube page on 2026-09-11 — see the values below). Fields we don't
 * have real access to (ad views, watch time, avg view duration, shares —
 * those need YouTube Analytics API + channel-owner auth; Google Ads
 * spend/impressions/CPV/CPC — needs a connected Ads account; GA4 website
 * stats — needs a connected property) are left `undefined` on purpose,
 * so the dashboard shows an honest "awaiting data" state instead of a
 * guess. See types.ts — every metric field is individually optional for
 * exactly this reason.
 *
 * TikTok is intentionally omitted for now (no TikTok campaign running
 * yet) — leaving `tiktok`/`tiktokCreations`/`timeline.tiktok` unset
 * fully hides those sections rather than showing them empty.
 *
 * `passwordProtected: false` — open to anyone with the link, no gate.
 */
import type { ClientDashboardData } from './types'

export const STAYBARII_BOUNCE: ClientDashboardData = {
  slug:        'staybarii-bounce',
  clientName:  'Staybarii',
  campaignName: '"Bounce" — YouTube Ad Campaign',
  status:      'live',
  lastUpdated: '2026-09-11T18:00:00Z',
  passwordProtected: false,

  videoUrl:       'https://www.youtube.com/watch?v=FDjdBhXLIeo',
  videoThumbnail: 'https://i.ytimg.com/vi/FDjdBhXLIeo/hqdefault.jpg',

  timeline: {
    youtube: { startDate: '2026-08-28', note: 'Video published — organic. Paid ads not yet live.' },
    // tiktok: omitted — no TikTok campaign yet
  },

  // Real, pulled from the public YouTube page (yt-dlp, 2026-09-11).
  // Ad views / watch time / avg view duration / shares aren't public —
  // those need YouTube Analytics API access from the channel owner.
  youtube: {
    views:    15_873,
    likes:    9,
    comments: 5,
  },

  // No Google Ads account is connected yet, so there's no real spend/
  // impressions/CPV data to show — only fill in `targeting`, which is
  // real (the actual plan), not a pulled metric.
  googleAds: {
    targeting: [
      'Fans of Don Toliver',
      'Fans of Brent Faiyaz',
      'Fans of Kanii',
      'Fans of Jordan Adetunji',
      'Fans of The Weeknd',
      'Interest: R&B',
      'Interest: Jersey Club',
    ],
  },

  website:   undefined,
  tiktok:    undefined,
  tiktokCreations: [],

  audience: {
    ageRange:           'TBD',
    locations:           [],
    interests:            ['R&B', 'Jersey Club'],
    behaviors:            [],
    contentPreferences:  [],
  },

  // TODO: add every approved ad, UGC video, dance clip, and music-video
  // cut with a real url (and thumbnail if you have one)
  creativeLibrary: [
    { id: 'mv-official', title: 'Bounce — Official Music Video', type: 'music-video-cut', url: 'https://www.youtube.com/watch?v=FDjdBhXLIeo', thumbnail: 'https://i.ytimg.com/vi/FDjdBhXLIeo/hqdefault.jpg' },
  ],

  insights: [
    {
      date: '2026-09-11',
      text: '"Bounce" is live on YouTube and picking up organic views. Paid YouTube/Google Ads aren\'t running yet — targeting is built around fans of Don Toliver, Brent Faiyaz, Kanii, Jordan Adetunji, and The Weeknd, plus R&B and Jersey Club listeners broadly. This section will fill in with real signals once ads are live.',
    },
  ],
}
