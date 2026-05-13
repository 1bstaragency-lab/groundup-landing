export type Platform = 'TikTok' | 'Twitter' | 'Spotify' | 'Blog' | 'YouTube' | 'SoundCloud';
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

  // ── Spotify Playlists (real data) ─────────────────────────────────────────
  { id: 's1',  name: 'Rap Nation',                        handle: '@rapnation',         platform: 'Spotify', followers: 106900, niche: 'Hip-Hop Hits',        location: '—', engagementRate: 4.2 },
  { id: 's2',  name: 'High Energy Rap / Gym Rap Workout', handle: '@robi.robillard',    platform: 'Spotify', followers: 102100, niche: 'High Energy Rap',     location: '—', engagementRate: 5.1 },
  { id: 's3',  name: 'Daily Loud',                        handle: '@thedailyloud',      platform: 'Spotify', followers: 51800,  niche: 'Hip-Hop Hits',        location: '—', engagementRate: 4.8 },
  { id: 's4',  name: 'Best American Rap',                 handle: '@matitokonfident',   platform: 'Spotify', followers: 45900,  niche: 'American Rap',        location: '—', engagementRate: 5.3 },
  { id: 's5',  name: 'Stank Face',                        handle: '@patekdidthat',      platform: 'Spotify', followers: 41600,  niche: 'Underground Rap',     location: '—', engagementRate: 6.1 },
  { id: 's6',  name: 'RapWRLD',                           handle: '@RapLab',            platform: 'Spotify', followers: 33000,  niche: 'Rap World',           location: '—', engagementRate: 5.5 },
  { id: 's7',  name: 'NEW SEASON HITS',                   handle: '@Soidz',             platform: 'Spotify', followers: 32000,  niche: 'Current Hits',        location: '—', engagementRate: 4.9 },
  { id: 's8',  name: 'new rap/hiphop 2025',               handle: '@raplab',            platform: 'Spotify', followers: 30700,  niche: 'New Rap',             location: '—', engagementRate: 5.2 },
  { id: 's9',  name: 'Songs For Night Drives',            handle: '@perfectalbumz',     platform: 'Spotify', followers: 30500,  niche: 'Night Drive Vibes',   location: '—', engagementRate: 6.8 },
  { id: 's10', name: 'WRLD OF RAP',                       handle: '@RapLab',            platform: 'Spotify', followers: 30300,  niche: 'Rap World',           location: '—', engagementRate: 5.0 },
  { id: 's11', name: 'Viral Hip-Hop',                     handle: '@MRNA',              platform: 'Spotify', followers: 29500,  niche: 'Viral Hip-Hop',       location: '—', engagementRate: 5.7 },
  { id: 's12', name: 'mistgate',                          handle: '@Kim',               platform: 'Spotify', followers: 29500,  niche: 'Chill Rap',           location: '—', engagementRate: 5.5 },
  { id: 's13', name: "the rain's whispers",               handle: '@Viena',             platform: 'Spotify', followers: 28600,  niche: 'Mood Playlist',       location: '—', engagementRate: 6.2 },
  { id: 's14', name: 'fye shit',                          handle: '@nikul1ka',          platform: 'Spotify', followers: 26900,  niche: 'Underground Rap',     location: '—', engagementRate: 6.5 },
  { id: 's15', name: 'wake up f1lthy',                    handle: '@slatt.ang3lo',      platform: 'Spotify', followers: 25800,  niche: 'Underground Rap',     location: '—', engagementRate: 6.8 },
  { id: 's16', name: 'Rap Vibes / Hip-Hop',               handle: '@gorilla.bounce',    platform: 'Spotify', followers: 25100,  niche: 'Rap & Hip-Hop',       location: '—', engagementRate: 6.0 },
  { id: 's17', name: 'BEST OF UNDERGROUND',               handle: '@sexchanges',        platform: 'Spotify', followers: 25000,  niche: 'Underground Rap',     location: '—', engagementRate: 6.3 },
  { id: 's18', name: 'NEW JAZZ // NEW WAVE SONGS',        handle: '@whoiswonderyo',     platform: 'Spotify', followers: 22800,  niche: 'Jazz Wave / R&B',     location: '—', engagementRate: 7.1 },
  { id: 's19', name: 'Hardest Rap Songs',                 handle: '@TheyLuvBrands',     platform: 'Spotify', followers: 21400,  niche: 'Hard Rap',            location: '—', engagementRate: 6.4 },
  { id: 's20', name: 'memoria',                           handle: '@chartmob',          platform: 'Spotify', followers: 20800,  niche: 'Ambient Rap',         location: '—', engagementRate: 5.8 },
  { id: 's21', name: 'Ballistic Bass',                    handle: '@Kendallxcel',       platform: 'Spotify', followers: 20400,  niche: 'Bass-Heavy Rap',      location: '—', engagementRate: 6.6 },
  { id: 's22', name: 'TURN IT UP / FLOATING',             handle: '@alexgray',          platform: 'Spotify', followers: 19600,  niche: 'Hype & Vibe',         location: '—', engagementRate: 6.9 },
  { id: 's23', name: 'Playboi Carti — Molly',             handle: '@yxngzaak',          platform: 'Spotify', followers: 17800,  niche: 'Fan Curation',        location: '—', engagementRate: 7.5 },
  { id: 's24', name: 'BruceDropEmOff',                    handle: '@Shiloh12',          platform: 'Spotify', followers: 15700,  niche: 'Fan Curation',        location: '—', engagementRate: 7.2 },
  { id: 's25', name: 'Juice WRLD Unreleased & Leaks',     handle: '@LYXMGMT',           platform: 'Spotify', followers: 15300,  niche: 'Fan Curation',        location: '—', engagementRate: 7.8 },
  { id: 's26', name: 'RAGE RAP',                          handle: '@Curatedmuzik',      platform: 'Spotify', followers: 13700,  niche: 'Rage / Hyperpop',     location: '—', engagementRate: 7.3 },
  { id: 's27', name: 'MIXED RAP PLAYLIST 2026',           handle: '@prodvares',         platform: 'Spotify', followers: 12700,  niche: 'Mixed Rap',           location: '—', engagementRate: 7.0 },
  { id: 's28', name: 'Underground Wave',                  handle: '@Kendallxcel',       platform: 'Spotify', followers: 12300,  niche: 'Underground Rap',     location: '—', engagementRate: 7.4 },
  { id: 's29', name: 'locked in',                         handle: '@andrewwmcgee',      platform: 'Spotify', followers: 11300,  niche: 'Focus Rap',           location: '—', engagementRate: 7.6 },
  { id: 's30', name: 'UNDERGROUND SONGS',                 handle: '@diasisnothing',     platform: 'Spotify', followers: 10600,  niche: 'Underground Rap',     location: '—', engagementRate: 7.9 },
  { id: 's31', name: "New Music Friday — Jah's Picks",    handle: '@jahtalksmusic',     platform: 'Spotify', followers: 9800,   niche: 'New Music Friday',    location: '—', engagementRate: 8.1 },
  { id: 's32', name: 'Joviss',                            handle: '@Joviss',            platform: 'Spotify', followers: 9700,   niche: 'Curation',            location: '—', engagementRate: 7.8 },
  { id: 's33', name: 'EVERYTHING UNDERGROUND',            handle: '@michael.hxl',       platform: 'Spotify', followers: 9500,   niche: 'Underground Rap',     location: '—', engagementRate: 8.3 },
  { id: 's34', name: 'underground rap (5 stars)',          handle: '@CharlieNyqvist',    platform: 'Spotify', followers: 9500,   niche: 'Underground Rap',     location: '—', engagementRate: 8.2 },
  { id: 's35', name: 'Night Rappin',                      handle: '@Kendallxcel',       platform: 'Spotify', followers: 8700,   niche: 'Night Rap',           location: '—', engagementRate: 8.5 },
  { id: 's36', name: 'DRILL JERSEY US 2025',              handle: '@dirtyswift',        platform: 'Spotify', followers: 8200,   niche: 'Jersey Drill',        location: '—', engagementRate: 8.8 },
  { id: 's37', name: 'UNDERGROUND FOREVER',               handle: '@notbadtake',        platform: 'Spotify', followers: 7600,   niche: 'Underground Rap',     location: '—', engagementRate: 9.0 },
  { id: 's38', name: 'Underground rap besssssttt',         handle: '@M_N_Curators',      platform: 'Spotify', followers: 6100,   niche: 'Underground Rap',     location: '—', engagementRate: 9.2 },
  { id: 's39', name: 'Hiphop with taste',                 handle: '@inthemoodforthis',  platform: 'Spotify', followers: 5100,   niche: 'Hip-Hop Curation',    location: '—', engagementRate: 9.5 },
  { id: 's40', name: 'unknown rap bangers',               handle: '@gspotif',           platform: 'Spotify', followers: 5000,   niche: 'Underground Rap',     location: '—', engagementRate: 9.4 },
  { id: 's41', name: 'THE BEST UNDERGROUND RAP OF 2026',  handle: '@HyperpopDaily',     platform: 'Spotify', followers: 4800,   niche: 'Underground Rap',     location: '—', engagementRate: 9.7 },
  { id: 's42', name: 'static club car edits',             handle: '@rxbenn_nn',         platform: 'Spotify', followers: 4400,   niche: 'Vibe Playlist',       location: '—', engagementRate: 9.8 },
  { id: 's43', name: 'Welcome to the Matrix',             handle: '@realorrin',         platform: 'Spotify', followers: 4400,   niche: 'Underground Rap',     location: '—', engagementRate: 9.6 },
  { id: 's44', name: 'UNDERGROUND MUSIC 2025',            handle: '@aisultangm',        platform: 'Spotify', followers: 3700,   niche: 'Underground Rap',     location: '—', engagementRate: 10.1 },
  { id: 's45', name: 'ON ROTATION',                       handle: '@ripmm',             platform: 'Spotify', followers: 3700,   niche: 'Current Rotation',    location: '—', engagementRate: 10.0 },
  { id: 's46', name: 'Nemzzz Unreleased songs 2026',      handle: '@diasisnothing',     platform: 'Spotify', followers: 3300,   niche: 'Fan Curation',        location: '—', engagementRate: 10.3 },
  { id: 's47', name: 'YSF Underground',                   handle: '@ysf_underground',   platform: 'Spotify', followers: 2900,   niche: 'Underground Rap',     location: '—', engagementRate: 10.5 },
  { id: 's48', name: 'soundcloud underground rap',        handle: '@orestrealboy',      platform: 'Spotify', followers: 2600,   niche: 'SoundCloud Wave',     location: '—', engagementRate: 10.8 },
  { id: 's49', name: 'RAP RADAR — TOP 30',                handle: '@NEWAVEDAILY',       platform: 'Spotify', followers: 2600,   niche: 'Rap Radar',           location: '—', engagementRate: 10.6 },
  { id: 's50', name: 'HARDEST UNDERGROUND RAP 2026',      handle: '@LYXMGMT',           platform: 'Spotify', followers: 2100,   niche: 'Underground Rap',     location: '—', engagementRate: 11.2 },
  { id: 's51', name: 'clearwebs playlist',                handle: '@clearwebs',         platform: 'Spotify', followers: 1900,   niche: 'Underground Rap',     location: '—', engagementRate: 11.5 },
  { id: 's52', name: 'FRESHNESS FOR HAPPINESS',           handle: '@tixetixetixe',      platform: 'Spotify', followers: 1400,   niche: 'Fresh Picks',         location: '—', engagementRate: 11.8 },
  { id: 's53', name: 'HYPERTRAP ARCHIVE',                 handle: '@j.rxk',             platform: 'Spotify', followers: 1000,   niche: 'Hyperpop / Trap',     location: '—', engagementRate: 12.2 },
  { id: 's54', name: 'underground rap',                   handle: '@cling',             platform: 'Spotify', followers: 852,    niche: 'Underground Rap',     location: '—', engagementRate: 12.5 },
  { id: 's55', name: 'New Underground (JAMOLV)',           handle: '@Jamolv',            platform: 'Spotify', followers: 805,    niche: 'New Underground',     location: '—', engagementRate: 12.8 },
  { id: 's56', name: 'UNDERGROUND RAP RADIO',             handle: '@mikeygetem_',       platform: 'Spotify', followers: 684,    niche: 'Underground Rap',     location: '—', engagementRate: 13.0 },
  { id: 's57', name: 'dtb',                               handle: '@johanswan',         platform: 'Spotify', followers: 517,    niche: 'Curation',            location: '—', engagementRate: 13.2 },
  { id: 's58', name: '2026 UNDERGROUND RAP',              handle: '@hiddengems',        platform: 'Spotify', followers: 302,    niche: 'Underground Rap',     location: '—', engagementRate: 13.5 },

  // ── Spotify Curator Profiles ───────────────────────────────────────────────
  { id: 'sc1', name: 'BLNDR',              handle: '@theblndr',          platform: 'Spotify', followers: 5000,  niche: 'Label & Tastemaker',   location: '—', engagementRate: 15.0 },
  { id: 'sc2', name: 'Dual Threat Music',  handle: '@dualthreatmusic',   platform: 'Spotify', followers: 3000,  niche: 'Hip-Hop Curation',     location: '—', engagementRate: 14.0 },
  { id: 'sc3', name: 'The Wave Cache',     handle: '@wavecache',         platform: 'Spotify', followers: 2000,  niche: 'Underground Wave',     location: '—', engagementRate: 13.5 },
  { id: 'sc4', name: 'Banger Of The Day',  handle: '@_bangeroftheday',   platform: 'Spotify', followers: 4000,  niche: 'Daily Picks',          location: '—', engagementRate: 14.5 },
  { id: 'sc5', name: 'MMM4',               handle: '@MMM4',              platform: 'Spotify', followers: 1500,  niche: 'Hip-Hop Curation',     location: '—', engagementRate: 12.0 },
  { id: 'sc6', name: 'Stank Face Curator', handle: '@patekdidthat',      platform: 'Spotify', followers: 41600, niche: 'Underground Rap',      location: '—', engagementRate: 6.1 },
  { id: 'sc7', name: 'Nights Like This',   handle: '@NightsLikeThis',    platform: 'Spotify', followers: 8000,  niche: 'Night Vibes',          location: '—', engagementRate: 9.5 },
  { id: 'sc8', name: 'SLIDIN Hip Hop',     handle: '@slidinhiphop',      platform: 'Spotify', followers: 6000,  niche: 'Hip-Hop 2026',         location: '—', engagementRate: 8.8 },
  { id: 'sc9', name: 'underground radio',  handle: '@undergroundradio',  platform: 'Spotify', followers: 3500,  niche: 'Underground Radio',    location: '—', engagementRate: 11.0 },

  // ── YouTube ────────────────────────────────────────────────────────────────
  { id: 'yt1', name: 'Rokk',          handle: '@Rok882',        platform: 'YouTube', followers: 50000, niche: 'Hip-Hop Reviews',     location: '—', engagementRate: 6.5 },
  { id: 'yt2', name: 'Dutie',         handle: '@dutie',         platform: 'YouTube', followers: 40000, niche: 'Hip-Hop News',        location: '—', engagementRate: 5.8 },
  { id: 'yt3', name: 'SirJayvon',     handle: '@OMGJayvon',     platform: 'YouTube', followers: 35000, niche: 'Hip-Hop Analysis',    location: '—', engagementRate: 7.2 },
  { id: 'yt4', name: 'kayua',         handle: '@KAAYUA',        platform: 'YouTube', followers: 25000, niche: 'Artist Stories',      location: '—', engagementRate: 8.1 },
  { id: 'yt5', name: 'siahxo',        handle: '@siahniga',      platform: 'YouTube', followers: 15000, niche: 'Hip-Hop Content',     location: '—', engagementRate: 6.9 },
  { id: 'yt6', name: 'tajs',          handle: '@1tajs',         platform: 'YouTube', followers: 10000, niche: 'Hip-Hop Commentary',  location: '—', engagementRate: 7.5 },
  { id: 'yt7', name: 'Funny Digital', handle: '@Funnydigita1',  platform: 'YouTube', followers: 8000,  niche: 'Celebrity Comps',     location: '—', engagementRate: 9.2 },
  { id: 'yt8', name: 'saucekill',     handle: '@saucekill',     platform: 'YouTube', followers: 5000,  niche: 'Underground Hip-Hop', location: '—', engagementRate: 10.1 },

  // ── SoundCloud ─────────────────────────────────────────────────────────────
  { id: 'snd1',  name: 'fentanvl',           handle: '@imsofornothing',    platform: 'SoundCloud', followers: 8000,  niche: 'Underground Rap',   location: '—', engagementRate: 11.0 },
  { id: 'snd2',  name: 'Slump Audios Radio', handle: '@slumpaudiosradio',  platform: 'SoundCloud', followers: 12000, niche: 'Underground Radio', location: '—', engagementRate: 9.5 },
  { id: 'snd3',  name: 'hafaae',             handle: '@hafaae',            platform: 'SoundCloud', followers: 6000,  niche: 'DJ Sets',           location: '—', engagementRate: 10.2 },
  { id: 'snd4',  name: 'djslimebxll',        handle: '@djslimebxll',       platform: 'SoundCloud', followers: 5000,  niche: 'DJ Mixes',          location: '—', engagementRate: 10.8 },
  { id: 'snd5',  name: 'december',           handle: '@decemberhorror',    platform: 'SoundCloud', followers: 4500,  niche: 'Curation',          location: '—', engagementRate: 11.2 },
  { id: 'snd6',  name: 'DJ BANNED',          handle: '@djbannedexclusive', platform: 'SoundCloud', followers: 4000,  niche: 'DJ Mixes',          location: '—', engagementRate: 10.5 },
  { id: 'snd7',  name: 'samcantmisss',       handle: '@samcantmisss',      platform: 'SoundCloud', followers: 3500,  niche: 'Underground Rap',   location: '—', engagementRate: 11.8 },
  { id: 'snd8',  name: 'packrunnervice',     handle: '@packrunnervice',    platform: 'SoundCloud', followers: 3000,  niche: 'DJ Mixes',          location: '—', engagementRate: 10.0 },
  { id: 'snd9',  name: 'xkiss',              handle: '@xkiss',             platform: 'SoundCloud', followers: 2500,  niche: 'Curation',          location: '—', engagementRate: 12.0 },
  { id: 'snd10', name: 'grails',             handle: '@grails',            platform: 'SoundCloud', followers: 2000,  niche: 'Underground Rap',   location: '—', engagementRate: 12.5 },
  { id: 'snd11', name: 'cash chris',         handle: '@cashchris',         platform: 'SoundCloud', followers: 1500,  niche: 'Curation',          location: '—', engagementRate: 11.5 },
  { id: 'snd12', name: 'unnamed curator',    handle: '@scuser',            platform: 'SoundCloud', followers: 1000,  niche: 'Underground Rap',   location: '—', engagementRate: 10.0 },
];

// Network stats
export const NETWORK_STATS = {
  total: 620,
  tiktok: 245,
  twitter: 33,
  spotify: 71,
  youtube: 8,
  soundcloud: 12,
  totalReach: '42.5M',
  topFollowers: 1_100_000,
};
