/**
 * useMvpAppState — central state for the /mvp app shell.
 *
 * Owns:
 *   - Release task state (toggleable checkboxes per release)
 *   - Chat conversation history (with /mvp-chat API integration)
 *   - Onboarding context that gets handed to uP for personalized replies
 *
 * Persists to localStorage so refreshes don't blow state away.
 *
 * When we port to Expo / React Native, swap localStorage for AsyncStorage
 * and the rest of the hook stays identical.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'gup_mvp_app_state_v1'

export interface ReleaseTask { label: string; done: boolean; due?: string }
export interface Release {
  id:        string
  title:     string
  type:      'Single' | 'EP' | 'Album'
  dropDate:  string
  daysOut:   number
  accent:    string
  art:       string
  tasks:     ReleaseTask[]
}

export interface ChatMsg {
  id:   string
  from: 'up' | 'me'
  text?: string
  card?: { title: string; sub: string; stat: string; accent: string }
  /** Optional inline action — renders as a button beneath the bubble.
   *  When tapped, sends `replyText` as the user's response. */
  action?: { label: string; replyText: string; done?: boolean }
  ts:   string
}

export interface OnboardingCtx {
  artistName: string
  genre?:     string | null
  goal?:      string | null
  pains?:     string[]
}

interface PersistedState {
  releases:   Release[]
  chat:       ChatMsg[]
}

// ─── Seed data — used on first launch + after Reset ────────────────────────

const SEED_RELEASES: Release[] = [
  {
    id: 'r1', title: 'Drank In My Cup', type: 'Single', dropDate: '2026-06-19',
    daysOut: 12, accent: '#FFD700',
    art: 'linear-gradient(140deg, #2A1F0F 0%, #4A3416 40%, #FFD700 100%)',
    tasks: [
      { label: 'Final master locked',          done: true,  due: 'Mon' },
      { label: 'Album art uploaded',           done: true,  due: 'Tue' },
      { label: 'Distributor scheduled',        done: true,  due: 'Wed' },
      { label: 'Spotify for Artists pitch',    done: true,  due: 'Thu' },
      { label: 'Pre-save link generated',      done: true,  due: 'Fri' },
      { label: 'Press release drafted',        done: true,  due: 'Mon' },
      { label: 'TikTok teaser #1 posted',      done: true,  due: 'Wed' },
      { label: 'Curator pitches sent (50)',    done: true,  due: 'Fri' },
      { label: 'TikTok teaser #2 posted',      done: false, due: 'Sat' },
      { label: 'Meta ad creative approved',    done: false, due: 'Mon' },
      { label: 'Day-of pre-save push',         done: false, due: 'Thu' },
      { label: 'Release day post + DMs',       done: false, due: 'Fri' },
    ],
  },
  {
    id: 'r2', title: 'Late Night Sessions', type: 'EP', dropDate: '2026-07-22',
    daysOut: 45, accent: '#A78BFA',
    art: 'linear-gradient(140deg, #1A1633 0%, #3D2966 50%, #A78BFA 100%)',
    tasks: [
      { label: 'Track 1 final mix',  done: true  },
      { label: 'Track 2 final mix',  done: true  },
      { label: 'Track 3 final mix',  done: true  },
      { label: 'Track 4 vocals',     done: false },
      { label: 'Album art briefing', done: false },
    ],
  },
]

const SEED_CHAT: ChatMsg[] = [
  { id: '1', from: 'up', text: 'Morning. Three things on the table — want the rundown?', ts: '8:02 AM' },
  { id: '2', from: 'me', text: 'Hit me.', ts: '8:03 AM' },
  { id: '3', from: 'up',
    text: '1. Drank In My Cup pitches went out — DJ Smoov (92K) replied 🔥.\n2. Meta ad ran $20, brought 412 listeners at $0.12/each.\n3. Spotify pitch is due Friday — I drafted it.',
    ts: '8:03 AM' },
  { id: '4', from: 'up',
    card: { title: "Yesterday's Meta Campaign", sub: '412 new listeners · $0.12 / listener', stat: '+18%', accent: '#60A5FA' },
    ts: '8:03 AM' },
  { id: '5', from: 'up',
    text: 'Want me to approve the Spotify pitch and send it now? I can also queue DJ Smoov a thank-you DM at the same time.',
    action: { label: 'Approve & send →', replyText: 'Approve and send.' },
    ts: '8:04 AM' },
]

// Past releases — finalized, no active checklist. Shown in the Releases tab
// archive section. Stats are mock numbers; real implementation pulls from
// Spotify-for-Artists / Apple Music for Artists.
export interface PastRelease {
  id:           string
  title:        string
  type:         'Single' | 'EP' | 'Album'
  releasedDate: string             // human readable
  streams:      string             // formatted: "42k"
  weeklyDelta:  string             // "+8% this week"
  accent:       string
  art:          string
}

