import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignUpForm } from '../components/auth/SignUpForm'
import { ArtistProfileForm } from '../components/onboarding/ArtistProfileForm'
import { ToneSelectionOnboarding } from '../components/onboarding/ToneSelectionOnboarding'
import { PlanSelectionOnboarding } from '../components/onboarding/PlanSelectionOnboarding'
import { AuthOrbitPanel } from '../components/auth/AuthOrbitPanel'
import { EarlyAccessPopup } from '../components/ui/early-access-popup'
import { useAuth } from '../hooks/useAuth'
import { createClient } from '@supabase/supabase-js'
import type { ArtistTone } from '../types/auth.types'

type Step = 'signup' | 'profile' | 'tone' | 'plan'

interface SignUpPageProps {
  onComplete?: () => void
  onSwitchToLogin?: () => void
}

export function SignUpPage({ onComplete, onSwitchToLogin }: SignUpPageProps) {
  const { user, saveProfile } = useAuth()
  const [step, setStep] = useState<Step>('signup')
  const [profileData, setProfileData] = useState<{ artistName: string; genre: string; bio: string } | null>(null)
  const [selectedTone, setSelectedTone] = useState<ArtistTone | null>(null)
  const [saving, setSaving] = useState(false)
  const [showEarlyAccess, setShowEarlyAccess] = useState(false)

  // ── iMessage handoff: ?phone= param links this signup to a guest conversation ─
  const [fromImessage, setFromImessage] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const phone  = params.get('phone')
    if (phone) {
      sessionStorage.setItem('up_guest_phone', decodeURIComponent(phone))
      setFromImessage(true)
    }
  }, [])

  const STEP_NUM: Record<Step, number> = { signup: 1, profile: 2, tone: 3, plan: 4 }

  async function handleToneComplete(tone: ArtistTone) {
    setSelectedTone(tone)
    setStep('plan')
  }

  async function handlePlanComplete(tier: 'free' | 'pro' | 'growth') {
    if (!profileData || !selectedTone) return
    setSaving(true)
    await saveProfile({
      artist_name: profileData.artistName,
      genre: profileData.genre,
      bio: profileData.bio,
      tone: selectedTone,
      onboarding_complete: true,
      plan_tier: tier === 'free' ? 'free' : tier, // pro/growth set to 'free' until Stripe webhook flips it
    })

    // If user arrived via iMessage (?phone=…), link their phone to artist_profiles
    // so future iMessages route directly to their registered account.
    const storedPhone = sessionStorage.getItem('up_guest_phone')
    if (storedPhone && user?.id) {
      try {
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL as string,
          import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        )
        await supabase.from('artist_profiles').upsert({
          user_id:      user.id,
          artist_name:  profileData.artistName,
          phone_number: storedPhone,
          tone:         selectedTone,
        }, { onConflict: 'user_id' })
        sessionStorage.removeItem('up_guest_phone')
      } catch (err) {
        console.warn('[SignUp] Phone link failed:', err)
      }
    }

    setSaving(false)
    onComplete?.()
  }

  // Steps 2 & 3 stay full-screen (they have their own complex layouts)
  if (step !== 'signup') {
    return (
      <div className="fixed inset-0 z-[200] bg-black overflow-y-auto scroll-overlay">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />

        {/* Back button */}
        <button
          onClick={() => setStep(
            step === 'plan'    ? 'tone' :
            step === 'tone'    ? 'profile' :
                                 'signup'
          )}
          className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all text-[11px] font-black uppercase tracking-widest"
          aria-label="Back"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>

        <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">

          {/* Progress */}
          <div className="w-full max-w-xl flex gap-2 mb-16 relative z-10">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= STEP_NUM[step] ? 'bg-[#FFD700]' : 'bg-white/10'}`}
              />
            ))}
          </div>

          <div className="relative z-10 w-full flex justify-center">
            <AnimatePresence mode="wait">
              {step === 'profile' && (
                <motion.div key="profile" className="w-full flex justify-center">
                  <ArtistProfileForm
                    initialName={user?.artistName}
                    onComplete={data => { setProfileData(data); setStep('tone') }}
                  />
                </motion.div>
              )}
              {step === 'tone' && (
                <motion.div key="tone" className="w-full flex justify-center">
                  <ToneSelectionOnboarding onComplete={handleToneComplete} loading={saving} />
                </motion.div>
              )}
              {step === 'plan' && (
                <motion.div key="plan" className="w-full flex justify-center">
                  <PlanSelectionOnboarding
                    userId={user?.id ?? ''}
                    artistName={profileData?.artistName}
                    onComplete={handlePlanComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>{/* end min-h-full inner */}
      </div>
    )
  }

  // Step 1 — split layout matching Login page
  return (
    <div className="fixed inset-0 z-[200] bg-black flex">
      {/* Left — orbiting platforms (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] h-full border-r border-white/5">
        <AuthOrbitPanel />
      </div>

      {/* Right — sign up form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          {/* iMessage handoff banner */}
          {fromImessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 px-4 py-3 rounded-2xl border"
              style={{ background: 'rgba(255,215,0,0.08)', borderColor: 'rgba(255,215,0,0.2)' }}
            >
              <span className="text-lg leading-none mt-0.5">💬</span>
              <div>
                <p className="text-[#FFD700] text-[11px] font-black uppercase tracking-widest mb-0.5">
                  Continuing from iMessage
                </p>
                <p className="text-white/50 text-[12px] leading-relaxed">
                  Create your account to unlock unlimited access. Your conversation with uP carries over.
                </p>
              </div>
            </motion.div>
          )}
          <SignUpForm
            onSuccess={() => setShowEarlyAccess(true)}
            onSwitchToLogin={onSwitchToLogin ?? (() => {})}
          />
        </div>
      </div>
      <EarlyAccessPopup
        open={showEarlyAccess}
        artistName={user?.artistName}
        onClose={() => { setShowEarlyAccess(false); setStep('profile') }}
      />
    </div>
  )
}
