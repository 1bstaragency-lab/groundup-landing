"use client"

import { useState, useRef, useEffect } from "react" // useRef/useEffect used by TTS
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, Pause, Square, X, BookOpen, TrendingUp, Music2,
  Truck, Megaphone, Globe, ChevronRight, Volume2, Loader2,
  FileText, Clock, ExternalLink,
} from "lucide-react"

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

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; border: string }> = {
  'TikTok Growth':    { icon: <TrendingUp size={14} />, color: 'text-sky-400',    border: 'border-sky-400/20' },
  'Spotify Algorithm':{ icon: <Music2 size={14} />,     color: 'text-green-400',  border: 'border-green-400/20' },
  'Touring':          { icon: <Truck size={14} />,      color: 'text-orange-400', border: 'border-orange-400/20' },
  'Distribution':     { icon: <Globe size={14} />,      color: 'text-blue-400',   border: 'border-blue-400/20' },
  'PR & Press':       { icon: <Megaphone size={14} />,  color: 'text-pink-400',   border: 'border-pink-400/20' },
}

// ─── Video playlists ──────────────────────────────────────────────────────────
const VIDEO_PLAYLISTS = [
  {
    title: "Release Strategy",
    count: 2,
    coverImage: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5Qqp0HGUWijH2UBzW6ZDtJT",
  },
  {
    title: "Conversations",
    count: 17,
    coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5T8GV8ywmfBoSC8QZ_BQqTu",
  },
  {
    title: "The Business",
    count: 2,
    coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5SpjX-QHyBZeoyuJv7SQa4N",
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

  function stop() {
    if (ELEVENLABS_KEY) {
      audioRef.current?.pause()
      if (audioRef.current) { audioRef.current.currentTime = 0 }
    } else {
      window.speechSynthesis.cancel()
    }
    setTtsState('idle')
  }

  function pause() {
    if (ELEVENLABS_KEY) {
      audioRef.current?.pause()
    } else {
      window.speechSynthesis.pause()
    }
    setTtsState('paused')
  }

  function resume() {
    if (ELEVENLABS_KEY) {
      audioRef.current?.play()
    } else {
      window.speechSynthesis.resume()
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
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => setTtsState('idle')
        audio.play()
        setTtsState('playing')
      } catch {
        setTtsState('idle')
      }
    } else {
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
        className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-white/5 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>{guide.category}</span>
            <h3 className="text-white font-black text-xl uppercase tracking-tighter mt-1 leading-tight">{guide.title}</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold">
                <Clock size={10} /> {guide.readTime} read
              </span>
              <span className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold">
                <FileText size={10} /> {guide.pages} pages
              </span>
            </div>
          </div>
          <button onClick={() => { stop(); onClose(); }} className="text-white/30 hover:text-white transition-colors shrink-0 mt-1">
            <X size={20} />
          </button>
        </div>

        {/* TTS Controls */}
        <div className="px-7 py-4 border-b border-white/5 shrink-0 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Listen</span>
            {!ELEVENLABS_KEY && (
              <span className="text-[9px] text-white/20 font-medium">(Browser TTS · Add VITE_ELEVENLABS_API_KEY for ElevenLabs)</span>
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"
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
              className="w-full rounded-2xl border border-white/5"
              style={{ minHeight: '500px' }}
              title={guide.title}
            />
          ) : (
            <div className="space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${meta.color} ${meta.border} bg-white/3`}>
                {meta.icon} PDF not yet attached — reading content below
              </div>
              <div className="prose prose-invert max-w-none">
                {guide.content.split('. ').reduce((acc: string[], sentence, i, arr) => {
                  if (i % 4 === 0 && i > 0) acc.push('\n\n')
                  acc.push(sentence + (i < arr.length - 1 ? '. ' : ''))
                  return acc
                }, []).join('').split('\n\n').map((para, i) => (
                  <p key={i} className="text-white/60 text-sm leading-relaxed font-medium mb-4">{para}</p>
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
function PlaylistModal({ playlist, onClose }: { playlist: typeof VIDEO_PLAYLISTS[number]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <p className="text-white font-black text-sm uppercase tracking-tighter">{playlist.title}</p>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-0.5">{playlist.count} Videos · Stash Guapo</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <ExternalLink size={12} /> YouTube
            </a>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={20} /></button>
          </div>
        </div>
        <div className="flex-1 bg-black" style={{ minHeight: '480px' }}>
          <iframe
            className="w-full h-full"
            style={{ minHeight: '480px' }}
            src={`https://www.youtube.com/embed/videoseries?list=${playlist.playlistId}&rel=0`}
            title={playlist.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function LearnSection() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [openGuide, setOpenGuide]           = useState<PdfGuide | null>(null)
  const [openPlaylist, setOpenPlaylist]     = useState<typeof VIDEO_PLAYLISTS[number] | null>(null)

  const filteredGuides = activeCategory === 'All'
    ? PDF_LIBRARY
    : PDF_LIBRARY.filter(g => g.category === activeCategory)

  return (
    <motion.div key="learn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">

      {/* ── PDF Knowledge Base ── */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={14} className="text-[#FFD700]" />
          <h2 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Base</h2>
          <span className="text-white/20 text-[10px] font-bold ml-auto">{PDF_LIBRARY.length} guides</span>
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
                    : 'bg-zinc-900/40 border-white/5 text-white/40 hover:text-white hover:border-white/10'
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
                onClick={() => setOpenGuide(guide)}
                className={`text-left p-5 bg-zinc-900/40 border ${meta.border} rounded-2xl hover:bg-zinc-900/70 transition-all group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${meta.color}`}>
                    {meta.icon}{guide.category}
                  </span>
                  <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </div>
                <p className="text-white font-black text-sm uppercase tracking-tight leading-snug mb-2 group-hover:text-[#FFD700] transition-colors">
                  {guide.title}
                </p>
                <p className="text-white/30 text-[11px] leading-relaxed mb-3">{guide.description}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 text-white/20 text-[9px] font-bold">
                    <Clock size={9} />{guide.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-white/20 text-[9px] font-bold">
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
              className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-white/15 transition-all text-left"
            >
              <img src={pl.coverImage} alt={pl.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <p className="text-white font-black text-sm uppercase tracking-tighter">{pl.title}</p>
                <p className="text-white/40 text-[10px] font-bold mt-1">{pl.count} videos</p>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Play size={12} fill="black" className="text-black ml-0.5" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {openGuide    && <PdfReaderModal   guide={openGuide}       onClose={() => setOpenGuide(null)} />}
        {openPlaylist && <PlaylistModal    playlist={openPlaylist} onClose={() => setOpenPlaylist(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}