export const SEED_PAST: PastRelease[] = [
  { id: 'p1', title: 'After Hours', type: 'Single', releasedDate: 'May 22, 2026',
    streams: '38.4k', weeklyDelta: '+12% this week', accent: '#60A5FA',
    art: 'linear-gradient(140deg, #0F1F33 0%, #1A3A66 50%, #60A5FA 100%)' },
  { id: 'p2', title: 'Velvet Floor', type: 'EP', releasedDate: 'Feb 14, 2026',
    streams: '127k', weeklyDelta: '+3% this week', accent: '#34D399',
    art: 'linear-gradient(140deg, #0F2A22 0%, #1A4A33 50%, #34D399 100%)' },
  { id: 'p3', title: '4AM', type: 'Single', releasedDate: 'Nov 8, 2025',
    streams: '208k', weeklyDelta: '— this week', accent: '#F472B6',
    art: 'linear-gradient(140deg, #2A0F22 0%, #4A1A3A 50%, #F472B6 100%)' },
]

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useMvpAppState(onboarding: OnboardingCtx) {
  const [releases, setReleases] = useState<Release[]>(SEED_RELEASES)
  const [chat, setChat]         = useState<ChatMsg[]>(SEED_CHAT)
  const [chatPending, setChatPending] = useState(false)
  // Length of chat array the last time the user opened the uP Chat tab.
  // chatUnreadCount = number of uP messages added after this length.
  const [lastSeenChatLen, setLastSeenChatLen] = useState(SEED_CHAT.length)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const persisted = JSON.parse(raw) as PersistedState
      if (persisted.releases) setReleases(persisted.releases)
      if (persisted.chat)     setChat(persisted.chat)
    } catch (err) {
      console.warn('[mvp-state] localStorage parse error:', err)
    }
  }, [])

  // Debounced persist on any state change
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      try {
        const payload: PersistedState = { releases, chat }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch (err) {
        console.warn('[mvp-state] localStorage write error:', err)
      }
    }, 350)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [releases, chat])

  // ─── Release task toggle ────────────────────────────────────────────────
  const toggleTask = useCallback((releaseId: string, taskIndex: number) => {
    setReleases(prev =>
      prev.map(r => {
        if (r.id !== releaseId) return r
        const tasks = r.tasks.map((t, i) => i === taskIndex ? { ...t, done: !t.done } : t)
        return { ...r, tasks }
      })
    )
  }, [])

  // ─── Chat: send a message + fetch uP's reply ────────────────────────────
  const sendChat = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || chatPending) return

    const now = new Date()
    const ts  = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMsg: ChatMsg = {
      id:   `u-${Date.now()}`,
      from: 'me',
      text: trimmed,
      ts,
    }
    setChat(prev => [...prev, userMsg])
    setChatPending(true)

    try {
      // Convert local chat → API format
      const history = [...chat, userMsg]
        .filter(m => m.text)
        .map(m => ({
          role:    m.from === 'me' ? 'user' as const : 'assistant' as const,
          content: m.text!,
        }))

      const res = await fetch('/.netlify/functions/mvp-chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: onboarding.artistName,
          genre:      onboarding.genre,
          goal:       onboarding.goal,
          pains:      onboarding.pains ?? [],
          history:    history.slice(0, -1), // exclude the message we just added (sent separately)
          message:    trimmed,
        }),
      })

      const data = await res.json().catch(() => ({} as { reply?: string }))
      const reply = data.reply ?? "I'm thinking — try that again?"

      const replyMsg: ChatMsg = {
        id:   `up-${Date.now()}`,
        from: 'up',
        text: reply,
        ts:   new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }
      setChat(prev => [...prev, replyMsg])
    } catch (err) {
      console.warn('[mvp-state] chat error:', err)
      const errMsg: ChatMsg = {
        id:   `up-err-${Date.now()}`,
        from: 'up',
        text: "Connection blip — try that again?",
        ts:   new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      }
      setChat(prev => [...prev, errMsg])
    } finally {
      setChatPending(false)
    }
  }, [chat, chatPending, onboarding])

  // ─── Run an inline action from a uP message ─────────────────────────────
  // Marks the action done (so the button disappears), then sends the
  // action's replyText as if the user typed it.
  const runChatAction = useCallback((msgId: string) => {
    let replyText: string | null = null
    setChat(prev => prev.map(m => {
      if (m.id !== msgId || !m.action || m.action.done) return m
      replyText = m.action.replyText
      return { ...m, action: { ...m.action, done: true } }
    }))
    if (replyText) sendChat(replyText)
  }, [sendChat])

  // ─── Mark the chat as seen (reset unread counter) ───────────────────────
  const markChatSeen = useCallback(() => setLastSeenChatLen(chat.length), [chat.length])

  // ─── Reset everything (sign out) ────────────────────────────────────────
  const resetAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    setReleases(SEED_RELEASES)
    setChat(SEED_CHAT)
    setLastSeenChatLen(SEED_CHAT.length)
  }, [])

  // ─── Derived: latest uP message for Home banner ─────────────────────────
  const latestUpMessage = chat.slice().reverse().find(m => m.from === 'up' && m.text) ?? null

  // ─── Derived: latest uP message that has an unfulfilled action ──────────
  const pendingActionMessage =
    chat.slice().reverse().find(m => m.from === 'up' && m.action && !m.action.done) ?? null

  // ─── Derived: next 3 incomplete tasks across all releases ───────────────
  const upcomingTasks = releases.flatMap(r =>
    r.tasks
      .map((t, i) => ({ ...t, releaseId: r.id, releaseTitle: r.title, idx: i }))
      .filter(t => !t.done)
  ).slice(0, 3)

  // ─── Derived: unread badge counts for the tab bar ───────────────────────
  const chatUnreadCount =
    chat.slice(lastSeenChatLen).filter(m => m.from === 'up').length
  // Network is static in this MVP — DJ Smoov's "replied" row is what's new.
  const networkUnreadCount = 1

  // ─── Derived: past releases (still seeded for now) ──────────────────────
  const pastReleases = SEED_PAST

  return {
    // State
    releases,
    pastReleases,
    chat,
    chatPending,
    // Derived
    latestUpMessage,
    pendingActionMessage,
    upcomingTasks,
    chatUnreadCount,
    networkUnreadCount,
    // Actions
    toggleTask,
    sendChat,
    runChatAction,
    markChatSeen,
    resetAll,
  }
}

export type MvpAppStateAPI = ReturnType<typeof useMvpAppState>
