"use client"

import { useState, useRef, useEffect } from "react" // useRef/useEffect used by TTS
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, Pause, Square, X, BookOpen, TrendingUp, Music2,
  Truck, Megaphone, Globe, ChevronRight, Volume2, Loader2,
  FileText, Clock, ExternalLink, Newspaper, Lock,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ArticleCard } from "../ui/article-card"
import { usePlan } from "../../hooks/usePlan"
import { useAuth } from "../../hooks/useAuth"
import { openCheckout } from "../../lib/pricingCheckout"

// ─── PDF Library ──────────────────────────────────────────────────────────────

interface PdfGuide {
  id: string
  title: string
  description: string
  readTime: string
  category: string
  pages: number
  content: string // text read aloud
  pdfUrl?: string // plug in real URL later
}

const PDF_LIBRARY: PdfGuide[] = [
  // TikTok Growth
  {
    id: 'tt1', category: 'TikTok Growth', title: 'TikTok Algorithm Decoded 2024',
    description: 'How the ForYouPage works, what signals matter, and how to hack your way onto new feeds.',
    readTime: '12 min', pages: 18,
    content: `Welcome to TikTok Algorithm Decoded 2024. The TikTok algorithm is the most powerful music discovery engine ever built. Unlike Spotify or YouTube, TikTok serves content based purely on engagement signals, not follower count. That means any artist can go viral on their first video. Here's how it works. The algorithm scores every video within the first 30 minutes of posting based on three primary signals: completion rate, which is the percentage of viewers who watch the full video. Re-watch rate, which is how many people watch it more than once. And share rate, which measures how many people send it to someone else. If your video passes the first tier threshold, which is usually around 10 to 15 percent completion rate among a small test audience of about 500 people, it gets pushed to a larger group of 5,000, then 50,000, then 500,000, and so on exponentially. For musicians, the most important insight is this: the first three seconds of your video determine everything. If viewers swipe away immediately, your video dies. If they stay, the algorithm rewards you. The best hooks for music content include starting mid-performance, starting with a reaction or controversy, or opening with a visual that creates curiosity. Sound strategy is also critical. Using original audio from your own release trains TikTok to associate your sound with your profile. When you post multiple videos using the same original audio, TikTok creates a feedback loop that amplifies all content using that sound. Aim to post 3 to 5 times per week using your release audio for at least 3 weeks around a drop date.`,
    pdfUrl: undefined,
  },
  {
    id: 'tt2', category: 'TikTok Growth', title: 'Hook Writing for Short-Form',
    description: 'The psychology of the first 3 seconds — how to stop the scroll and keep viewers watching.',
    readTime: '8 min', pages: 11,
    content: `Hook Writing for Short-Form Content. The scroll is your enemy. Every person watching TikTok has their thumb hovering, ready to move on in 0.3 seconds if you don't stop them. Your job in the first three seconds is singular: create an open loop in the viewer's brain that they can't close without finishing your video. There are six hook frameworks that consistently outperform everything else in music content. First, the Visual Contrast Hook. Show something unexpected. A bedroom producer holding a Grammy. A homeless-looking person playing a $20,000 guitar. Visual dissonance creates instant curiosity. Second, the Question Hook. "You've never heard a voice like this." "This beat took me 4 days." Questions prime the brain to seek answers. Third, the Reaction Hook. Open with your own genuine emotional reaction to something. "I wasn't supposed to release this." Authenticity signals cut through polished content. Fourth, the Lyric Drop Hook. Start with your hardest bar or most emotional lyric. No intro, no countdown, straight to the moment. Fifth, the Process Revelation. "How I made a number one song in my bedroom." People love seeing behind the curtain. Sixth, the Stakes Hook. "This is the last song I'll ever make." Urgency creates completion. For musicians, test all six hook types across your next six posts. Track completion rate and use only the formats that hit above 25 percent.`,
    pdfUrl: undefined,
  },
  {
    id: 'tt3', category: 'TikTok Growth', title: 'Duet & Stitch Playbook',
    description: 'Using collaboration features to piggyback on existing virality and build community.',
    readTime: '6 min', pages: 9,
    content: `The Duet and Stitch Playbook. Two of the most underutilized features in music marketing are TikTok Duets and Stitches. Both allow you to attach your content to an already-performing video, inheriting its algorithmic momentum. Here is the strategic approach to both. Duets work best when you react authentically to another creator's content. Find videos in your genre with 50,000 to 500,000 views, not million-view videos where your duet will get buried. React to the performance. Add a harmony. Play a live instrumental over their a cappella. The key is adding genuine value. Stitches allow you to clip the first 5 seconds of another video and respond. Use Stitches to respond to music questions. "What artists influenced your sound?" Stitch it with your answer and a performance. "What genre is this?" Stitch and explain your sound. For building your own duet culture: when you post a new song, explicitly invite duets in your caption. "Duet this with your best freestyle." Then stitch and duet the best responses, creating a feedback loop of UGC content around your release.`,
    pdfUrl: undefined,
  },

  // Spotify Algorithm
  {
    id: 'sp1', category: 'Spotify Algorithm', title: 'Algorithmic Playlisting Bible',
    description: 'How Discover Weekly, Release Radar, and Daylist actually work — and how to get on them.',
    readTime: '14 min', pages: 22,
    content: `The Algorithmic Playlisting Bible. Spotify's algorithmic playlists — Discover Weekly, Release Radar, Radio, and Daylist — collectively deliver billions of streams per week. Getting placed on these playlists can mean the difference between 500 streams and 500,000 on a single release. Here's how they actually work. Discover Weekly is generated every Monday for every Spotify user. It uses collaborative filtering: if you and another listener share 60 percent of the same music taste, Spotify will show you music that listener loves but you haven't heard yet. To get into Discover Weekly, you need listeners who are themselves highly engaged and diverse in their taste. This means your goal is not just raw streams but saves, playlist adds, and full-listen completions from a diverse audience. Release Radar is the easiest algorithmic playlist to crack. It automatically features new releases from artists a user follows within the last 28 days. This means growing your follower base on Spotify is critical infrastructure. Every follower is a guaranteed slot in Release Radar on your next drop. For every release, push your social audience to follow you on Spotify specifically, not just to stream. The Daylist is Spotify's newest and most personalized playlist. It changes throughout the day based on your listening habits. Getting onto Daylists requires consistent streaming behavior from your listeners, particularly during specific time windows like late night, morning commute, or workout hours.`,
    pdfUrl: undefined,
  },
  {
    id: 'sp2', category: 'Spotify Algorithm', title: 'Fan Engagement Signals That Drive Discovery',
    description: 'Saves, skip rate, playlist adds — the hidden metrics Spotify uses to rank your music.',
    readTime: '9 min', pages: 13,
    content: `Fan Engagement Signals That Drive Discovery. Spotify does not rank music by stream count alone. Behind the scenes, a sophisticated scoring system weighs multiple engagement signals to determine how broadly to distribute your music algorithmically. Understanding these signals and actively optimizing for them is the difference between an indie artist with 1,000 monthly listeners and one with 100,000. The highest-value signal is the Save. When a listener saves your song to their library or adds it to a playlist, Spotify treats this as a strong positive signal of genuine enjoyment. A 5 to 10 percent save rate on a new release tells the algorithm your music is resonating deeply. To drive saves, ask explicitly. "Save this if it hits different." "Add this to your workout playlist." The second most important signal is skip rate. If more than 40 percent of listeners skip your song before the 30-second mark, Spotify begins reducing its distribution. This is why your first 30 seconds are critical. Don't save the drop for the full minute. Hook immediately. Listener-to-follower conversion is also tracked. Spotify measures what percentage of people who stream you then click follow. This is a direct signal of fan quality and stickiness. Completion rate on individual tracks matters too. A song that gets fully listened to performs algorithmically better than one with high streams but low completion.`,
    pdfUrl: undefined,
  },
  {
    id: 'sp3', category: 'Spotify Algorithm', title: 'Editorial Pitching Framework',
    description: 'The exact process for submitting to Spotify editorial playlists via Spotify for Artists.',
    readTime: '7 min', pages: 10,
    content: `The Editorial Pitching Framework. Spotify for Artists allows every artist to pitch one unreleased song to their editorial team per release cycle. Most artists waste this opportunity by submitting too late or filling out the pitch form poorly. Here is the exact process that maximizes your shot at editorial placement. Step one: submit at least seven days before your release date. Editors need time to review submissions. Submissions made within 48 hours of release are almost never considered. Step two: fill out the pitch form completely. The genre field matters most. Be specific. Don't say Hip-Hop if you mean Memphis Rap or Melodic Drill. Step three: write a pitch description that tells a story. Editors read hundreds of pitches per day. A pitch that says "this is my new single with great energy" gets ignored. A pitch that says "this song was written the night my grandmother died and became the healing point of my community" gets read. Step four: link to press coverage. If you have any blog features, radio plays, or social proof, include them. Step five: highlight momentum. If you're already trending on TikTok or have a pre-save campaign building, mention the numbers. Editors want to back artists who are already building momentum, not discover artists from scratch.`,
    pdfUrl: undefined,
  },

  // Touring
  {
    id: 'to1', category: 'Touring', title: 'First Tour Blueprint',
    description: 'Routing, budgeting, and booking your first regional tour from scratch.',
    readTime: '15 min', pages: 24,
    content: `The First Tour Blueprint. Touring is the most powerful relationship-building tool an independent artist has. Nothing converts casual listeners into lifelong fans like a live show. Here is the step-by-step blueprint for planning and executing your first regional tour. Start 90 days out. Route efficiency is everything. A tour that zigzags across states burns through gas and time unnecessarily. Map your dates geographically so each show is within a 2 to 4 hour drive of the last. Cluster in markets where you already have streaming data showing strong listener density. Use Spotify for Artists analytics to find your top cities. Book anchor dates first. Identify one or two larger market venues where you have the strongest following. Build your routing around these anchors and fill in the gaps with smaller shows. Budget before you book. A common mistake is booking shows without accounting for costs. For a 7-day regional tour, budget for gas or mileage, hotel accommodations or floor sleeping arrangements, food and per diems for yourself and any crew, load-in crew or sound engineers, and merch printing costs. Your goal for a first tour is to break even. Profit comes from merch, not guarantees. Venues for first tours typically offer 70 to 80 percent of the door, a flat guarantee of $150 to $500, or a combination. Always negotiate for merch rights at 100 percent. Promote each date individually. A mass announcement post performs poorly. Create city-specific content for each market. Duet with local artists in each city. This drives walk-in attendance from local audiences who feel personally connected.`,
    pdfUrl: undefined,
  },
  {
    id: 'to2', category: 'Touring', title: 'Merch Strategy on the Road',
    description: 'Table layout, pricing psychology, and converting walk-ins into repeat buyers.',
    readTime: '8 min', pages: 12,
    content: `Merch Strategy on the Road. Merchandise is the number one revenue driver for independent touring artists. In 2024, artists with strong merch operations earn 3 to 5 times more per show than those relying solely on the door. Here is the complete merch strategy for touring artists. Table placement matters more than product. Position your merch table at the exit, not the entrance. Fans who pass it on the way out are warmer and more likely to buy after an emotional show experience. The anchor piece drives revenue. Identify one signature item at a slightly premium price point. This is your anchor. Everything else looks affordable in comparison. Price your anchor at $45 to $60 for a hoodie or specialty item. Price your core tee at $30 to $35. Price your budget item, a sticker pack or poster, at $5 to $10. The rule of three pricing structure maximizes average order value. Limit time and quantity signals. "Only brought 20 of these" and "only available on this tour" language increases purchase urgency significantly. Scan and text follow-up. Use Square or SumUp for card payments. Collect email or phone optionally at checkout. The fans who buy merch are your highest-value fans. Building a direct list from merch buyers creates lifetime customer relationships.`,
    pdfUrl: undefined,
  },

  // Distribution
  {
    id: 'di1', category: 'Distribution', title: 'Distributor Comparison Guide 2024',
    description: 'DistroKid vs TuneCore vs CD Baby vs Amuse — the honest breakdown for indie artists.',
    readTime: '10 min', pages: 15,
    content: `The Distributor Comparison Guide 2024. Choosing the right music distributor is one of the most important business decisions an independent artist makes. The wrong choice can cost you thousands of dollars over a career. Here is an honest breakdown of the four major options. DistroKid is the fastest and most affordable option for volume releases. At $22 per year for unlimited releases, it's the best value for prolific artists who release frequently. Royalty splits are instant and transparent. The main weakness is customer support, which is almost entirely automated. CD Baby charges per release: $9.95 for a single, $29 for an album. This makes it expensive for volume but ideal for artists doing one or two strategic releases per year. CD Baby also offers physical distribution and sync licensing opportunities not available through DistroKid. TuneCore charges $14.99 per single per year and $29.99 per album per year. It's priced higher but offers stronger label services including publishing administration for an additional fee. For artists pursuing sync licensing, TuneCore's publishing arm is competitive. Amuse is the wildcard. Free tier distribution with a 0 percent commission model is hard to beat financially. Amuse is slower to deliver to DSPs and lacks advanced features, but for artists who want to preserve every dollar, the free plan is worth considering. Recommendation: Start with DistroKid until you're releasing consistently. Move to CD Baby or TuneCore when sync licensing and catalog management become priorities.`,
    pdfUrl: undefined,
  },
  {
    id: 'di2', category: 'Distribution', title: 'Pre-Save Campaign Strategy',
    description: 'Maximize first-day streaming velocity with pre-save funnels that actually convert.',
    readTime: '7 min', pages: 10,
    content: `Pre-Save Campaign Strategy. A pre-save campaign is the most important marketing tool in a release strategy. When a listener pre-saves your track, Spotify automatically adds it to their library on release day, triggering an immediate notification and driving streams in the critical first 24 hours. Here is how to build a pre-save campaign that converts. Start your pre-save campaign 3 to 4 weeks before release. The goal is to build an audience of warm, committed listeners before the song drops. Use a link management service like Hypeddit, Feature.fm, or Toneden to build your pre-save page. These platforms also capture email and allow you to unlock a snippet or exclusive content in exchange for the pre-save, which dramatically increases conversion rates. Drive traffic to your pre-save from every channel. Your TikTok posts should all reference the pre-save link in your bio. Your Instagram stories should use the swipe-up or link sticker. Your email list should receive a dedicated pre-save campaign email. The most effective pre-save incentive is an exclusive snippet or behind-the-scenes content. "Pre-save to hear 30 seconds right now" consistently outperforms campaigns without incentives by 40 to 60 percent. On release day, the cascade begins. Every pre-saver gets a notification. This drives a surge of first-day streams that signals to the Spotify algorithm that your song has real momentum.`,
    pdfUrl: undefined,
  },

  // PR & Press
  {
    id: 'pr1', category: 'PR & Press', title: 'Press Release Template Kit',
    description: 'Three proven press release templates for singles, albums, and tour announcements.',
    readTime: '6 min', pages: 8,
    content: `The Press Release Template Kit. A well-written press release is the foundation of any media campaign. It gives journalists everything they need to write about you without doing additional research. Here are three templates you can use immediately. Template One: The Single Release. Headline: Artist Name Releases New Single "Song Title" Featuring [Feature if applicable]. First paragraph: include who, what, when, where. "Brooklyn-based artist [name] releases his/her latest single [song title] today via [distributor]. The track is available on all streaming platforms." Second paragraph: story behind the song. Why was it written? What does it mean? Third paragraph: quote from the artist. Make it personal and emotional, not promotional. Fourth paragraph: artist bio in 2 to 3 sentences. Boilerplate: standard artist contact information and streaming links. Template Two: The Album Announcement follows the same structure but leads with the project scope and creative vision rather than a single track. Template Three: Tour Announcement leads with the news value: number of cities, notable venues, on-sale date, and ticket link. Always include a high-resolution press photo attached to the email. Always embed streaming links directly in the body. Always follow up 3 days after initial send. Most media coverage comes from follow-ups, not first sends.`,
    pdfUrl: undefined,
  },
  {
    id: 'pr2', category: 'PR & Press', title: 'Blog Outreach Playbook',
    description: 'How to pitch independently to music blogs and actually get featured.',
    readTime: '9 min', pages: 13,
    content: `The Blog Outreach Playbook. Music blog placements remain one of the most effective tools for building credibility, generating backlinks for SEO, and reaching new audiences. Here is a systematic approach to blog outreach that actually converts. Step one: build a tiered contact list. Tier 1 blogs are major publications like Pitchfork, XXL, The FADER, and HotNewHipHop. These require publicists and existing relationships for most artists. Do not prioritize these until you have 50,000 or more monthly listeners. Tier 2 blogs are mid-size outlets with 10,000 to 500,000 monthly readers. These are accessible directly. Tier 3 are smaller niche blogs and Substack newsletters that are easiest to crack but build the foundation for bigger placements. Step two: personalize every pitch. Editors receive hundreds of generic pitches daily. A pitch that references a specific article they wrote, a genre they cover consistently, or why your music fits their readers specifically will outperform a mass-blast template by 10x. Step three: offer exclusives. Blogs love premieres. A premiere means they get to post your song before anyone else. For tier 2 blogs, offering a 24-hour exclusive premiere can secure a placement that might otherwise be impossible. Step four: follow up once and only once, 3 to 5 days after initial pitch. Two follow-ups are acceptable. Three is spam.`,
    pdfUrl: undefined,
  },
]

