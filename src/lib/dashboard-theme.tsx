/**
 * Light/dark theme for the authenticated dashboard only.
 * Marketing site + onboarding stay on the fixed brand-tokens palette —
 * this is scoped via the `data-dashboard-theme` attribute set here,
 * which the CSS vars in index.css key off of.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Sun, Moon } from 'lucide-react'

export type DashboardTheme = 'light' | 'dark'
const STORAGE_KEY = 'gup_dashboard_theme'

const ThemeContext = createContext<{
  theme: DashboardTheme
  toggleTheme: () => void
}>({ theme: 'light', toggleTheme: () => {} })

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<DashboardTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-dashboard-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
    return () => { document.documentElement.removeAttribute('data-dashboard-theme') }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useDashboardTheme() {
  return useContext(ThemeContext)
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useDashboardTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-black/5 ${className}`}
      style={{ border: `1px solid var(--dash-border)`, color: 'rgb(var(--dash-fg))' }}
    >
      {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  )
}

// ── Reactive color tokens for dashboard components (CSS-var backed) ─────────
// Same names as brand-tokens' INK/DIM/FAINT/SILVER so call sites don't
// change — only the import source does. GOLD/GOLDD stay imported from
// brand-tokens directly since the accent color doesn't change with theme.
export const INK   = 'rgb(var(--dash-fg))'
export const DIM   = 'rgba(var(--dash-fg), 0.62)'
export const FAINT = 'var(--dash-border)'
export const SILVER = 'var(--dash-bg)'
export const CARD  = 'var(--dash-card)'
export const CARD_ALT = 'var(--dash-card-alt)'
