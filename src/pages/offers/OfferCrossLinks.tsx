/**
 * OfferCrossLinks — shown at the bottom of every offer page.
 *
 * If a visitor didn't bite on the current offer, give them 3 other angles
 * to try instead of dead-ending at the waitlist or a back button.
 *
 * Renders 3 cards picked from OFFERS excluding the current offer id.
 */
import { useNavigate } from 'react-router-dom'
import { OFFERS, type OfferConfig } from './offerConfig'
import { usePaywallTracking } from '../../hooks/usePaywallTracking'

interface OfferCrossLinksProps {
  currentOfferId: string
}

export function OfferCrossLinks({ currentOfferId }: OfferCrossLinksProps) {
  const navigate = useNavigate()
  const { trackCta } = usePaywallTracking(`crosslinks:${currentOfferId}`)

  // Pick 3 sibling offers in display order, skipping the current one
  const others: OfferConfig[] = Object.values(OFFERS)
    .filter(o => o.slug !== currentOfferId)
    .slice(0, 3)

  if (others.length === 0) return null

  function go(slug: string) {
    trackCta({ choice: slug, fromOffer: currentOfferId })
    navigate(`/${slug}`)
  }

  return (
    <section className="w-full mt-12 pt-10 border-t border-zinc-300/40">
      <p className="text-center text-zinc-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6">
        Or try another angle
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {others.map(o => (
          <button
            key={o.slug}
            onClick={() => go(o.slug)}
            className="group text-left p-4 rounded-2xl border border-zinc-300 bg-white/80 hover:bg-white hover:border-[#B8860B]/40 hover:shadow-[0_4px_20px_rgba(255,215,0,0.15)] transition-all flex flex-col gap-1.5"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7A5C00]">
              {o.eyebrow}
            </p>
            <p className="text-zinc-900 text-[13px] font-black tracking-tight leading-tight group-hover:text-black transition-colors">
              {o.ctaText}
            </p>
            <span className="text-[#B8860B] text-[10px] font-black uppercase tracking-widest mt-1 inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              See offer →
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default OfferCrossLinks
