import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingPage } from '../components/ui/pricing-page';
import { handlePricingClick } from '../lib/pricingCheckout';
import { useAuth } from '../hooks/useAuth';

function PricingStandalonePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [err, setErr] = useState<string | null>(null);

  async function onPlanSelect(planName: string) {
    setErr(null);
    const result = await handlePricingClick({
      planName,
      userId:   user?.id ?? null,
      navigate,
    });
    if (result?.message) setErr(result.message);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <a href="/" className="text-white font-black text-sm uppercase tracking-tighter">GrounduP</a>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <a href="/login" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Sign In</a>
              <a href="/signup" className="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform">Get Started</a>
            </>
          ) : (
            <a href="/dashboard/home" className="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform">Dashboard</a>
          )}
        </div>
      </header>
      <main className="px-6 py-16">
        <PricingPage onSelect={onPlanSelect} />
        {err && (
          <p className="text-center text-[#FFD700]/70 text-xs font-medium mt-6 max-w-md mx-auto">
            {err}
          </p>
        )}
      </main>
    </div>
  );
}

export default PricingStandalonePage;
