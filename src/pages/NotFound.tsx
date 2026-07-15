import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * Catch-all route target. Netlify's /* redirect serves this with a real
 * HTTP 404 (see public/_redirects) — this component just needs to render
 * distinct content so unknown paths don't look like a duplicate homepage
 * to crawlers, matching the status code above it.
 */
export function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Page Not Found — GrounduP'
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-4">404</p>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-4">Page not found.</h1>
      <p className="text-white/40 text-sm font-medium max-w-md mb-8">
        That link doesn't lead anywhere on GrounduP. It may have moved or never existed.
      </p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-6 h-12 rounded-2xl bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] transition-transform"
      >
        <ArrowLeft size={14} /> Back to GrounduP
      </button>
    </div>
  )
}

export default NotFoundPage
