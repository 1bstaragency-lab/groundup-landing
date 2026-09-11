/**
 * Data for /client/staybarii-bounce.
 *
 * Real numbers only from here on. YouTube stats pulled via yt-dlp
 * against the public YouTube page (2026-09-11). Ad placement videos
 * pulled the same way — each is the actual most-recent upload on that
 * artist's official channel as of 2026-09-11, confirmed via yt-dlp
 * against /channel/<id>/videos (not guessed).
 *
 * Fields we don't have real access to (ad views, watch time, avg view
 * duration, shares — need YouTube Analytics API + channel-owner auth;
 * Google Ads spend/impressions/CPV/CPC — needs a connected Ads account;
 * GA4 website stats — needs a connected property) are left `undefined`
 * on purpose, so the dashboard shows an honest "awaiting data" state
 * instead of a guess. See types.ts — every metric field is individually
 * optional for exactly this reason.
 *
 * Campaign history: the artist ran an initial round of ads himself with
 * broad targeting — it spent through views too fast without efficient
 * targeting. 1BSTAR paused it, rebuilt the targeting around specific
 * artist placements (below) instead of broad interest targeting, and
 * relaunched at 12pm on 2026-09-11.
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
  status:      'optimizing',
  lastUpdated: '2026-09-11T20:00:00Z',
  passwordProtected: false,

  videoUrl:       'https://www.youtube.com/watch?v=FDjdBhXLIeo',
  videoThumbnail: 'https://i.ytimg.com/vi/FDjdBhXLIeo/hqdefault.jpg',

  timeline: {
    youtube: {
      startDate: '2026-09-11',
      note: 'Retargeted campaign relaunched at 12pm — the artist\'s earlier self-run ads used targeting too broad to spend efficiently.',
    },
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

  // Real — each artist's actual most-recent upload as of 2026-09-11,
  // pulled via yt-dlp. This is what "placement" targeting means here:
  // the ad is set to run in-stream on these specific videos, not on
  // broad interest categories.
  placements: [
    { artistName: 'Don Toliver',     videoTitle: 'Don Toliver - K9 (feat. SahBabii) [Official Video]', videoUrl: 'https://www.youtube.com/watch?v=l8SlIEh-Je8', thumbnail: 'https://i.ytimg.com/vi/l8SlIEh-Je8/hqdefault.jpg', note: 'Most recent upload — placement target' },
    { artistName: 'Brent Faiyaz',    videoTitle: 'Brent Faiyaz - like it was. [Official Video]',        videoUrl: 'https://www.youtube.com/watch?v=m6r6nbMxcA8', thumbnail: 'https://i.ytimg.com/vi/m6r6nbMxcA8/hqdefault.jpg', note: 'Most recent upload — placement target' },
    { artistName: 'Kanii',           videoTitle: 'kanii - no patience',                                  videoUrl: 'https://www.youtube.com/watch?v=I1_rTwEEYOQ', thumbnail: 'https://i.ytimg.com/vi/I1_rTwEEYOQ/hqdefault.jpg', note: 'Most recent upload — placement target' },
    { artistName: 'Jordan Adetunji', videoTitle: 'Jordan Adetunji - Distraction [Official Video]',       videoUrl: 'https://www.youtube.com/watch?v=sfHoRTG5oCo', thumbnail: 'https://i.ytimg.com/vi/sfHoRTG5oCo/hqdefault.jpg', note: 'Most recent upload — placement target' },
    { artistName: 'The Weeknd',      videoTitle: 'Directed by Takashi Miike',                             videoUrl: 'https://www.youtube.com/watch?v=s1BkQ6ZnCfQ', thumbnail: 'https://i.ytimg.com/vi/s1BkQ6ZnCfQ/hqdefault.jpg', note: 'Most recent upload — placement target' },
  ],

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
      text: 'The artist\'s initial self-run ads used broad interest targeting and burned through views faster than the spend could sustain efficiently. We paused that round, rebuilt targeting around direct placements on new uploads from Don Toliver, Brent Faiyaz, Kanii, Jordan Adetunji, and The Weeknd — plus R&B and Jersey Club interest — and relaunched at 12pm today. This section will fill in with real performance signals as the new campaign runs.',
    },
  ],
}
