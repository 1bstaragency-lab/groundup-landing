import { useState, useCallback } from 'react'

const STORAGE_KEY = 'gup_artist_points_v1'

export interface PointsHistoryItem {
  label: string
  points: number
  type: 'earned' | 'spent'
  date: string
}

interface PointsState {
  available: number
  totalEarned: number
  history: PointsHistoryItem[]
}

function load(): PointsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PointsState
  } catch {}
  return { available: 0, totalEarned: 0, history: [] }
}

function persist(state: PointsState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export function usePoints() {
  const [state, setState] = useState<PointsState>(load)

  const earn = useCallback((points: number, label: string) => {
    setState(prev => {
      const next: PointsState = {
        available: prev.available + points,
        totalEarned: prev.totalEarned + points,
        history: [
          { label, points, type: 'earned', date: new Date().toISOString() },
          ...prev.history.slice(0, 49),
        ],
      }
      persist(next)
      return next
    })
  }, [])

  const spend = useCallback((points: number, label: string): boolean => {
    let success = false
    setState(prev => {
      if (prev.available < points) return prev
      success = true
      const next: PointsState = {
        available: prev.available - points,
        totalEarned: prev.totalEarned,
        history: [
          { label, points: -points, type: 'spent', date: new Date().toISOString() },
          ...prev.history.slice(0, 49),
        ],
      }
      persist(next)
      return next
    })
    return success
  }, [])

  return { available: state.available, totalEarned: state.totalEarned, history: state.history, earn, spend }
}
