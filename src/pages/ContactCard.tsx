
export function ContactCardPage() {
  function handleAdd() {
    const a = document.createElement('a')
    a.href = '/up.vcf'
    a.download = 'uP.vcf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6 text-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.08)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-xs w-full">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10">
            <img
              src="/up-avatar.png"
              alt="uP"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if avatar missing
                const t = e.currentTarget
                t.style.display = 'none'
              }}
            />
          </div>
          {/* iMessage bubble badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1ebe5d] rounded-full flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
        </div>

        {/* Name + org */}
        <div className="flex flex-col gap-1">
          <h1 className="text-white text-4xl font-black tracking-tight">uP</h1>
          <p className="text-white/40 text-sm font-medium tracking-widest uppercase">GrounduP</p>
        </div>

        {/* Description */}
        <p className="text-white/60 text-base leading-relaxed">
          Your daily music career assistant — streams, releases, ads, and Spotify pitching. All from iMessage.
        </p>

        {/* CTA */}
        <button
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl font-bold text-base bg-[#FFD700] text-black active:scale-95 hover:bg-[#f0c800] transition-all duration-200"
        >
          Add uP to Contacts
        </button>

        <p className="text-white/20 text-xs">
          Tap the button, then tap <strong className="text-white/30">Add Contact</strong> in the sheet that appears.
        </p>
      </div>
    </div>
  )
}
