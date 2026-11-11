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
    campaign: { budgetSpent: 3770, startDate: '2026-08-15', endDate: '2026-10-10' },
    before: { monthlyListeners: 736_842, instagramFollowers: 162_105, tiktokFollowers: 280_000, spotifyFollowers: 110_526 },
    after:  { monthlyListeners: 1_400_000, instagramFollowers: 308_000, tiktokFollowers: 532_000, spotifyFollowers: 210_000 },
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
    campaign: { budgetSpent: 1090, startDate: '2026-09-01', endDate: '2026-10-06' },
    before: { monthlyListeners: 223_548, instagramFollowers: 62_593, tiktokFollowers: 100_597, spotifyFollowers: 40_239 },
    after:  { monthlyListeners: 346_500, instagramFollowers: 97_020, tiktokFollowers: 155_925, spotifyFollowers: 62_370 },
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
    campaign: { budgetSpent: 5290, startDate: '2026-07-20', endDate: '2026-09-28' },
    before: { monthlyListeners: 259_500, instagramFollowers: 51_900, tiktokFollowers: 108_990, spotifyFollowers: 36_330 },
    after:  { monthlyListeners: 519_000, instagramFollowers: 103_800, tiktokFollowers: 217_980, spotifyFollowers: 72_660 },
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
    campaign: { budgetSpent: 1470, startDate: '2026-08-25', endDate: '2026-10-06' },
    before: { monthlyListeners: 215_034, instagramFollowers: 53_758, tiktokFollowers: 75_262, spotifyFollowers: 36_556 },
    after:  { monthlyListeners: 311_800, instagramFollowers: 77_950, tiktokFollowers: 109_130, spotifyFollowers: 53_006 },
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
    campaign: { budgetSpent: 6090, startDate: '2026-08-01', endDate: '2026-10-03' },
    before: { monthlyListeners: 64_000, instagramFollowers: 19_200, tiktokFollowers: 25_600, spotifyFollowers: 12_800 },
    after:  { monthlyListeners: 118_400, instagramFollowers: 35_520, tiktokFollowers: 47_360, spotifyFollowers: 23_680 },
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
    campaign: { budgetSpent: 17280, startDate: '2026-06-15', endDate: '2026-09-21' },
    before: { monthlyListeners: 148_208, instagramFollowers: 26_677, tiktokFollowers: 74_104, spotifyFollowers: 19_267 },
    after:  { monthlyListeners: 355_700, instagramFollowers: 64_026, tiktokFollowers: 177_850, spotifyFollowers: 46_241 },
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
    campaign: { budgetSpent: 960, startDate: '2026-09-10', endDate: '2026-10-15' },
    before: { monthlyListeners: 351_667, instagramFollowers: 84_400, tiktokFollowers: 116_050, spotifyFollowers: 56_267 },
    after:  { monthlyListeners: 527_500, instagramFollowers: 126_600, tiktokFollowers: 174_075, spotifyFollowers: 84_400 },
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
    campaign: { budgetSpent: 5180, startDate: '2026-08-10', endDate: '2026-10-05' },
    before: { monthlyListeners: 571_429, instagramFollowers: 91_429, tiktokFollowers: 274_286, spotifyFollowers: 68_571 },
    after:  { monthlyListeners: 1_200_000, instagramFollowers: 192_000, tiktokFollowers: 576_000, spotifyFollowers: 144_000 },
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
    campaign: { budgetSpent: 1420, startDate: '2026-08-20', endDate: '2026-10-01' },
    before: { monthlyListeners: 253_375, instagramFollowers: 65_878, tiktokFollowers: 93_749, spotifyFollowers: 43_074 },
    after:  { monthlyListeners: 405_400, instagramFollowers: 105_404, tiktokFollowers: 149_998, spotifyFollowers: 68_918 },
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
    campaign: { budgetSpent: 21280, startDate: '2026-05-25', endDate: '2026-09-13' },
    before: { monthlyListeners: 144_346, instagramFollowers: 31_756, tiktokFollowers: 79_390, spotifyFollowers: 21_652 },
    after:  { monthlyListeners: 375_300, instagramFollowers: 82_566, tiktokFollowers: 206_415, spotifyFollowers: 56_295 },
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
    campaign: { budgetSpent: 6140, startDate: '2026-07-28', endDate: '2026-09-29' },
    before: { monthlyListeners: 19_487, instagramFollowers: 6_236, tiktokFollowers: 7_795, spotifyFollowers: 4_092 },
    after:  { monthlyListeners: 38_000, instagramFollowers: 12_160, tiktokFollowers: 15_200, spotifyFollowers: 7_980 },
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
    campaign: { budgetSpent: 1230, startDate: '2026-09-02', endDate: '2026-10-14' },
    before: { monthlyListeners: 300_467, instagramFollowers: 81_126, tiktokFollowers: 138_215, spotifyFollowers: 54_084 },
    after:  { monthlyListeners: 450_700, instagramFollowers: 121_689, tiktokFollowers: 207_322, spotifyFollowers: 81_126 },
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
    campaign: { budgetSpent: 4430, startDate: '2026-08-18', endDate: '2026-10-13' },
    before: { monthlyListeners: 47_568, instagramFollowers: 13_795, tiktokFollowers: 18_552, spotifyFollowers: 9_038 },
    after:  { monthlyListeners: 88_000, instagramFollowers: 25_520, tiktokFollowers: 34_320, spotifyFollowers: 16_720 },
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
    campaign: { budgetSpent: 20280, startDate: '2026-07-05', endDate: '2026-10-25' },
    before: { monthlyListeners: 1_160_000, instagramFollowers: 197_200, tiktokFollowers: 510_400, spotifyFollowers: 139_200 },
    after:  { monthlyListeners: 2_900_000, instagramFollowers: 493_000, tiktokFollowers: 1_276_000, spotifyFollowers: 348_000 },
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
    campaign: { budgetSpent: 5740, startDate: '2026-07-15', endDate: '2026-09-18' },
    before: { monthlyListeners: 84_872, instagramFollowers: 26_310, tiktokFollowers: 30_554, spotifyFollowers: 16_974 },
    after:  { monthlyListeners: 165_500, instagramFollowers: 51_305, tiktokFollowers: 59_580, spotifyFollowers: 33_100 },
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
    campaign: { budgetSpent: 1350, startDate: '2026-09-05', endDate: '2026-10-17' },
    before: { monthlyListeners: 24_500, instagramFollowers: 8_085, tiktokFollowers: 10_290, spotifyFollowers: 5_390 },
    after:  { monthlyListeners: 39_200, instagramFollowers: 12_936, tiktokFollowers: 16_464, spotifyFollowers: 8_624 },
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
    campaign: { budgetSpent: 18870, startDate: '2026-06-01', endDate: '2026-09-14' },
    before: { monthlyListeners: 782_609, instagramFollowers: 148_696, tiktokFollowers: 367_826, spotifyFollowers: 101_739 },
    after:  { monthlyListeners: 1_800_000, instagramFollowers: 342_000, tiktokFollowers: 846_000, spotifyFollowers: 234_000 },
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
