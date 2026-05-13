import { Calendar, Users, Image as ImageIcon, Plus, Bell, Search, Settings, LayoutGrid, ChevronRight } from 'lucide-react';

export const TeamDashboardMockup = () => {
  return (
    <div className="w-full aspect-[16/10] bg-[#0A0A0A] rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(255,215,0,0.05)] relative">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-[#FFD700] flex items-center justify-center">
                <span className="text-[10px] font-black text-black">uP</span>
             </div>
             <span className="text-xs font-black tracking-tighter text-white">GROUNDUP OS</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
             <span className="text-white">DASHBOARD</span>
             <span className="hover:text-white transition-colors cursor-pointer">ANALYTICS</span>
             <span className="hover:text-white transition-colors cursor-pointer">TEAM</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
             <Search className="w-3 h-3 text-gray-500 mr-2" />
             <span className="text-[10px] text-gray-500 uppercase font-black">Search...</span>
          </div>
          <Bell className="w-4 h-4 text-gray-400" />
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-[#FFD700]/30 overflow-hidden">
             <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/20 to-transparent" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Compact Sidebar */}
        <div className="w-16 border-r border-white/5 py-6 flex flex-col items-center gap-8 bg-zinc-900/10">
          <LayoutGrid className="w-5 h-5 text-[#FFD700]" />
          <Calendar className="w-5 h-5 text-gray-600 hover:text-white transition-colors cursor-pointer" />
          <Users className="w-5 h-5 text-gray-600 hover:text-white transition-colors cursor-pointer" />
          <ImageIcon className="w-5 h-5 text-gray-600 hover:text-white transition-colors cursor-pointer" />
          <div className="mt-auto mb-4 space-y-6">
             <Settings className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Main Content Dashboard */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.03),transparent)]">
          
          {/* Left Column: Calendar & Management */}
          <div className="col-span-8 space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black tracking-tighter text-white">Team Rollout</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">October 2026 • 12 Active Deadlines</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Export</button>
                  <button className="px-4 py-2 bg-[#FFD700] rounded-xl text-[10px] font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,215,0,0.2)]">+ Add Event</button>
               </div>
            </div>

            <div className="bg-zinc-900/30 rounded-3xl border border-white/5 p-6 backdrop-blur-xl">
               <div className="grid grid-cols-7 gap-4 mb-4">
                  {['S','M','T','W','T','F','S'].map(d => (
                     <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase">{d}</div>
                  ))}
               </div>
               <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-2xl border border-white/5 flex flex-col p-2 relative group/cell hover:bg-white/5 transition-all cursor-pointer ${i === 12 ? 'bg-[#FFD700]/5 border-[#FFD700]/20' : ''}`}>
                      <span className={`text-[10px] font-bold ${i === 12 ? 'text-[#FFD700]' : 'text-gray-500'}`}>{i + 1}</span>
                      {i === 12 && (
                         <div className="mt-auto">
                            <div className="h-1 w-full bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]" />
                            <span className="text-[6px] font-black uppercase text-[#FFD700] mt-1 block">Release Day</span>
                         </div>
                      )}
                      {i === 5 && <div className="mt-auto h-1 w-2 bg-white/40 rounded-full" />}
                      {i === 22 && <div className="mt-auto h-1 w-4 bg-white/40 rounded-full" />}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Column: Tasks & Assets */}
          <div className="col-span-4 space-y-6">
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Tasks</h4>
                <div className="space-y-3">
                   {[
                      { name: 'Spotify Canvas Upload', val: 90, color: '#FFD700' },
                      { name: 'Press Kit V2 Distribution', val: 45, color: '#FFFFFF' },
                      { name: 'Merch Drop Logistics', val: 15, color: '#FFFFFF' }
                   ].map((t, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 group/task hover:border-[#FFD700]/20 transition-all">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">{t.name}</span>
                            <span className="text-[10px] font-black text-gray-500">{t.val}%</span>
                         </div>
                         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full transition-all duration-1000" style={{ width: `${t.val}%`, backgroundColor: t.color, boxShadow: t.color === '#FFD700' ? '0 0 10px #FFD700' : 'none' }} />
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Shared Assets</h4>
                <div className="grid grid-cols-2 gap-4">
                   {[1, 2].map((i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden group/asset cursor-pointer">
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                         <div className="absolute bottom-3 left-3">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white">Album_Master_V{i}</span>
                            <div className="flex gap-1 mt-1">
                               <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                               <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                            </div>
                         </div>
                         <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover/asset:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 text-[#FFD700]" />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Glass Corner Overlay */}
      <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-4">
         <div className="w-10 h-10 rounded-full border-2 border-[#FFD700] flex items-center justify-center p-1">
            <div className="w-full h-full rounded-full bg-[#FFD700] flex items-center justify-center">
               <ChevronRight className="w-4 h-4 text-black" />
            </div>
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Ready for Launch</p>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">OCTOBER 12, 2026</p>
         </div>
      </div>
    </div>
  );
};
