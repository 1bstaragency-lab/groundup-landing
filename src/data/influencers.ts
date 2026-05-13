export type Platform = 'TikTok' | 'Twitter' | 'Spotify' | 'Blog';
export type TikTokTier = 'Mega' | 'Macro' | 'Micro';
export type TwitterCategory = 'Rap Blog' | 'Fashion' | 'Music & News' | 'Meme Page';

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  followers: number;
  tier?: TikTokTier;
  category?: TwitterCategory | string;
  niche: string;
  location: string;
  avgViews?: number;
  engagementRate: number;
}

function fmt(n: number) { return n; }

export const INFLUENCERS: Influencer[] = [
  // ── TikTok Mega (500K+) ────────────────────────────────────────────────────
  { id: 't1',  name: 'TrueSound Daily',     handle: '@truesounddaily',     platform: 'TikTok', tier: 'Mega', followers: fmt(1_100_000), niche: 'Hip-Hop Culture',    location: 'Atlanta, GA',    avgViews: 420000, engagementRate: 8.2 },
  { id: 't2',  name: 'UrbanWave TV',        handle: '@urbanwavetv',        platform: 'TikTok', tier: 'Mega', followers: fmt(987_000),   niche: 'Music Discovery',    location: 'Los Angeles, CA', avgViews: 310000, engagementRate: 7.4 },
  { id: 't3',  name: 'The Beat Report',     handle: '@thebeatreport',      platform: 'TikTok', tier: 'Mega', followers: fmt(823_000),   niche: 'New Music Friday',   location: 'New York, NY',   avgViews: 270000, engagementRate: 6.9 },
  { id: 't4',  name: 'Street Culture HQ',   handle: '@streetculturehq',    platform: 'TikTok', tier: 'Mega', followers: fmt(761_000),   niche: 'Street & Culture',   location: 'Houston, TX',    avgViews: 245000, engagementRate: 9.1 },
  { id: 't5',  name: 'Melody Makers',       handle: '@melodymakers',       platform: 'TikTok', tier: 'Mega', followers: fmt(690_000),   niche: 'R&B & Soul',         location: 'Chicago, IL',    avgViews: 198000, engagementRate: 7.8 },
  { id: 't6',  name: 'Black Music Central', handle: '@blackmusiccentral',  platform: 'TikTok', tier: 'Mega', followers: fmt(645_000),   niche: 'Black Music Culture', location: 'Atlanta, GA',   avgViews: 182000, engagementRate: 11.2 },
  { id: 't7',  name: 'Rap Generation',      handle: '@rapgeneration',      platform: 'TikTok', tier: 'Mega', followers: fmt(598_000),   niche: 'Rap & Drill',        location: 'Detroit, MI',    avgViews: 171000, engagementRate: 8.6 },
  { id: 't8',  name: 'SoundCheck Official', handle: '@soundcheckofficial', platform: 'TikTok', tier: 'Mega', followers: fmt(542_000),   niche: 'Music Reviews',      location: 'Miami, FL',      avgViews: 155000, engagementRate: 6.3 },

  // ── TikTok Macro (50K–500K) ────────────────────────────────────────────────
  { id: 't9',  name: 'Vibes Only Media',    handle: '@vibesonlymedia',     platform: 'TikTok', tier: 'Macro', followers: fmt(478_000), niche: 'Afrobeats',          location: 'London, UK',     avgViews: 132000, engagementRate: 7.1 },
  { id: 't10', name: 'NightOwl Sounds',     handle: '@nightowlsounds',     platform: 'TikTok', tier: 'Macro', followers: fmt(421_000), niche: 'Late-Night R&B',     location: 'Toronto, CA',    avgViews: 118000, engagementRate: 8.4 },
  { id: 't11', name: 'FreestyleFriday',     handle: '@freestylefriday',    platform: 'TikTok', tier: 'Macro', followers: fmt(389_000), niche: 'Freestyle Culture',  location: 'New York, NY',   avgViews: 109000, engagementRate: 9.7 },
  { id: 't12', name: 'TrackOfTheDay',       handle: '@trackoftheday',      platform: 'TikTok', tier: 'Macro', followers: fmt(344_000), niche: 'Music Discovery',    location: 'Austin, TX',     avgViews: 97000,  engagementRate: 6.8 },
  { id: 't13', name: 'HoodRich Culture',    handle: '@hoodrichculture',    platform: 'TikTok', tier: 'Macro', followers: fmt(312_000), niche: 'Urban Culture',      location: 'Atlanta, GA',    avgViews: 88000,  engagementRate: 10.2 },
  { id: 't14', name: 'Curator Khalid',      handle: '@curatorkhalid',      platform: 'TikTok', tier: 'Macro', followers: fmt(287_000), niche: 'R&B Curation',       location: 'Washington, DC', avgViews: 82000,  engagementRate: 7.9 },
  { id: 't15', name: 'Trap Music Daily',    handle: '@trapmusicdaily',     platform: 'TikTok', tier: 'Macro', followers: fmt(256_000), niche: 'Trap & Hip-Hop',     location: 'Atlanta, GA',    avgViews: 74000,  engagementRate: 8.8 },
  { id: 't16', name: 'Wave Checker',        handle: '@wavechecker',        platform: 'TikTok', tier: 'Macro', followers: fmt(223_000), niche: 'Trend Spotting',     location: 'Los Angeles, CA', avgViews: 65000, engagementRate: 7.2 },
  { id: 't17', name: 'Plug Music Blog',     handle: '@plugmusicblog',      platform: 'TikTok', tier: 'Macro', followers: fmt(198_000), niche: 'Underground Hip-Hop', location: 'Chicago, IL',   avgViews: 58000,  engagementRate: 9.4 },
  { id: 't18', name: 'SZN Sounds',          handle: '@sznsounds',          platform: 'TikTok', tier: 'Macro', followers: fmt(176_000), niche: 'Seasonal Playlists', location: 'Phoenix, AZ',    avgViews: 51000,  engagementRate: 6.6 },
  { id: 't19', name: 'NuSoul Network',      handle: '@nusoulnetwork',      platform: 'TikTok', tier: 'Macro', followers: fmt(154_000), niche: 'Neo-Soul & Jazz',    location: 'New Orleans, LA', avgViews: 44000, engagementRate: 8.1 },
  { id: 't20', name: 'Basement Frequencies',handle: '@basementfrequencies',platform: 'TikTok', tier: 'Macro', followers: fmt(132_000), niche: 'Indie Hip-Hop',      location: 'Brooklyn, NY',   avgViews: 39000,  engagementRate: 9.9 },
  { id: 't21', name: 'Drip Music Daily',    handle: '@dripmusicdaily',     platform: 'TikTok', tier: 'Macro', followers: fmt(118_000), niche: 'Fashion & Music',    location: 'Miami, FL',      avgViews: 34000,  engagementRate: 7.5 },
  { id: 't22', name: 'AfroNation Media',    handle: '@afronationmedia',    platform: 'TikTok', tier: 'Macro', followers: fmt(98_000),  niche: 'Afrobeats & Amapiano', location: 'London, UK',   avgViews: 29000,  engagementRate: 11.8 },
  { id: 't23', name: 'Lyricism Lab',        handle: '@lyricismlab',        platform: 'TikTok', tier: 'Macro', followers: fmt(82_000),  niche: 'Lyric Analysis',     location: 'Philadelphia, PA', avgViews: 24000, engagementRate: 8.3 },
  { id: 't24', name: 'Hustle Sounds',       handle: '@hustlesounds',       platform: 'TikTok', tier: 'Macro', followers: fmt(67_000),  niche: 'Motivational Hip-Hop', location: 'Dallas, TX',   avgViews: 19000,  engagementRate: 7.0 },
  { id: 't25', name: 'Frequency Files',     handle: '@frequencyfiles',     platform: 'TikTok', tier: 'Macro', followers: fmt(58_000),  niche: 'Electronic & Beats', location: 'Denver, CO',    avgViews: 16000,  engagementRate: 6.4 },

  // ── TikTok Micro (1K–50K) ─────────────────────────────────────────────────
  { id: 't26', name: 'Raw Talent Blogs',    handle: '@rawtalentblogs',     platform: 'TikTok', tier: 'Micro', followers: fmt(48_000),  niche: 'Emerging Artists',   location: 'Memphis, TN',    avgViews: 14000,  engagementRate: 12.4 },
  { id: 't27', name: 'KeysOnTheGrind',      handle: '@keysonthegrind',     platform: 'TikTok', tier: 'Micro', followers: fmt(41_000),  niche: 'Producer Culture',   location: 'Detroit, MI',    avgViews: 12000,  engagementRate: 10.8 },
  { id: 't28', name: 'Block Party Music',   handle: '@blockpartymusic',    platform: 'TikTok', tier: 'Micro', followers: fmt(36_000),  niche: 'Community Hip-Hop',  location: 'Compton, CA',    avgViews: 10000,  engagementRate: 13.1 },
  { id: 't29', name: 'DJ Set Sessions',     handle: '@djsetsessions',      platform: 'TikTok', tier: 'Micro', followers: fmt(29_000),  niche: 'DJ Culture',         location: 'Las Vegas, NV',  avgViews: 8500,   engagementRate: 9.6 },
  { id: 't30', name: 'Sound Safari',        handle: '@soundsafari',        platform: 'TikTok', tier: 'Micro', followers: fmt(22_000),  niche: 'World Music',        location: 'Seattle, WA',    avgViews: 6400,   engagementRate: 11.3 },
  { id: 't31', name: 'Bars & Melodies',     handle: '@barsandmelodies',    platform: 'TikTok', tier: 'Micro', followers: fmt(17_000),  niche: 'Rap Commentary',     location: 'Baltimore, MD',  avgViews: 5000,   engagementRate: 10.9 },
  { id: 't32', name: 'StudioRatDaily',      handle: '@studioratdaily',     platform: 'TikTok', tier: 'Micro', followers: fmt(13_000),  niche: 'Studio Life',        location: 'Nashville, TN',  avgViews: 3800,   engagementRate: 14.2 },
  { id: 't33', name: 'Unsigned Hype',       handle: '@unsignedhype',       platform: 'TikTok', tier: 'Micro', followers: fmt(9_400),   niche: 'Unsigned Artists',   location: 'Minneapolis, MN', avgViews: 2700,  engagementRate: 15.7 },
  { id: 't34', name: 'VinylHunters',        handle: '@vinylhunters',       platform: 'TikTok', tier: 'Micro', followers: fmt(6_200),   niche: 'Record Culture',     location: 'Portland, OR',   avgViews: 1800,   engagementRate: 12.0 },
  { id: 't35', name: 'MicCheck Mondays',    handle: '@miccheckmondays',    platform: 'TikTok', tier: 'Micro', followers: fmt(3_800),   niche: 'Open Mic Culture',   location: 'Richmond, VA',   avgViews: 1100,   engagementRate: 16.5 },

  // ── Twitter / X (real data, April 2026) ───────────────────────────────────
  { id: 'x1',  name: 'Slvppy',              handle: '@slvppy',             platform: 'Twitter', category: 'Music & News', followers: 685_557, niche: 'Viral Music & Culture',      location: '—', engagementRate: 3.8 },
  { id: 'x2',  name: 'Kurrco',              handle: '@Kurrco',             platform: 'Twitter', category: 'Music & News', followers: 391_162, niche: 'Music Content',              location: '—', engagementRate: 0.1 },
  { id: 'x3',  name: 'The Culture Magazine',handle: '@galactamelanin',     platform: 'Twitter', category: 'Music & News', followers: 288_838, niche: 'Media & Music Outlet',       location: '—', engagementRate: 2.9 },
  { id: 'x4',  name: 'BackenDoc',           handle: '@backendoc',          platform: 'Twitter', category: 'Music & News', followers: 191_769, niche: 'Viral Music & Culture',      location: '—', engagementRate: 4.8 },
  { id: 'x5',  name: 'SlatDontMiss',        handle: '@SlatDontMiss',       platform: 'Twitter', category: 'Music & News', followers: 127_570, niche: 'Music Content',              location: '—', engagementRate: 2.2 },
  { id: 'x6',  name: 'Junior',              handle: '@JrMoneyGetting',     platform: 'Twitter', category: 'Music & News', followers: 92_419,  niche: 'Viral Music & Culture',      location: '—', engagementRate: 7.3 },
  { id: 'x7',  name: 'Underground Champs',  handle: '@ugchamps',           platform: 'Twitter', category: 'Music & News', followers: 57_149,  niche: 'Media & Music Outlet',       location: '—', engagementRate: 2.7 },
  { id: 'x8',  name: 'Zion',                handle: '@gasbabii',           platform: 'Twitter', category: 'Music & News', followers: 26_686,  niche: 'Music Content',              location: '—', engagementRate: 6.6 },
  { id: 'x9',  name: 'Huey',                handle: '@wydhuey',            platform: 'Twitter', category: 'Fashion',      followers: 26_412,  niche: 'Music & Fashion',            location: '—', engagementRate: 11.0 },
  { id: 'x10', name: 'KmaFr',               handle: '@KmaFr_',             platform: 'Twitter', category: 'Music & News', followers: 23_928,  niche: 'Music Photography',          location: '—', engagementRate: 14.5 },
  { id: 'x11', name: 'fentanvl',            handle: '@fentanvl',           platform: 'Twitter', category: 'Music & News', followers: 21_447,  niche: 'Music Content',              location: '—', engagementRate: 2.4 },
  { id: 'x12', name: 'Sam',                 handle: '@samcantmisss',       platform: 'Twitter', category: 'Music & News', followers: 20_474,  niche: 'Music Content',              location: '—', engagementRate: 3.6 },
  { id: 'x13', name: '00Archive',           handle: '@DBL0ARCHIVE',        platform: 'Twitter', category: 'Music & News', followers: 18_937,  niche: 'Snippets & News',            location: '—', engagementRate: 1.5 },
  { id: 'x14', name: 'lifemocksart',        handle: '@lifemocksart',       platform: 'Twitter', category: 'Music & News', followers: 17_087,  niche: 'Music Content',              location: '—', engagementRate: 4.6 },
  { id: 'x15', name: 'Ewan',                handle: '@alwaystalkmusic',    platform: 'Twitter', category: 'Music & News', followers: 13_580,  niche: 'Music Content',              location: '—', engagementRate: 13.6 },
  { id: 'x16', name: 'Hard Music Media',    handle: '@hardmusicmedia',     platform: 'Twitter', category: 'Music & News', followers: 11_185,  niche: 'Media & Music Outlet',       location: '—', engagementRate: 1.2 },
  { id: 'x17', name: 'murakamirug',         handle: '@murakamirug',        platform: 'Twitter', category: 'Music & News', followers: 10_593,  niche: 'Music Content',              location: '—', engagementRate: 3.6 },
  { id: 'x18', name: 'Flexxico',            handle: '@ripflexxico',        platform: 'Twitter', category: 'Music & News', followers: 10_191,  niche: 'Media & Music Outlet',       location: '—', engagementRate: 3.8 },
  { id: 'x19', name: 'Nufseyd',             handle: '@nufseyd',            platform: 'Twitter', category: 'Music & News', followers: 9_630,   niche: 'Music & Comedy',             location: '—', engagementRate: 3.2 },
  { id: 'x20', name: 'Jan',                 handle: '@jansqueezy',         platform: 'Twitter', category: 'Music & News', followers: 8_975,   niche: 'Music Content',              location: '—', engagementRate: 13.2 },
  { id: 'x21', name: 'Jay',                 handle: '@dielikejay',         platform: 'Twitter', category: 'Fashion',      followers: 8_639,   niche: 'Music & Fashion',            location: '—', engagementRate: 22.3 },
  { id: 'x22', name: 'Kayswan',             handle: '@kayswan_',           platform: 'Twitter', category: 'Music & News', followers: 8_607,   niche: 'Music Content',              location: '—', engagementRate: 2.5 },
  { id: 'x23', name: 'Snippet Gallery',     handle: '@snippetgallery',     platform: 'Twitter', category: 'Music & News', followers: 7_325,   niche: 'Music Snippets',             location: '—', engagementRate: 3.4 },
  { id: 'x24', name: 'Troy',                handle: '@shotupin4k',         platform: 'Twitter', category: 'Fashion',      followers: 6_803,   niche: 'Music & Fashion',            location: '—', engagementRate: 1.9 },
  { id: 'x25', name: 'Rainwontmiss',        handle: '@Rainwontmiss',       platform: 'Twitter', category: 'Music & News', followers: 4_536,   niche: 'Viral Clips',                location: '—', engagementRate: 48.8 },
  { id: 'x26', name: 'Li Stan',             handle: '@stanclickin5',       platform: 'Twitter', category: 'Music & News', followers: 4_536,   niche: 'Music Content',              location: '—', engagementRate: 2.7 },
  { id: 'x27', name: 'Nat',                 handle: '@cuhslatt',           platform: 'Twitter', category: 'Rap Blog',     followers: 4_136,   niche: 'Underground Music Opinion',  location: '—', engagementRate: 2.8 },
  { id: 'x28', name: 'Plutoxos',            handle: '@plutoxos',           platform: 'Twitter', category: 'Rap Blog',     followers: 3_786,   niche: 'Music Archive',              location: '—', engagementRate: 2.0 },
  { id: 'x29', name: 'Knottedpockets',      handle: '@knottedpockets',     platform: 'Twitter', category: 'Music & News', followers: 3_662,   niche: 'Music Content',              location: '—', engagementRate: 1.7 },
  { id: 'x30', name: 'Mid West Wock',       handle: '@mid_west_wock',      platform: 'Twitter', category: 'Music & News', followers: 2_888,   niche: 'Music Content',              location: '—', engagementRate: 1.6 },
  { id: 'x31', name: 'Xan',                 handle: '@bam4dpoy',           platform: 'Twitter', category: 'Music & News', followers: 2_571,   niche: 'Music Content',              location: '—', engagementRate: 7.5 },
  { id: 'x32', name: 'Zaybean',             handle: '@zaybeann',           platform: 'Twitter', category: 'Fashion',      followers: 2_301,   niche: 'Music & Fashion',            location: '—', engagementRate: 7.5 },
  { id: 'x33', name: 'Outfits That Go Hard',handle: '@fitsgohard',         platform: 'Twitter', category: 'Fashion',      followers: 997,     niche: 'Fashion',                    location: '—', engagementRate: 1.6 },

  // ── Spotify Curators ───────────────────────────────────────────────────────
  { id: 's1',  name: 'GrooveBox Playlists', handle: '@grooveboxplaylists', platform: 'Spotify', followers: fmt(142_000), niche: 'R&B & Soul Curation',  location: 'New York, NY',    engagementRate: 6.1 },
  { id: 's2',  name: 'Rap Cave Official',   handle: '@rapcaveofficial',    platform: 'Spotify', followers: fmt(118_000), niche: 'Hip-Hop Curation',     location: 'Atlanta, GA',     engagementRate: 7.2 },
  { id: 's3',  name: 'Afrobeats Global',    handle: '@afrobeatsglobal',    platform: 'Spotify', followers: fmt(98_000),  niche: 'Afrobeats Curation',   location: 'London, UK',      engagementRate: 8.4 },
  { id: 's4',  name: 'Trap Anthems',        handle: '@trapanthems',        platform: 'Spotify', followers: fmt(87_000),  niche: 'Trap & Drill',         location: 'Atlanta, GA',     engagementRate: 6.8 },
  { id: 's5',  name: 'New Wave Discoveries',handle: '@newwavemusic',       platform: 'Spotify', followers: fmt(76_000),  niche: 'Emerging Artists',     location: 'Los Angeles, CA', engagementRate: 9.1 },
  { id: 's6',  name: 'Late Night Vibes',    handle: '@latenightvibes',     platform: 'Spotify', followers: fmt(64_000),  niche: 'Mood Playlists',       location: 'Miami, FL',       engagementRate: 7.5 },
  { id: 's7',  name: 'Producer Toolkit',    handle: '@producertoolkit',    platform: 'Spotify', followers: fmt(53_000),  niche: 'Instrumental & Beats', location: 'Detroit, MI',     engagementRate: 5.9 },
  { id: 's8',  name: 'SoundCloud Refugees', handle: '@screfugees',         platform: 'Spotify', followers: fmt(44_000),  niche: 'Underground Rap',      location: 'Chicago, IL',     engagementRate: 11.2 },
  { id: 's9',  name: 'Gym Rap Nation',      handle: '@gymrapnation',       platform: 'Spotify', followers: fmt(38_000),  niche: 'High Energy Rap',      location: 'Houston, TX',     engagementRate: 8.8 },
  { id: 's10', name: 'Sunday Soul Hour',    handle: '@sundaysoulhour',     platform: 'Spotify', followers: fmt(29_000),  niche: 'Gospel & Neo-Soul',    location: 'Nashville, TN',   engagementRate: 10.4 },
];

// Network stats
export const NETWORK_STATS = {
  total: 620,
  tiktok: 245,
  twitter: 47,
  spotify: 28,
  totalReach: '42.5M',
  topFollowers: 1_100_000,
};
