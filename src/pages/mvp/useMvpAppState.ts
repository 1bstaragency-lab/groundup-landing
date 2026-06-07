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
]

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useMvpAppState(onboarding: OnboardingCtx) {
  const [releases, setReleases] = useState<Release[]>(SEED_RELEASES)
  const [chat, setChat]         = useState<ChatMsg[]>(SEED_CHAT)
  const [chatPending, setChatPending] = useState(false)
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

  // ─── Reset everything (sign out) ────────────────────────────────────────
  const resetAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    setReleases(SEED_RELEASES)
    setChat(SEED_CHAT)
  }, [])

  // ─── Derived: latest uP message for Home banner ─────────────────────────
  const latestUpMessage = chat.slice().reverse().find(m => m.from === 'up' && m.text) ?? null

  // ─── Derived: next 3 incomplete tasks across all releases ───────────────
  const upcomingTasks = releases.flatMap(r =>
    r.tasks
      .map((t, i) => ({ ...t, releaseId: r.id, releaseTitle: r.title, idx: i }))
      .filter(t => !t.done)
  ).slice(0, 3)

  return {
    // State
    releases,
    chat,
    chatPending,
    // Derived
    latestUpMessage,
    upcomingTasks,
    // Actions
    toggleTask,
    sendChat,
    resetAll,
  }
}

export type MvpAppStateAPI = ReturnType<typeof useMvpAppState>
