import type { ArtistRosterEntry } from './types'

/**
 * Hotlinked artist photo — Spotify's own "This Is [Artist]" auto-generated
 * cover art, fetched by artist ID (same hotlinking approach already used
 * for YouTube thumbnails in src/data/clientDashboards — no files copied,
 * just a direct CDN URL). Verified live (HTTP 200, image/jpeg) per artist
 * before being used here.
 */
function spotifyImage(artistId: string): string {
  return `https://pickasso.spotifycdn.com/image/ab67c0de0000deef/dt/v1/img/thisisv3/${artistId}/en`
}

export const ARTIST_ROSTER: ArtistRosterEntry[] = [
  {
    slug: 'slayr',
    name: 'slayr',
    image: spotifyImage('0SL3lfuoRP67mrvkdnwIMA'),
    genre: 'Hip-Hop / Melodic Rap',
    tier: 'Growth',
    campaign: { budgetSpent: 1450, startDate: '2026-08-15', endDate: '2026-10-10' },
    before: { monthlyListeners: 14_200, instagramFollowers: 6_800, tiktokFollowers: 11_300, spotifyFollowers: 3_900 },
    after:  { monthlyListeners: 29_600, instagramFollowers: 9_950, tiktokFollowers: 21_800, spotifyFollowers: 8_100 },
    songs: [
      {
        id: 'nightcrawler', title: 'Nightcrawler', releaseDate: '2026-08-22',
        data: {
          tiktok: { videosCreated: 412, views: 2_840_000 },
          spotify: { streams: 184_000 },
          twitter: { mentions: 310, impressions: 96_000 },
          pr: [{ outlet: 'Underground Current', headline: '"Nightcrawler" is the rage cut this scene needed' }],
        },
      },
      {
        id: 'glass-jaw', title: 'Glass Jaw', releaseDate: '2026-09-19',
        data: {
          tiktok: { videosCreated: 268, views: 1_610_000 },
          spotify: { streams: 97_500 },
          twitter: { mentions: 180, impressions: 54_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'sixbill',
    name: 'sixbill',
    image: spotifyImage('56MdwFrWGvYtq9wGACLZCK'),
    genre: 'Rage Rap / Experimental',
    tier: 'Pro',
    campaign: { budgetSpent: 520, startDate: '2026-09-01', endDate: '2026-10-06' },
    before: { monthlyListeners: 5_100, instagramFollowers: 2_300, tiktokFollowers: 4_600, spotifyFollowers: 1_400 },
    after:  { monthlyListeners: 9_800, instagramFollowers: 3_150, tiktokFollowers: 7_900, spotifyFollowers: 2_650 },
    songs: [
      {
        id: 'low-beam', title: 'Low Beam', releaseDate: '2026-09-05',
        data: {
          tiktok: { videosCreated: 94, views: 420_000 },
          spotify: { streams: 38_200 },
          twitter: { mentions: 62, impressions: 18_400 },
          pr: [],
        },
      },
      {
        id: 'corner-store', title: 'Corner Store', releaseDate: '2026-09-27',
        data: {
          tiktok: { videosCreated: 71, views: 305_000 },
          spotify: { streams: 26_900 },
          twitter: { mentions: 44, impressions: 11_200 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'bleood',
    name: 'bleood',
    image: spotifyImage('41GfvEtCZu3KXaThpF01c1'),
    genre: 'Rage Rap',
    tier: 'Growth',
    campaign: { budgetSpent: 1890, startDate: '2026-07-20', endDate: '2026-09-28' },
    before: { monthlyListeners: 21_000, instagramFollowers: 9_200, tiktokFollowers: 18_400, spotifyFollowers: 5_600 },
    after:  { monthlyListeners: 46_300, instagramFollowers: 15_100, tiktokFollowers: 38_700, spotifyFollowers: 12_950 },
    songs: [
      {
        id: 'static-halo', title: 'Static Halo', releaseDate: '2026-07-28',
        data: {
          tiktok: { videosCreated: 588, views: 4_120_000 },
          spotify: { streams: 266_000 },
          twitter: { mentions: 410, impressions: 142_000 },
          pr: [
            { outlet: 'Rotation Weekly', headline: 'bleood fuses hyperpop chaos with rage drums on "Static Halo"' },
            { outlet: 'The Lowend Blog', headline: "Why bleood's next tape could break the scene wide open" },
          ],
        },
      },
      {
        id: 'cracked-visor', title: 'Cracked Visor', releaseDate: '2026-09-02',
        data: {
          tiktok: { videosCreated: 340, views: 2_280_000 },
          spotify: { streams: 151_000 },
          twitter: { mentions: 225, impressions: 78_500 },
          pr: [{ outlet: 'Night Mode Mag', headline: '"Cracked Visor" is 90 seconds of pure distortion' }],
        },
      },
    ],
  },
  {
    slug: 'rexv2',
    name: 'rexv2',
    image: spotifyImage('1zYtGI84oTXVPEuT39M1IC'),
    genre: 'Houston Rap',
    tier: 'Pro',
    campaign: { budgetSpent: 640, startDate: '2026-08-25', endDate: '2026-10-06' },
    before: { monthlyListeners: 7_400, instagramFollowers: 3_100, tiktokFollowers: 6_200, spotifyFollowers: 1_900 },
    after:  { monthlyListeners: 13_900, instagramFollowers: 4_450, tiktokFollowers: 10_800, spotifyFollowers: 3_600 },
    songs: [
      {
        id: 'v2-protocol', title: 'V2 Protocol', releaseDate: '2026-08-29',
        data: {
          tiktok: { videosCreated: 122, views: 680_000 },
          spotify: { streams: 54_000 },
          twitter: { mentions: 88, impressions: 24_600 },
          pr: [],
        },
      },
      {
        id: 'ghost-in-the-loop', title: 'Ghost in the Loop', releaseDate: '2026-09-24',
        data: {
          tiktok: { videosCreated: 96, views: 510_000 },
          spotify: { streams: 41_300 },
          twitter: { mentions: 63, impressions: 17_900 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'hawsa',
    name: 'Hawsa',
    image: spotifyImage('1TEhTEzkV3xXcAosSe5l0W'),
    genre: 'Hip-Hop',
    tier: 'Growth',
    campaign: { budgetSpent: 2100, startDate: '2026-08-01', endDate: '2026-10-03' },
    before: { monthlyListeners: 18_600, instagramFollowers: 7_900, tiktokFollowers: 15_200, spotifyFollowers: 4_800 },
    after:  { monthlyListeners: 41_200, instagramFollowers: 13_600, tiktokFollowers: 31_500, spotifyFollowers: 10_400 },
    songs: [
      {
        id: 'concrete-bloom', title: 'Concrete Bloom', releaseDate: '2026-08-09',
        data: {
          tiktok: { videosCreated: 501, views: 3_640_000 },
          spotify: { streams: 238_000 },
          twitter: { mentions: 356, impressions: 118_000 },
          pr: [{ outlet: 'Underground Current', headline: 'Hawsa turns the block into a battlefield on "Concrete Bloom"' }],
        },
      },
      {
        id: 'no-ceiling', title: 'No Ceiling', releaseDate: '2026-09-13',
        data: {
          tiktok: { videosCreated: 388, views: 2_510_000 },
          spotify: { streams: 177_500 },
          twitter: { mentions: 241, impressions: 81_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: '1oneam',
    name: '1oneam',
    image: spotifyImage('089ASSwOW4Cih3frNuDtUv'),
    genre: 'Plugg / Underground Hip-Hop',
    tier: 'Plant',
    campaign: { budgetSpent: 4800, startDate: '2026-06-15', endDate: '2026-09-21' },
    before: { monthlyListeners: 38_000, instagramFollowers: 16_400, tiktokFollowers: 29_800, spotifyFollowers: 11_200 },
    after:  { monthlyListeners: 102_500, instagramFollowers: 31_900, tiktokFollowers: 68_400, spotifyFollowers: 27_600 },
    songs: [
      {
        id: 'one-am-forever', title: 'One AM Forever', releaseDate: '2026-06-22',
        data: {
          tiktok: { videosCreated: 1_240, views: 9_800_000 },
          spotify: { streams: 612_000 },
          twitter: { mentions: 890, impressions: 310_000 },
          pr: [
            { outlet: 'Rotation Weekly', headline: '1oneam\'s biggest rollout yet is paying off in real time' },
            { outlet: 'Night Mode Mag', headline: 'Inside the campaign behind "One AM Forever"' },
          ],
        },
      },
      {
        id: 'dead-signal', title: 'Dead Signal', releaseDate: '2026-08-03',
        data: {
          tiktok: { videosCreated: 905, views: 6_750_000 },
          spotify: { streams: 418_000 },
          twitter: { mentions: 602, impressions: 204_000 },
          pr: [{ outlet: 'The Lowend Blog', headline: '"Dead Signal" cements 1oneam as a scene headliner' }],
        },
      },
      {
        id: 'static-city', title: 'Static City', releaseDate: '2026-09-10',
        data: {
          tiktok: { videosCreated: 611, views: 4_380_000 },
          spotify: { streams: 289_000 },
          twitter: { mentions: 388, impressions: 141_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'finessekid',
    name: 'FinesseKid',
    image: spotifyImage('3V0BdWlUGoiNckM4Ivt8HL'),
    genre: 'UK Rap',
    tier: 'Pro',
    campaign: { budgetSpent: 480, startDate: '2026-09-10', endDate: '2026-10-15' },
    before: { monthlyListeners: 4_300, instagramFollowers: 1_950, tiktokFollowers: 3_800, spotifyFollowers: 1_050 },
    after:  { monthlyListeners: 7_600, instagramFollowers: 2_640, tiktokFollowers: 6_100, spotifyFollowers: 1_980 },
    songs: [
      {
        id: 'finesse-me', title: 'Finesse Me', releaseDate: '2026-09-14',
        data: {
          tiktok: { videosCreated: 58, views: 268_000 },
          spotify: { streams: 21_400 },
          twitter: { mentions: 34, impressions: 9_600 },
          pr: [],
        },
      },
      {
        id: 'soft-life', title: 'Soft Life', releaseDate: '2026-10-05',
        data: {
          tiktok: { videosCreated: 47, views: 198_000 },
          spotify: { streams: 16_800 },
          twitter: { mentions: 26, impressions: 7_100 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'nine-vicious',
    name: 'Nine Vicious',
    image: spotifyImage('6Rs7Ufqb4h0FTuVg6wlqOy'),
    genre: 'Trap / Rage / Cloud Rap',
    tier: 'Growth',
    campaign: { budgetSpent: 1725, startDate: '2026-08-10', endDate: '2026-10-05' },
    before: { monthlyListeners: 16_800, instagramFollowers: 7_100, tiktokFollowers: 13_900, spotifyFollowers: 4_200 },
    after:  { monthlyListeners: 35_400, instagramFollowers: 11_800, tiktokFollowers: 27_600, spotifyFollowers: 9_300 },
    songs: [
      {
        id: 'coffin-dance', title: 'Coffin Dance', releaseDate: '2026-08-17',
        data: {
          tiktok: { videosCreated: 466, views: 3_210_000 },
          spotify: { streams: 203_000 },
          twitter: { mentions: 298, impressions: 102_000 },
          pr: [{ outlet: 'Night Mode Mag', headline: 'Nine Vicious turns dread into a dancefloor anthem' }],
        },
      },
      {
        id: 'nine-lives', title: 'Nine Lives', releaseDate: '2026-09-21',
        data: {
          tiktok: { videosCreated: 312, views: 2_040_000 },
          spotify: { streams: 142_500 },
          twitter: { mentions: 196, impressions: 64_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'iyrus',
    name: 'iyrus',
    image: spotifyImage('0N8nXapCBAIztfpKiKwrCj'),
    genre: 'Trap / Rage Rap',
    tier: 'Pro',
    campaign: { budgetSpent: 590, startDate: '2026-08-20', endDate: '2026-10-01' },
    before: { monthlyListeners: 6_200, instagramFollowers: 2_700, tiktokFollowers: 5_400, spotifyFollowers: 1_600 },
    after:  { monthlyListeners: 11_500, instagramFollowers: 3_850, tiktokFollowers: 9_200, spotifyFollowers: 3_050 },
    songs: [
      {
        id: 'iyrus-interlude', title: 'Iyrus Interlude', releaseDate: '2026-08-24',
        data: {
          tiktok: { videosCreated: 103, views: 560_000 },
          spotify: { streams: 44_800 },
          twitter: { mentions: 71, impressions: 20_300 },
          pr: [],
        },
      },
      {
        id: 'blackout-drive', title: 'Blackout Drive', releaseDate: '2026-09-18',
        data: {
          tiktok: { videosCreated: 84, views: 432_000 },
          spotify: { streams: 35_600 },
          twitter: { mentions: 52, impressions: 14_800 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'bally-baby',
    name: 'Bally Baby',
    image: spotifyImage('7I0vkHapi0O00Yd6BZcl2Z'),
    genre: 'Atlanta Trap',
    tier: 'Plant',
    campaign: { budgetSpent: 5600, startDate: '2026-05-25', endDate: '2026-09-13' },
    before: { monthlyListeners: 44_000, instagramFollowers: 22_100, tiktokFollowers: 34_600, spotifyFollowers: 13_800 },
    after:  { monthlyListeners: 118_900, instagramFollowers: 41_300, tiktokFollowers: 79_200, spotifyFollowers: 33_400 },
    songs: [
      {
        id: 'trap-house-anthem', title: 'Trap House Anthem', releaseDate: '2026-06-01',
        data: {
          tiktok: { videosCreated: 1_380, views: 11_200_000 },
          spotify: { streams: 704_000 },
          twitter: { mentions: 980, impressions: 358_000 },
          pr: [
            { outlet: 'Rotation Weekly', headline: 'Bally Baby\'s rollout is a masterclass in scaling a trap campaign' },
            { outlet: 'Underground Current', headline: '"Trap House Anthem" is already a block favorite' },
          ],
        },
      },
      {
        id: 'no-days-off', title: 'No Days Off', releaseDate: '2026-07-19',
        data: {
          tiktok: { videosCreated: 960, views: 7_640_000 },
          spotify: { streams: 486_000 },
          twitter: { mentions: 712, impressions: 262_000 },
          pr: [{ outlet: 'The Lowend Blog', headline: '"No Days Off" keeps the momentum going for Bally Baby' }],
        },
      },
      {
        id: 'top-of-the-ladder', title: 'Top of the Ladder', releaseDate: '2026-08-28',
        data: {
          tiktok: { videosCreated: 742, views: 5_310_000 },
          spotify: { streams: 338_000 },
          twitter: { mentions: 498, impressions: 176_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'nosaint',
    name: 'Nosaint',
    image: spotifyImage('2kW9S4UitOwTQeVOGEOyMF'),
    genre: 'UK Rap / Trap',
    tier: 'Growth',
    campaign: { budgetSpent: 1980, startDate: '2026-07-28', endDate: '2026-09-29' },
    before: { monthlyListeners: 19_400, instagramFollowers: 8_300, tiktokFollowers: 16_700, spotifyFollowers: 5_100 },
    after:  { monthlyListeners: 43_700, instagramFollowers: 14_200, tiktokFollowers: 34_900, spotifyFollowers: 11_800 },
    songs: [
      {
        id: 'no-saints-here', title: 'No Saints Here', releaseDate: '2026-08-04',
        data: {
          tiktok: { videosCreated: 533, views: 3_980_000 },
          spotify: { streams: 251_000 },
          twitter: { mentions: 372, impressions: 128_000 },
          pr: [{ outlet: 'Night Mode Mag', headline: 'Nosaint confirms there are "No Saints Here"' }],
        },
      },
      {
        id: 'ashtray-confessions', title: 'Ashtray Confessions', releaseDate: '2026-09-08',
        data: {
          tiktok: { videosCreated: 401, views: 2_760_000 },
          spotify: { streams: 184_000 },
          twitter: { mentions: 258, impressions: 89_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'subiibabii',
    name: 'Subiibabii',
    image: spotifyImage('4b2zSLyjiG70vaoFYKuyGk'),
    genre: 'Vamp Jerk',
    tier: 'Pro',
    campaign: { budgetSpent: 560, startDate: '2026-09-02', endDate: '2026-10-14' },
    before: { monthlyListeners: 5_800, instagramFollowers: 2_500, tiktokFollowers: 5_100, spotifyFollowers: 1_500 },
    after:  { monthlyListeners: 10_900, instagramFollowers: 3_600, tiktokFollowers: 8_700, spotifyFollowers: 2_900 },
    songs: [
      {
        id: 'bubblegum-static', title: 'Bubblegum Static', releaseDate: '2026-09-06',
        data: {
          tiktok: { videosCreated: 118, views: 640_000 },
          spotify: { streams: 51_200 },
          twitter: { mentions: 79, impressions: 22_800 },
          pr: [],
        },
      },
      {
        id: 'candy-apocalypse', title: 'Candy Apocalypse', releaseDate: '2026-10-02',
        data: {
          tiktok: { videosCreated: 92, views: 487_000 },
          spotify: { streams: 39_600 },
          twitter: { mentions: 58, impressions: 16_900 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'babybartier',
    name: 'BabyBartier',
    image: spotifyImage('1XNYNLCPH2kILEL73Kp1y9'),
    genre: 'LA Underground Hip-Hop',
    tier: 'Growth',
    campaign: { budgetSpent: 1640, startDate: '2026-08-18', endDate: '2026-10-13' },
    before: { monthlyListeners: 15_600, instagramFollowers: 6_600, tiktokFollowers: 12_800, spotifyFollowers: 3_950 },
    after:  { monthlyListeners: 33_200, instagramFollowers: 11_100, tiktokFollowers: 26_400, spotifyFollowers: 8_650 },
    songs: [
      {
        id: 'cartier-weather', title: 'Cartier Weather', releaseDate: '2026-08-26',
        data: {
          tiktok: { videosCreated: 447, views: 3_050_000 },
          spotify: { streams: 196_000 },
          twitter: { mentions: 284, impressions: 97_500 },
          pr: [{ outlet: 'Underground Current', headline: 'BabyBartier brings the shine back on "Cartier Weather"' }],
        },
      },
      {
        id: 'ice-trays', title: 'Ice Trays', releaseDate: '2026-09-30',
        data: {
          tiktok: { videosCreated: 329, views: 2_120_000 },
          spotify: { streams: 148_000 },
          twitter: { mentions: 203, impressions: 68_400 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'sosocamo',
    name: 'sosocamo',
    image: spotifyImage('6hpztnbgmaneFFGGnEOVjd'),
    genre: 'Southern Rap',
    tier: 'Plant',
    campaign: { budgetSpent: 5200, startDate: '2026-07-05', endDate: '2026-10-25' },
    before: { monthlyListeners: 42_000, instagramFollowers: 19_600, tiktokFollowers: 36_200, spotifyFollowers: 14_100 },
    after:  { monthlyListeners: 114_800, instagramFollowers: 38_200, tiktokFollowers: 76_500, spotifyFollowers: 31_900 },
    songs: [
      {
        id: 'sweet-tea-static', title: 'Sweet Tea Static', releaseDate: '2026-07-13',
        data: {
          tiktok: { videosCreated: 1_190, views: 9_040_000 },
          spotify: { streams: 571_000 },
          twitter: { mentions: 840, impressions: 296_000 },
          pr: [
            { outlet: 'Rotation Weekly', headline: 'sosocamo keeps the Southern rap torch burning on "Sweet Tea Static"' },
            { outlet: 'Underground Current', headline: 'Why "Sweet Tea Static" is the smoothest rollout of the quarter' },
          ],
        },
      },
      {
        id: 'back-porch-money', title: 'Back Porch Money', releaseDate: '2026-09-04',
        data: {
          tiktok: { videosCreated: 870, views: 6_380_000 },
          spotify: { streams: 402_000 },
          twitter: { mentions: 561, impressions: 198_000 },
          pr: [{ outlet: 'The Lowend Blog', headline: '"Back Porch Money" proves sosocamo isn\'t slowing down' }],
        },
      },
    ],
  },
  {
    slug: 'rxk-nephew',
    name: 'RXK Nephew',
    image: 'https://i.scdn.co/image/ab6761610000e5ebd54c60ef91fb3886fd37eef8',
    genre: 'Underground Rap',
    tier: 'Growth',
    campaign: { budgetSpent: 1980, startDate: '2026-07-15', endDate: '2026-09-18' },
    before: { monthlyListeners: 22_500, instagramFollowers: 9_100, tiktokFollowers: 17_800, spotifyFollowers: 5_900 },
    after:  { monthlyListeners: 48_900, instagramFollowers: 15_300, tiktokFollowers: 35_600, spotifyFollowers: 12_400 },
    songs: [
      {
        id: 'static-theory', title: 'Static Theory', releaseDate: '2026-07-23',
        data: {
          tiktok: { videosCreated: 540, views: 3_920_000 },
          spotify: { streams: 247_000 },
          twitter: { mentions: 402, impressions: 134_000 },
          pr: [{ outlet: 'Underground Current', headline: 'RXK Nephew spirals into his best bars yet on "Static Theory"' }],
        },
      },
      {
        id: 'off-the-grid', title: 'Off the Grid', releaseDate: '2026-09-02',
        data: {
          tiktok: { videosCreated: 365, views: 2_310_000 },
          spotify: { streams: 158_000 },
          twitter: { mentions: 251, impressions: 86_000 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'talinwya',
    name: 'Talinwya',
    image: 'https://i.scdn.co/image/ab6761610000e5ebbfdf3505cabe5babf25dc8ae',
    genre: 'Underground Rap',
    tier: 'Pro',
    campaign: { budgetSpent: 540, startDate: '2026-09-05', endDate: '2026-10-17' },
    before: { monthlyListeners: 8_200, instagramFollowers: 3_400, tiktokFollowers: 7_100, spotifyFollowers: 2_050 },
    after:  { monthlyListeners: 15_100, instagramFollowers: 4_850, tiktokFollowers: 12_600, spotifyFollowers: 3_900 },
    songs: [
      {
        id: 'wrightwood-nights', title: 'Wrightwood Nights', releaseDate: '2026-09-09',
        data: {
          tiktok: { videosCreated: 86, views: 410_000 },
          spotify: { streams: 33_600 },
          twitter: { mentions: 57, impressions: 15_900 },
          pr: [],
        },
      },
      {
        id: 'full-ride', title: 'Full Ride', releaseDate: '2026-10-08',
        data: {
          tiktok: { videosCreated: 63, views: 287_000 },
          spotify: { streams: 24_100 },
          twitter: { mentions: 38, impressions: 10_400 },
          pr: [],
        },
      },
    ],
  },
  {
    slug: 'glokk40spaz',
    name: 'Glokk40Spaz',
    image: 'https://i.scdn.co/image/ab6761610000e5eb8a9e99eb3d0dd4c6a5b7209b',
    genre: 'Atlanta Hip-Hop',
    tier: 'Plant',
    campaign: { budgetSpent: 5100, startDate: '2026-06-01', endDate: '2026-09-14' },
    before: { monthlyListeners: 48_000, instagramFollowers: 24_800, tiktokFollowers: 41_200, spotifyFollowers: 16_700 },
    after:  { monthlyListeners: 126_300, instagramFollowers: 44_900, tiktokFollowers: 88_600, spotifyFollowers: 35_800 },
    songs: [
      {
        id: 'decatur-nights', title: 'Decatur Nights', releaseDate: '2026-06-09',
        data: {
          tiktok: { videosCreated: 1_290, views: 10_100_000 },
          spotify: { streams: 638_000 },
          twitter: { mentions: 912, impressions: 322_000 },
          pr: [
            { outlet: 'Rotation Weekly', headline: 'Glokk40Spaz turns up the pressure on "Decatur Nights"' },
            { outlet: 'Night Mode Mag', headline: 'Inside the campaign behind Glokk40Spaz\'s biggest quarter yet' },
          ],
        },
      },
      {
        id: 'no-flinch', title: 'No Flinch', releaseDate: '2026-07-28',
        data: {
          tiktok: { videosCreated: 880, views: 6_940_000 },
          spotify: { streams: 441_000 },
          twitter: { mentions: 603, impressions: 214_000 },
          pr: [{ outlet: 'The Lowend Blog', headline: '"No Flinch" keeps Glokk40Spaz\'s streak alive' }],
        },
      },
      {
        id: 'last-lap', title: 'Last Lap', releaseDate: '2026-09-01',
        data: {
          tiktok: { videosCreated: 601, views: 4_260_000 },
          spotify: { streams: 296_000 },
          twitter: { mentions: 384, impressions: 139_000 },
          pr: [],
        },
      },
    ],
  },
]
