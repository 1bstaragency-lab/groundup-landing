/**
 * Real Knowledge Base YouTube playlist catalog — shared between the
 * desktop LearnSection and the /mvp Home tab so both surfaces always
 * show the same source-of-truth videos.
 *
 * To add a new playlist: drop another entry below. Cover thumbnails
 * use YouTube's hqdefault URL pattern — no asset hosting required.
 */

export interface PlaylistVideo {
  id:           string
  title:        string
  duration?:    string
  description?: string
}

export interface KbPlaylist {
  title:      string
  playlistId: string
  coverImage: string
  videos:     PlaylistVideo[]
}

export const KB_PLAYLISTS: KbPlaylist[] = [
  {
    title:      'Release Strategy',
    playlistId: 'PLtPKxx4Gpa5Qqp0HGUWijH2UBzW6ZDtJT',
    coverImage: 'https://img.youtube.com/vi/7MSplBGZXx4/hqdefault.jpg',
    videos: [
      { id: '7MSplBGZXx4', title: 'Waterfall Release Strategy Tutorial with DistroKid 2024', duration: '12:06',
        description: "A step-by-step walkthrough of the waterfall release strategy using DistroKid — the method of dropping album tracks one at a time over several weeks before the full project release. Each single stays live on all platforms as you go, building streaming momentum and algorithmic exposure across multiple release dates." },
      { id: '3Qsjm-CmNPo', title: 'How To ACTUALLY Do An Album Rollout...', duration: '15:01',
        description: 'A no-fluff breakdown of what a real album rollout looks like from the inside — not theory, but actual execution. The video walks through the three critical phases: pre-release buildup, release week activation, and post-release sustain.' },
    ],
  },
  {
    title:      'Conversations',
    playlistId: 'PLtPKxx4Gpa5T8GV8ywmfBoSC8QZ_BQqTu',
    coverImage: 'https://img.youtube.com/vi/qekbbQ4Zt1M/hqdefault.jpg',
    videos: [
      { id: 'qekbbQ4Zt1M', title: "'Conversations' with BNYX, Riot & Zaytoven", duration: '63:45',
        description: "A landmark roundtable hosted by Julius of Lucid Monday featuring three of hip-hop's most prolific producers — BNYX, Riot, and Zaytoven. The conversation digs into how each producer found their sound, the behind-the-scenes reality of working with top-tier artists, and what it takes to build a lasting legacy." },
      { id: 'v5Ct8rvTGNA', title: 'The Cheat Code | "The Blame Game" | Ep. 99', duration: '20:43',
        description: "Why artists keep falling victim to industry scams and bad business decisions. The episode argues that excuses don't protect you — due diligence does." },
      { id: 'DJjUOOiEg1Y', title: 'The Cheat Code | "Before You Go To Radio" | Ep. 98', duration: '18:21',
        description: 'The hosts lay out what artists need locked in before chasing radio placement. Creating content is a sales tool — every post should have a clear call-to-action directing fans to stream, request, or buy.' },
      { id: 'YbAM9TIKEyc', title: 'The Cheat Code | "Owning Your Image" | Ep. 89', duration: '16:45',
        description: 'A conversation about how public image shapes — and can derail — a music career. Artists who don\'t intentionally own their image leave the narrative in someone else\'s hands.' },
      { id: 'l2zTuMo-bfk', title: 'The Cheat Code | "Let\'s Go On Tour" | Ep. 85', duration: '15:10',
        description: 'Independent touring fundamentals with a focus on college radio as a launchpad. Activating this market before routing a tour can be a serious game-changer.' },
      { id: '9jaMhuEWJQU', title: 'The Cheat Code | "What Are You Willing To Do" | Ep. 86', duration: '12:44',
        description: 'The hosts push artists to get real about the sacrifices required to build a career. The episode challenges artists to question which platforms and strategies actually deserve their energy and time.' },
      { id: 'Vyu7lqInGac', title: 'The Cheat Code | "Growth and Gratitude" | Ep. 83', duration: '16:55',
        description: 'A reflective look at the mentors and early collaborators who shaped the hosts\' careers. The relationships you invest in early become the foundation for long-term growth.' },
      { id: 'bmFfqZZ-akg', title: 'The Cheat Code | "Money Money Money" | Ep. 81', duration: '17:25',
        description: 'The crew gets into the money side of branding — from logos and fonts to merchandise strategy and limited editions. Brand decisions carry real legal and financial weight for independent artists.' },
      { id: 'r_bzWGby0lY', title: 'The Cheat Code | "Work Hard, Win Big" | Ep. 76', duration: '28:47',
        description: 'A wide-ranging conversation about hustle, Black-owned businesses, and what it actually means to build equity in an industry that wasn\'t designed for you.' },
      { id: '6F1v2m1QqWk', title: 'The Cheat Code | "Flawless Execution" | Ep. 79', duration: '22:36',
        description: 'The team discusses delivering a polished, professional product in an era where AI-generated artists are landing major label deals. What flawless execution means when the bar keeps rising.' },
      { id: '0-2lm7tLlog', title: 'The Cheat Code | "Inside The Machine" | Ep. 57', duration: '22:02',
        description: 'A behind-the-scenes breakdown of how the music industry actually operates. Understanding the machine is the only way to make it work in your favor.' },
      { id: 'zPjOG71nRdg', title: 'The Cheat Code | "Post Release Day, What\'s Next?" | Ep. 58', duration: '22:29',
        description: 'Release day is just the beginning. Strategic moves artists need to make in the days and weeks after a drop — from playlist pitching to fan activation and performance analysis.' },
      { id: 'TpcaH3vFKOg', title: 'The Cheat Code | "Can You Really Be Blackballed?" | Ep. 59', duration: '24:17',
        description: 'The myth of being blackballed in the music industry. Most closed doors aren\'t conspiracies, they\'re the result of not having built enough relationships and value.' },
      { id: 'Fb7nbwbwzSc', title: 'The Cheat Code | "Choosing A Distributor" | Ep. 54', duration: '21:17',
        description: 'Evaluating distribution deals and what to look for before committing as an independent artist.' },
      { id: 'taw7RMwETfE', title: 'The Cheat Code | "Marketing Explained" | Ep. 55', duration: '21:46',
        description: 'Why professional marketing isn\'t optional in today\'s climate and how thinking strategically about promotion — not just creating content — separates artists who grow from those who plateau.' },
      { id: 'zWepMQnG4do', title: 'The Cheat Code | "Fake It Til You Make It" | Ep. 48', duration: '23:39',
        description: 'Whether projecting a bigger image than your current reality is a legitimate career strategy or a trap.' },
      { id: 'ACvzJWN2nYY', title: 'The Cheat Code | "How Did I Get Shadow Banned?" | Ep. 50', duration: '22:37',
        description: 'A deep dive into social media shadow banning — what it is, how to know if it\'s happening, and what artist behavior triggers it.' },
    ],
  },
  {
    title:      'The Business',
    playlistId: 'PLtPKxx4Gpa5SpjX-QHyBZeoyuJv7SQa4N',
    coverImage: 'https://img.youtube.com/vi/taw7RMwETfE/hqdefault.jpg',
    videos: [
      { id: 'taw7RMwETfE', title: 'The Cheat Code | "Marketing Explained" | Ep. 55', duration: '21:46',
        description: 'A breakdown of what marketing actually means for independent artists — not just posting content, but building a system that moves people from discovery to action.' },
      { id: 'zPjOG71nRdg', title: 'The Cheat Code | "Post Release Day, What\'s Next?" | Ep. 58', duration: '22:29',
        description: 'Release day is just the beginning. Strategic moves artists need to make in the days and weeks after a drop.' },
    ],
  },
]
