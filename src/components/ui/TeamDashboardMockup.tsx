import { Calendar, Users, Image as ImageIcon, Bell, Grid, Settings, ChevronRight } from 'lucide-react';

export function TeamDashboardMockup() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-10 bg-zinc-950 rounded-[40px] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-16 px-4">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#FFD700] rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-[0_0_30px_rgba(255,215,0,0.3)]">uP</div>
          <div>
            <h3 className="text-white font-black text-xl tracking-tighter uppercase">GrounduP</h3>
            <p className="text-[#FFD700] text-[11px] font-black tracking-[0.25em] opacity-80">MANAGEMENT OS</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-12 text-[12px] font-black text-white/30 uppercase tracking-[0.2em]">
          <span className="text-white border-b-2 border-[#FFD700] pb-2 cursor-pointer">Dashboard</span>
          <span className="hover:text-white transition-colors cursor-pointer">Rollouts</span>
          <span className="hover:text-white transition-colors cursor-pointer">Analytics</span>
          <span className="hover:text-white transition-colors cursor-pointer">Team</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-zinc-900/50 px-5 py-2.5 rounded-full border border-white/5 flex items-center gap-4">
            <div className="w-2.5 h-2.5 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_10px_#FFD700]" />
            <span className="text-white/60 font-black text-[10px] tracking-widest">LIVE SYNC</span>
          </div>
          <Bell className="text-white/20 hover:text-white transition-colors cursor-pointer" size={24} />
        </div>
      </div>

      <div className="flex gap-14">
        {/* Sidebar Icons */}
        <div className="flex flex-col gap-12 pt-4 px-2 border-r border-white/5 pr-12">
          <div className="text-[#FFD700] bg-[#FFD700]/10 p-3 rounded-2xl"><Grid size={28} /></div>
          <div className="text-white/20 hover:text-white/60 transition-colors cursor-pointer p-3"><Calendar size={28} /></div>
          <div className="text-white/20 hover:text-white/60 transition-colors cursor-pointer p-3"><Users size={28} /></div>
          <div className="text-white/20 hover:text-white/60 transition-colors cursor-pointer p-3"><ImageIcon size={28} /></div>
          <div className="mt-auto text-white/10 hover:text-white/40 transition-colors cursor-pointer p-3"><Settings size={28} /></div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-white text-6xl font-black mb-4 tracking-tighter leading-none">Team Rollout</h2>
              <p className="text-white/30 text-sm font-black uppercase tracking-[0.4em]">
                October 2026 • <span className="text-[#FFD700]">12 Active Deadlines</span>
              </p>
            </div>
            <div className="flex gap-4">
               <button className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Export</button>
               <button className="px-8 py-4 bg-[#FFD700] rounded-2xl text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.2)]">+ Add Event</button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-12">
            {/* Calendar View */}
            <div className="col-span-8 bg-zinc-900/20 rounded-[40px] border border-white/5 p-10 relative overflow-hidden group">
               <div className="grid grid-cols-7 gap-8 text-center text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-12">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
               </div>
               <div className="grid grid-cols-7 gap-y-12 gap-x-8 text-center">
                  {[...Array(31)].map((_, i) => (
                    <div key={i} className={`relative flex items-center justify-center aspect-square text-lg font-black ${i === 12 ? 'text-black' : 'text-white/40 hover:text-white transition-colors cursor-pointer'}`}>
                      {i === 12 && (
                        <div className="absolute inset-0 bg-[#FFD700] rounded-2xl scale-125 shadow-[0_0_40px_rgba(255,215,0,0.5)] rotate-3" />
                      )}
                      <span className="relative z-10">{i + 1}</span>
                      {i === 5 && <div className="absolute -bottom-4 w-2 h-2 bg-white/20 rounded-full" />}
                      {i === 22 && <div className="absolute -bottom-4 w-5 h-2 bg-white/10 rounded-full" />}
                    </div>
                  ))}
               </div>
               {/* Label for Release Day */}
               <div className="absolute top-[45%] right-10 transform -translate-y-1/2 pointer-events-none rotate-3">
                  <div className="bg-zinc-950 p-6 rounded-3xl border border-[#FFD700]/50 shadow-2xl animate-pulse">
                    <p className="text-[#FFD700] text-xs font-black uppercase tracking-widest leading-none mb-1">13 Oct</p>
                    <p className="text-white opacity-40 text-[10px] font-black uppercase tracking-tighter">Release Day</p>
                  </div>
               </div>
            </div>

            {/* Side Tasks */}
            <div className="col-span-4 space-y-8">
              <p className="text-white/20 text-xs font-black uppercase tracking-[0.4em] mb-6">Live Tasks</p>
              
              <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 group hover:border-[#FFD700]/30 transition-all hover:bg-zinc-900/60">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-white text-sm font-black uppercase tracking-tight leading-tight">Spotify Canvas<br/>Upload</h4>
                  <span className="text-[#FFD700] text-sm font-black">90%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#FFD700] w-[90%] shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                </div>
              </div>

              <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-white text-sm font-black uppercase tracking-tight leading-tight">Press Kit V2<br/>Distribution</h4>
                  <span className="text-white/40 text-sm font-black">45%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-white/20 w-[45%]" />
                </div>
              </div>

              <div className="mt-14 p-8 bg-[#FFD700] rounded-[32px] flex items-center justify-between group cursor-pointer overflow-hidden relative shadow-[0_20px_40px_rgba(255,215,0,0.15)]">
                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <div className="relative z-10">
                  <p className="text-black font-black text-lg uppercase tracking-tighter mb-1">Ready For Launch</p>
                  <p className="text-black/40 text-[10px] font-black uppercase tracking-widest">October 12, 2026</p>
                </div>
                <div className="relative z-10 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-[#FFD700] shadow-xl group-hover:scale-110 transition-transform">
                  <ChevronRight size={24} strokeWidth={4} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