const CATEGORIES = [...new Set(PDF_LIBRARY.map(g => g.category))]

// Category colors consolidated to gold-monochrome (was a decorative
// sky/green/orange/blue/pink system per-category) — icon + label still
// carry the distinction.
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; border: string }> = {
  'TikTok Growth':    { icon: <TrendingUp size={14} />, color: 'text-[#B8860B]', border: 'border-[#FFD700]/20' },
  'Spotify Algorithm':{ icon: <Music2 size={14} />,     color: 'text-[#B8860B]', border: 'border-[#FFD700]/20' },
  'Touring':          { icon: <Truck size={14} />,      color: 'text-[#B8860B]', border: 'border-[#FFD700]/20' },
  'Distribution':     { icon: <Globe size={14} />,      color: 'text-[#B8860B]', border: 'border-[#FFD700]/20' },
  'PR & Press':       { icon: <Megaphone size={14} />,  color: 'text-[#B8860B]', border: 'border-[#FFD700]/20' },
}

// ─── Industry Articles ────────────────────────────────────────────────────────
interface Article {
  id: string
  tag: string
  tagColor: string
  coverGradient: string
  readingTime: string
  headline: string
  excerpt: string
  writer: string
  publishedAt: string
  href?: string
}

const ARTICLES: Article[] = [
  {
    id: "a1", tag: "Business", tagColor: "#FFD700",
    coverGradient: "from-yellow-900/80 via-zinc-900 to-zinc-950",
    readingTime: "5 min", publishedAt: "Oct 2024",
    headline: "Why Independent Artists Are Outpacing Major Labels in 2024",
    excerpt: "With distributor royalties climbing and social discovery leveling the field, the indie artist is no longer the underdog.",
    writer: "Music Business Worldwide", href: "https://www.musicbusinessworldwide.com",
  },
  {
    id: "a2", tag: "Streaming", tagColor: "#22c55e",
    coverGradient: "from-green-900/60 via-zinc-900 to-zinc-950",
    readingTime: "7 min", publishedAt: "Sep 2024",
    headline: "Spotify's Royalty Overhaul: What Artists Actually Need to Know",
    excerpt: "The minimum stream threshold and noise-floor policy changes have real implications for how and when you get paid.",
    writer: "Hypebot", href: "https://www.hypebot.com",
  },
  {
    id: "a3", tag: "Social", tagColor: "#f43f5e",
    coverGradient: "from-rose-900/60 via-zinc-900 to-zinc-950",
    readingTime: "4 min", publishedAt: "Oct 2024",
    headline: "TikTok x Music: The Virality Formula Is Changing Again",
    excerpt: "Algorithm shifts in late 2024 are rewarding long-form performance content over 15-second snippets. Here's how to adapt.",
    writer: "The FADER", href: "https://www.thefader.com",
  },
  {
    id: "a4", tag: "Licensing", tagColor: "#a855f7",
    coverGradient: "from-purple-900/60 via-zinc-900 to-zinc-950",
    readingTime: "8 min", publishedAt: "Sep 2024",
    headline: "Sync Licensing 101: How Indie Artists Land Film & TV Placements",
    excerpt: "Catalog ownership, metadata hygiene, and the right pitching channels — everything you need before your first sync deal.",
    writer: "Tunecore Blog", href: "https://www.tunecore.com/blog",
  },
  {
    id: "a5", tag: "AI", tagColor: "#3b82f6",
    coverGradient: "from-blue-900/60 via-zinc-900 to-zinc-950",
    readingTime: "6 min", publishedAt: "Oct 2024",
    headline: "AI in Music Production: Tools That Are Changing the Creative Process",
    excerpt: "From stem separation to mastering, AI tools are now standard in indie artist workflows — for better and for worse.",
    writer: "Rolling Stone", href: "https://www.rollingstone.com",
  },
  {
    id: "a6", tag: "Touring", tagColor: "#f97316",
    coverGradient: "from-orange-900/60 via-zinc-900 to-zinc-950",
    readingTime: "5 min", publishedAt: "Sep 2024",
    headline: "Small Venues Are Back — And Indie Artists Are Winning",
    excerpt: "The 300-cap room is having a moment. Why intimate shows are generating more lifetime fans than festival slots for most artists.",
    writer: "Pollstar", href: "https://www.pollstar.com",
  },
]

