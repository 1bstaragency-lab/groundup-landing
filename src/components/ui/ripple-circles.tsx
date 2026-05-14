"use client"

export function RippleCircles() {
  return (
    <div className="relative h-[160px] aspect-square">
      <style>{`
        @keyframes ripple {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 10px rgba(255,215,0,0.1); }
          50%       { transform: scale(1.3); box-shadow: 0 30px 20px rgba(255,215,0,0.15); }
        }
      `}</style>
      <span className="absolute inset-[40%] rounded-full border border-[#FFD700]/80 animate-[ripple_2s_infinite_ease-in-out] bg-[#FFD700]/10 z-[98]" />
      <span className="absolute inset-[30%] rounded-full border border-[#FFD700]/60 animate-[ripple_2s_infinite_ease-in-out_0.2s] bg-[#FFD700]/5 z-[97]" />
      <span className="absolute inset-[20%] rounded-full border border-[#FFD700]/40 animate-[ripple_2s_infinite_ease-in-out_0.4s] bg-[#FFD700]/5 z-[96]" />
      <span className="absolute inset-[10%] rounded-full border border-[#FFD700]/25 animate-[ripple_2s_infinite_ease-in-out_0.6s] bg-[#FFD700]/5 z-[95]" />
      <span className="absolute inset-0     rounded-full border border-[#FFD700]/15 animate-[ripple_2s_infinite_ease-in-out_0.8s] bg-[#FFD700]/5 z-[94]" />
    </div>
  )
}
