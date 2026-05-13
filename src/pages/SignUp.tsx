import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignUpForm } from '../components/auth/SignUpForm';
import { ArtistProfileForm } from '../components/onboarding/ArtistProfileForm';
import { ToneSelectionOnboarding } from '../components/onboarding/ToneSelectionOnboarding';
import { useAuth } from '../hooks/useAuth';
import type { ArtistTone } from '../types/auth.types';

type Step = 'signup' | 'profile' | 'tone';

interface SignUpPageProps {
  onComplete?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUpPage({ onComplete, onSwitchToLogin }: SignUpPageProps) {
  const { user, saveProfile } = useAuth();
  const [step, setStep] = useState<Step>('signup');
  const [profileData, setProfileData] = useState<{ artistName: string; genre: string; bio: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const STEP_NUM: Record<Step, number> = { signup: 1, profile: 2, tone: 3 };

  async function handleToneComplete(tone: ArtistTone) {
    if (!profileData) return;
    setSaving(true);
    await saveProfile({
      artist_name: profileData.artistName,
      genre: profileData.genre,
      bio: profileData.bio,
      tone,
      onboarding_complete: true,
    });
    setSaving(false);
    onComplete?.();
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Progress */}
      <div className="w-full max-w-xl flex gap-2 mb-16 relative z-10">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= STEP_NUM[step] ? 'bg-[#FFD700]' : 'bg-white/10'}`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <AnimatePresence mode="wait">
          {step === 'signup' && (
            <motion.div key="signup" className="w-full flex justify-center">
              <SignUpForm
                onSuccess={() => setStep('profile')}
                onSwitchToLogin={onSwitchToLogin ?? (() => {})}
              />
            </motion.div>
          )}
          {step === 'profile' && (
            <motion.div key="profile" className="w-full flex justify-center">
              <ArtistProfileForm
                initialName={user?.artistName}
                onComplete={data => { setProfileData(data); setStep('tone'); }}
              />
            </motion.div>
          )}
          {step === 'tone' && (
            <motion.div key="tone" className="w-full flex justify-center">
              <ToneSelectionOnboarding onComplete={handleToneComplete} loading={saving} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