// ─── Video playlists ──────────────────────────────────────────────────────────
interface PlaylistVideo { id: string; title: string; duration?: string; description?: string }
interface Playlist {
  title: string
  playlistId: string
  coverImage: string
  videos: PlaylistVideo[]
}

const VIDEO_PLAYLISTS: Playlist[] = [
  {
    title: "Release Strategy",
    playlistId: "PLtPKxx4Gpa5Qqp0HGUWijH2UBzW6ZDtJT",
    coverImage: `https://img.youtube.com/vi/7MSplBGZXx4/hqdefault.jpg`,
    videos: [
      { id: "7MSplBGZXx4", title: "Waterfall Release Strategy Tutorial with DistroKid 2024", duration: "12:06", description: "A step-by-step walkthrough of the waterfall release strategy using DistroKid — the method of dropping album tracks one at a time over several weeks before the full project release. Each single stays live on all platforms as you go, building streaming momentum and algorithmic exposure across multiple release dates. This tutorial covers the exact setup process, timing, and how to keep each drop working for you long after it's out." },
      { id: "3Qsjm-CmNPo", title: "How To ACTUALLY Do An Album Rollout...", duration: "15:01", description: "A no-fluff breakdown of what a real album rollout looks like from the inside — not theory, but actual execution. The video walks through the three critical phases: pre-release buildup, release week activation, and post-release sustain. You'll learn exactly what should be happening at each stage to maximize streams, press coverage, and fan engagement without burning out or going quiet too early." },
    ],
  },
  {
    title: "Conversations",
    playlistId: "PLtPKxx4Gpa5T8GV8ywmfBoSC8QZ_BQqTu",
    coverImage: `https://img.youtube.com/vi/qekbbQ4Zt1M/hqdefault.jpg`,
    videos: [
      { id: "qekbbQ4Zt1M", title: "'Conversations' with BNYX, Riot & Zaytoven", duration: "63:45", description: "A landmark roundtable hosted by Julius of Lucid Monday featuring three of hip-hop's most prolific producers — BNYX, Riot, and Zaytoven. The conversation digs into how each producer found their sound, the behind-the-scenes reality of working with top-tier artists, and what it takes to build a lasting legacy. From learning beats out of necessity to sitting at the table with icons, this episode is a masterclass in the producer's journey." },
      { id: "v5Ct8rvTGNA", title: 'The Cheat Code | "The Blame Game" | Ep. 99', duration: "20:43", description: "The crew breaks down why artists keep falling victim to industry scams and bad business decisions. The episode argues that excuses don't protect you — due diligence does. If you paid someone $20,000 without vetting them, that's on you. Knowing what good business looks like is the only defense against bad business." },
      { id: "DJjUOOiEg1Y", title: 'The Cheat Code | "Before You Go To Radio" | Ep. 98', duration: "18:21", description: "The hosts lay out what artists need locked in before chasing radio placement. Creating content is a sales tool, not a vanity exercise — every post should have a clear call-to-action directing fans to stream, request, or buy. If your socials don't convert attention into action, radio won't save you." },
      { id: "YbAM9TIKEyc", title: 'The Cheat Code | "Owning Your Image" | Ep. 89', duration: "16:45", description: "A conversation about how public image shapes — and can derail — a music career. Using pop culture examples, the hosts explore how a single moment can permanently define a persona. Artists who don't intentionally own their image leave that narrative in someone else's hands." },
      { id: "l2zTuMo-bfk", title: 'The Cheat Code | "Let\'s Go On Tour" | Ep. 85', duration: "15:10", description: "The team breaks down independent touring fundamentals with a focus on college radio as a launchpad. College audiences are the core demographic for urban music — open to new artists, willing to spend, and plugged into cultural moments like homecomings and campus events. Activating this market before routing a tour can be a serious game-changer." },
      { id: "9jaMhuEWJQU", title: 'The Cheat Code | "What Are You Willing To Do" | Ep. 86', duration: "12:44", description: "The hosts push artists to get real about the sacrifices required to build a career. They spotlight FanBase, a Black-owned social platform with monetization features, as an example of thinking beyond mainstream channels. The episode challenges artists to question which platforms and strategies actually deserve their energy and time." },
      { id: "Vyu7lqInGac", title: 'The Cheat Code | "Growth and Gratitude" | Ep. 83', duration: "16:55", description: "A reflective look at the mentors and early collaborators who shaped the hosts' careers. The episode explores how a key early connection gave one host his first real foothold in the industry. It makes a compelling case for gratitude as a business strategy — the relationships you invest in early become the foundation for long-term growth." },
      { id: "bmFfqZZ-akg", title: 'The Cheat Code | "Money Money Money" | Ep. 81', duration: "17:25", description: "The crew gets into the money side of branding — from logos and fonts to merchandise strategy and limited editions. A story about receiving a cease and desist from Ferrari for unauthorized font use leads into a deeper conversation about why brand decisions carry real legal and financial weight for independent artists." },
      { id: "r_bzWGby0lY", title: 'The Cheat Code | "Work Hard, Win Big" | Ep. 76', duration: "28:47", description: "A wide-ranging conversation about hustle, Black-owned businesses, and what it actually means to build equity in an industry that wasn't designed for you. The hosts celebrate community-driven success while challenging artists to think beyond short-term wins and focus on ownership, legacy, and long-game thinking." },
      { id: "6F1v2m1QqWk", title: 'The Cheat Code | "Flawless Execution" | Ep. 79', duration: "22:36", description: "The team discusses delivering a polished, professional product in an era where AI-generated artists are landing major label deals. Warner Music Group's signing of an AI artist becomes a jumping-off point for discussing what flawless execution means when the bar keeps rising and the competition is literally infinite." },
      { id: "0-2lm7tLlog", title: 'The Cheat Code | "Inside The Machine" | Ep. 57', duration: "22:02", description: "A behind-the-scenes breakdown of how the music industry actually operates — from seasonal marketing cycles to platform algorithms. The hosts encourage artists to study business mechanics the same way they study their craft. Understanding the machine is the only way to make it work in your favor." },
      { id: "zPjOG71nRdg", title: 'The Cheat Code | "Post Release Day, What\'s Next?" | Ep. 58', duration: "22:29", description: "Release day is just the beginning. The crew maps out the strategic moves artists need to make in the days and weeks after a drop — from playlist pitching to fan activation and performance analysis. Artists who think the work is done when the song goes live are the ones who wonder why nothing moved." },
      { id: "TpcaH3vFKOg", title: 'The Cheat Code | "Can You Really Be Blackballed?" | Ep. 59', duration: "24:17", description: "The hosts tackle the myth of being blackballed in the music industry, defining what it actually means vs. what artists often assume it means. The conversation is a reality check — most closed doors aren't conspiracies, they're the result of not having built enough relationships and value to be worth the industry's investment." },
      { id: "Fb7nbwbwzSc", title: 'The Cheat Code | "Choosing A Distributor" | Ep. 54', duration: "21:17", description: "A practical breakdown of evaluating distribution deals and what to look for before committing as an independent artist. The episode uses a story about limited-edition merchandise to explain how scarcity and storytelling create perceived value — a principle that applies directly to how you position your music catalog." },
      { id: "taw7RMwETfE", title: 'The Cheat Code | "Marketing Explained" | Ep. 55', duration: "21:46", description: "The crew announces the launch of Articentric, a new affordable marketing company built for independent artists. The episode breaks down why professional marketing isn't optional in today's climate and how thinking strategically about promotion — not just creating content — separates artists who grow from those who plateau." },
      { id: "zWepMQnG4do", title: 'The Cheat Code | "Fake It Til You Make It" | Ep. 48', duration: "23:39", description: "The crew debates whether projecting a bigger image than your current reality is a legitimate career strategy or a trap. Using personal style and merchandise as a lens, the episode explores how presentation shapes perception — and whether that perception can be manufactured before the substance catches up." },
      { id: "ACvzJWN2nYY", title: 'The Cheat Code | "How Did I Get Shadow Banned?" | Ep. 50', duration: "22:37", description: "A deep dive into social media shadow banning — what it is, how to know if it's happening to you, and what artist behavior triggers it. The hosts connect fake followers and inauthentic engagement to reduced algorithmic reach, giving concrete steps to diagnose and fix your profile's visibility before your next release." },
    ],
  },
  {
    title: "The Business",
    playlistId: "PLtPKxx4Gpa5SpjX-QHyBZeoyuJv7SQa4N",
    coverImage: `https://img.youtube.com/vi/taw7RMwETfE/hqdefault.jpg`,
    videos: [
      { id: "taw7RMwETfE", title: 'The Cheat Code | "Marketing Explained" | Ep. 55', duration: "21:46", description: "A breakdown of what marketing actually means for independent artists — not just posting content, but building a system that moves people from discovery to action. The episode covers the launch of Articentric, a new affordable marketing company built specifically for indie artists who need professional-level strategy without the major-label budget. Thinking strategically about promotion separates artists who grow from those who plateau." },
      { id: "zPjOG71nRdg", title: 'The Cheat Code | "Post Release Day, What\'s Next?" | Ep. 58', duration: "22:29", description: "Release day is just the beginning. The crew maps out the strategic moves artists need to make in the days and weeks after a drop — from playlist pitching to fan activation and performance data analysis. Artists who think the work is done when the song goes live are the ones who wonder why nothing moved." },
    ],
  },
]

// ─── TTS hook ─────────────────────────────────────────────────────────────────
const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const ELEVENLABS_VOICE = 'pNInz6obpgDQGcFmaJgB' // Adam

type TtsState = 'idle' | 'loading' | 'playing' | 'paused'

function useTts() {
  const [ttsState, setTtsState] = useState<TtsState>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  function stop() {
    if (ELEVENLABS_KEY) {
      audioRef.current?.pause()
      if (audioRef.current) { audioRef.current.currentTime = 0 }
    } else if (ttsSupported) {
      try { window.speechSynthesis.cancel() } catch {}
    }
    setTtsState('idle')
  }

  function pause() {
    if (ELEVENLABS_KEY) {
      audioRef.current?.pause()
    } else if (ttsSupported) {
      try { window.speechSynthesis.pause() } catch {}
    }
    setTtsState('paused')
  }

  function resume() {
    if (ELEVENLABS_KEY) {
      audioRef.current?.play()
    } else if (ttsSupported) {
      try { window.speechSynthesis.resume() } catch {}
    }
    setTtsState('playing')
  }

  async function play(text: string) {
    stop()
    setTtsState('loading')

    if (ELEVENLABS_KEY) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}`, {
          method: 'POST',
          headers: { 'xi-api-key': ELEVENLABS_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
        })
        if (!res.ok) throw new Error(`ElevenLabs ${res.status}`)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => setTtsState('idle')
        audio.onerror = () => setTtsState('idle')
        audio.play().catch(() => setTtsState('idle'))
        setTtsState('playing')
      } catch {
        setTtsState('idle')
      }
      return
    }

    if (!ttsSupported) {
      setTtsState('idle')
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.88
      utterance.pitch = 1.0

      const applyVoice = (voices: SpeechSynthesisVoice[]) => {
        const PREFERRED = [
          'Google US English',
          'Microsoft Aria Online (Natural) - English (United States)',
          'Microsoft Guy Online (Natural) - English (United States)',
          'Microsoft Mark Online (Natural) - English (United States)',
          'Samantha',
          'Alex',
        ]
        const picked =
          PREFERRED.reduce<SpeechSynthesisVoice | null>((found, name) =>
            found ?? (voices.find(v => v.name === name) ?? null), null)
          ?? voices.find(v => v.lang.startsWith('en') && !v.localService)
          ?? voices.find(v => v.lang.startsWith('en'))
          ?? null
        if (picked) utterance.voice = picked
      }

      const voices = window.speechSynthesis.getVoices()
      if (voices.length) {
        applyVoice(voices)
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          applyVoice(window.speechSynthesis.getVoices())
          window.speechSynthesis.onvoiceschanged = null
        }
      }

      utterance.onend = () => setTtsState('idle')
      utterance.onerror = () => setTtsState('idle')
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setTtsState('playing')
    } catch {
      setTtsState('idle')
    }
  }

  useEffect(() => () => { stop() }, [])

  return { ttsState, play, pause, resume, stop }
}

// ─── PDF Reader Modal ─────────────────────────────────────────────────────────
function PdfReaderModal({ guide, onClose }: { guide: PdfGuide; onClose: () => void }) {
  const { ttsState, play, pause, resume, stop } = useTts()
  const meta = CATEGORY_META[guide.category]

  function handleTts() {
    if (ttsState === 'idle') play(guide.content)
    else if (ttsState === 'playing') pause()
    else if (ttsState === 'paused') resume()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={e => { if (e.target === e.currentTarget) { stop(); onClose(); } }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-[var(--dash-border)] shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>{guide.category}</span>
            <h3 className="text-[rgb(var(--dash-fg))] font-black text-xl uppercase tracking-tighter mt-1 leading-tight">{guide.title}</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-[rgba(var(--dash-fg),0.48)] text-[10px] font-bold">
                <Clock size={10} /> {guide.readTime} read
              </span>
              <span className="flex items-center gap-1.5 text-[rgba(var(--dash-fg),0.48)] text-[10px] font-bold">
                <FileText size={10} /> {guide.pages} pages
              </span>
            </div>
          </div>
          <button onClick={() => { stop(); onClose(); }} className="text-[rgba(var(--dash-fg),0.48)] hover:text-[rgb(var(--dash-fg))] transition-colors shrink-0 mt-1">
            <X size={20} />
          </button>
        </div>

        {/* TTS Controls */}
        <div className="px-7 py-4 border-b border-[var(--dash-border)] shrink-0 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[rgba(var(--dash-fg),0.5)]">Listen</span>
            {!ELEVENLABS_KEY && (
              <span className="text-[9px] text-[rgba(var(--dash-fg),0.46)] font-medium">(Browser TTS · Add VITE_ELEVENLABS_API_KEY for ElevenLabs)</span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleTts}
              disabled={ttsState === 'loading'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                ttsState === 'playing' || ttsState === 'paused'
                  ? 'bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700]'
                  : 'bg-[#FFD700] text-black hover:bg-yellow-300'
              } disabled:opacity-40`}
            >
              {ttsState === 'loading' && <><Loader2 size={12} className="animate-spin" /> Loading...</>}
              {ttsState === 'playing' && <><Pause size={12} /> Pause</>}
              {ttsState === 'paused'  && <><Play size={12} /> Resume</>}
              {ttsState === 'idle'    && <><Play size={12} /> Play</>}
            </button>
            {(ttsState === 'playing' || ttsState === 'paused') && (
              <button
                onClick={stop}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] transition-colors font-black text-[10px] uppercase tracking-widest"
              >
                <Square size={12} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-7">
          {guide.pdfUrl ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(guide.pdfUrl)}&embedded=true`}
              className="w-full rounded-2xl border border-[var(--dash-border)]"
              style={{ minHeight: '500px' }}
              title={guide.title}
            />
          ) : (
            <div className="space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${meta.color} ${meta.border} bg-[rgba(var(--dash-fg),0.03)]`}>
                {meta.icon} PDF not yet attached — reading content below
              </div>
              <div className="prose prose-invert max-w-none">
                {guide.content.split('. ').reduce((acc: string[], sentence, i, arr) => {
                  if (i % 4 === 0 && i > 0) acc.push('\n\n')
                  acc.push(sentence + (i < arr.length - 1 ? '. ' : ''))
                  return acc
                }, []).join('').split('\n\n').map((para, i) => (
                  <p key={i} className="text-[rgba(var(--dash-fg),0.6)] text-sm leading-relaxed font-medium mb-4">{para}</p>
                ))}
              </div>
              {guide.pdfUrl === undefined && (
                <div className="mt-8 p-4 bg-[#FFD700]/5 border border-[#FFD700]/15 rounded-2xl">
                  <p className="text-[#FFD700]/60 text-[10px] font-black uppercase tracking-widest">To attach a real PDF: add a <code className="font-mono">pdfUrl</code> to this guide's entry in <code className="font-mono">LearnSection.tsx</code></p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Playlist Modal ───────────────────────────────────────────────────────────
function PlaylistModal({ playlist, onClose }: { playlist: Playlist; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const activeVideo = playlist.videos[activeIdx]

  // Scroll active item into view in sidebar
  useEffect(() => {
    const el = sidebarRef.current?.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIdx])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 24 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-3xl overflow-hidden w-full shadow-2xl flex flex-col h-[100dvh] lg:h-auto"
        style={{ maxWidth: 960, maxHeight: '100dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--dash-border)] shrink-0 bg-[var(--dash-card)]">
          {/* Back button — clearly visible on mobile */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 -ml-2 rounded-xl text-[rgba(var(--dash-fg),0.6)] hover:text-[rgb(var(--dash-fg))] hover:bg-[rgba(var(--dash-fg),0.05)] transition-all"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] font-black uppercase tracking-widest">Back</span>
          </button>

          <div className="min-w-0 flex-1 text-center px-2">
            <p className="text-[rgb(var(--dash-fg))] font-black text-sm uppercase tracking-tighter truncate">{playlist.title}</p>
            <p className="text-[rgba(var(--dash-fg),0.48)] text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {activeIdx + 1} / {playlist.videos.length}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[rgba(var(--dash-fg),0.48)] hover:text-[rgb(var(--dash-fg))] text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <ExternalLink size={12} /> YouTube
            </a>
            <button onClick={onClose} className="text-[rgba(var(--dash-fg),0.48)] hover:text-[rgb(var(--dash-fg))] transition-colors p-1" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body: player + sidebar — scrollable on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">

          {/* Player */}
          <div className="flex-1 bg-black flex flex-col lg:min-h-0 shrink-0 lg:shrink">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <iframe
                key={activeVideo.id}
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Now playing label + description */}
            <div className="px-5 py-3 border-t border-[var(--dash-border)] shrink-0">
              <p className="text-[rgb(var(--dash-fg))] font-black text-sm leading-snug line-clamp-2">{activeVideo.title}</p>
              {activeVideo.description && (
                <p className="text-[rgba(var(--dash-fg),0.52)] text-sm font-medium leading-relaxed mt-2 line-clamp-4">{activeVideo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                  className="text-[10px] font-black uppercase tracking-widest text-[rgba(var(--dash-fg),0.48)] hover:text-[rgb(var(--dash-fg))] disabled:opacity-20 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setActiveIdx(i => Math.min(playlist.videos.length - 1, i + 1))}
                  disabled={activeIdx === playlist.videos.length - 1}
                  className="text-[10px] font-black uppercase tracking-widest text-[rgba(var(--dash-fg),0.48)] hover:text-[rgb(var(--dash-fg))] disabled:opacity-20 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar — flows in mobile (parent scrolls), scrolls itself on desktop */}
          <div
            ref={sidebarRef}
            className="w-full lg:w-72 xl:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--dash-border)] lg:overflow-y-auto"
            style={{ maxHeight: 'unset' }}
          >
            <div className="p-3 space-y-1">
              {playlist.videos.map((video, i) => {
                const isActive = i === activeIdx
                return (
                  <button
                    key={video.id}
                    data-idx={i}
                    onClick={() => setActiveIdx(i)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group ${
                      isActive
                        ? 'bg-[#FFD700]/10 border border-[#FFD700]/25'
                        : 'border border-transparent hover:bg-[rgba(var(--dash-fg),0.05)] hover:border-[var(--dash-border)]'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-[88px] h-[50px] rounded-lg overflow-hidden shrink-0 bg-[rgba(var(--dash-fg),0.08)]">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                        isActive ? 'bg-[#FFD700]/25' : 'bg-black/40 group-hover:bg-black/20'
                      }`}>
                        {isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700]" />
                        ) : (
                          <Play size={14} fill="white" className="text-white drop-shadow" />
                        )}
                      </div>
                    </div>

                    {/* Title + index */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-[11px] font-bold leading-snug line-clamp-3 transition-colors ${
                        isActive ? 'text-[#FFD700]' : 'text-[rgba(var(--dash-fg),0.6)] group-hover:text-[rgb(var(--dash-fg))]'
                      }`}>
                        {video.title}
                      </p>
                      <p className="text-[rgba(var(--dash-fg),0.46)] text-[9px] font-black uppercase tracking-widest mt-1">
                        {video.duration ?? `${i + 1}`}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function LearnSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const plan = usePlan()
  const canReadPro = plan.isAtLeast('pro')

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [openGuide, setOpenGuide]           = useState<PdfGuide | null>(null)
  const [openPlaylist, setOpenPlaylist]     = useState<typeof VIDEO_PLAYLISTS[number] | null>(null)
  const [showUpgrade, setShowUpgrade]       = useState<{ blockedItem: string } | null>(null)

  // Locked content → Pro click: go straight to Stripe Checkout for a signed-in
  // user instead of bouncing through /pricing. Falls back to /pricing if
  // checkout can't start (e.g. Stripe keys not configured yet).
  async function upgradeToProCheckout() {
    if (!user) { navigate('/pricing'); return }
    const result = await openCheckout(user.id, 'pro')
    if (!result.ok) navigate('/pricing')
  }

  const filteredGuides = activeCategory === 'All'
    ? PDF_LIBRARY
    : PDF_LIBRARY.filter(g => g.category === activeCategory)

  function tryOpenGuide(guide: PdfGuide) {
    if (canReadPro) { setOpenGuide(guide); return }
    setShowUpgrade({ blockedItem: guide.title })
  }

  return (
    <motion.div key="learn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">

      {/* ── Video Playlists ── */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Play size={14} className="text-[#FFD700]" />
          <h2 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Video Library</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {VIDEO_PLAYLISTS.map((pl, i) => (
            <motion.button
              key={pl.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setOpenPlaylist(pl)}
              className="group relative overflow-hidden rounded-2xl border border-[var(--dash-border)] hover:border-[rgba(var(--dash-fg),0.25)] transition-all text-left"
            >
              <img src={pl.coverImage} alt={pl.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Text sits on the fixed dark image-gradient overlay above — stays white regardless of theme */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <p className="text-white font-black text-sm uppercase tracking-tighter">{pl.title}</p>
                <p className="text-white/50 text-[10px] font-bold mt-1">{pl.videos.length} {pl.videos.length === 1 ? 'video' : 'videos'}</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Play size={12} fill="black" className="text-black ml-0.5" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── PDF Knowledge Base ── */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={14} className="text-[#FFD700]" />
          <h2 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Base</h2>
          {!canReadPro && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-[8px] font-black uppercase tracking-[0.15em] ml-2">
              <Lock size={9} /> Pro
            </span>
          )}
          <span className="text-[rgba(var(--dash-fg),0.46)] text-[10px] font-bold ml-auto">{PDF_LIBRARY.length} guides</span>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', ...CATEGORIES].map(cat => {
            const meta = cat === 'All' ? null : CATEGORY_META[cat]
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-[#FFD700] border-transparent text-black'
                    : 'bg-[var(--dash-card-alt)] border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] hover:border-[rgba(var(--dash-fg),0.15)]'
                }`}
              >
                {meta?.icon}{cat}
              </button>
            )
          })}
        </div>

        {/* Guide cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredGuides.map((guide, i) => {
            const meta = CATEGORY_META[guide.category]
            return (
              <motion.button
                key={guide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => tryOpenGuide(guide)}
                className={`text-left p-5 bg-[var(--dash-card-alt)] border ${meta.border} rounded-2xl hover:bg-[var(--dash-card)] transition-all group relative ${
                  !canReadPro ? 'opacity-90' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${meta.color}`}>
                    {meta.icon}{guide.category}
                  </span>
                  {canReadPro ? (
                    <ChevronRight size={13} className="text-[rgba(var(--dash-fg),0.46)] group-hover:text-[rgba(var(--dash-fg),0.52)] transition-colors shrink-0" />
                  ) : (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-[8px] font-black uppercase tracking-[0.15em] shrink-0">
                      <Lock size={9} /> Pro
                    </span>
                  )}
                </div>
                <p className="text-[rgb(var(--dash-fg))] font-black text-sm uppercase tracking-tight leading-snug mb-2 group-hover:text-[#FFD700] transition-colors">
                  {guide.title}
                </p>
                <p className="text-[rgba(var(--dash-fg),0.48)] text-[11px] leading-relaxed mb-3">{guide.description}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-[var(--dash-border)]">
                  <span className="flex items-center gap-1 text-[rgba(var(--dash-fg),0.46)] text-[9px] font-bold">
                    <Clock size={9} />{guide.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-[rgba(var(--dash-fg),0.46)] text-[9px] font-bold">
                    <FileText size={9} />{guide.pages} pages
                  </span>
                  <span className="flex items-center gap-1 text-[#FFD700]/50 text-[9px] font-black uppercase tracking-widest ml-auto">
                    <Volume2 size={9} /> Read Aloud
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Industry Articles ── */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Newspaper size={14} className="text-[#FFD700]" />
          <h2 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Industry Articles</h2>
          {!canReadPro && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-[8px] font-black uppercase tracking-[0.15em] ml-2">
              <Lock size={9} /> Pro
            </span>
          )}
          <span className="text-[rgba(var(--dash-fg),0.46)] text-[10px] font-bold ml-auto">{ARTICLES.length} articles</span>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          // Free users: intercept any click inside the grid and show the upgrade modal
          onClickCapture={!canReadPro ? (e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowUpgrade({ blockedItem: 'Industry Articles' })
          } : undefined}
        >
          {ARTICLES.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={!canReadPro ? 'cursor-pointer relative' : ''}
            >
              <ArticleCard
                coverGradient={article.coverGradient}
                tag={article.tag}
                tagColor={article.tagColor}
                readingTime={article.readingTime}
                headline={article.headline}
                excerpt={article.excerpt}
                writer={article.writer}
                publishedAt={article.publishedAt}
                href={article.href}
              />
              {!canReadPro && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[#FFD700]/30 bg-black/60 backdrop-blur-sm text-[#FFD700] text-[8px] font-black uppercase tracking-[0.15em] pointer-events-none">
                  <Lock size={9} /> Pro
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {openGuide    && <PdfReaderModal   guide={openGuide}       onClose={() => setOpenGuide(null)} />}
        {openPlaylist && <PlaylistModal    playlist={openPlaylist} onClose={() => setOpenPlaylist(null)} />}
        {showUpgrade && (
          <UpgradeGate
            blockedItem={showUpgrade.blockedItem}
            onClose={() => setShowUpgrade(null)}
            onUpgrade={() => { setShowUpgrade(null); upgradeToProCheckout() }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Upgrade gate modal (free users hitting locked content) ──────────────────
function UpgradeGate({
  blockedItem, onClose, onUpgrade,
}: {
  blockedItem: string
  onClose:     () => void
  onUpgrade:   () => void
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{    opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-md pointer-events-auto rounded-3xl border border-[#FFD700]/20 p-8 text-center"
          style={{
            background: 'linear-gradient(160deg,#0F0F0F 0%,#0A0A0A 100%)',
            boxShadow:  '0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,215,0,0.1)',
          }}
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70%] h-32 bg-[#FFD700]/20 blur-[80px] rounded-full pointer-events-none" />

          {/* This paywall card intentionally keeps a fixed dark/gold treatment
              regardless of dashboard theme — premium upsells stay consistent. */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            aria-label="Close"
          >
            <X size={12} />
          </button>

          <div className="relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center mb-5">
              <Lock size={22} className="text-[#FFD700]" />
            </div>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3">Pro Content</p>
            <h3 className="text-white text-2xl font-black tracking-tighter mb-3">
              Unlock the full Knowledge Base
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              "{blockedItem}" — plus every other guide, article, and industry breakdown — is included with{' '}
              <span className="text-[#FFD700] font-bold">uP Pro</span>. Video Library stays free.
            </p>
            <button
              onClick={onUpgrade}
              className="w-full h-12 rounded-2xl font-black text-[13px] tracking-wide flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: '#FFD700',
                color:      '#000',
                boxShadow:  '0 4px 20px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              Upgrade to Pro
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="mt-3 text-white/40 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
