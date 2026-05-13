import { Calendar, CheckSquare, Users, Image as ImageIcon, Plus, MoreHorizontal, Bell } from 'lucide-react';

export const TeamDashboardMockup = () => {
  return (
    <div className="w-full aspect-[16/10] bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative group">
      {/* Top Bar */}
      <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A0A0A] bg-zinc-800" />
            ))}
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Team: Project Elara</span>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="w-3 h-3 text-gray-500" />
          <div className="w-6 h-6 rounded-md bg-[#FFD700]/10 flex items-center justify-center">
            <Plus className="w-3 h-3 text-[#FFD700]" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 border-r border-white/5 py-4 flex flex-col items-center gap-6 bg-zinc-900/20">
          <div className="w-8 h-8 rounded-xl bg-[#FFD700] flex items-center justify-center text-black font-black text-xs">uP</div>
          <Calendar className="w-4 h-4 text-gray-500" />
          <CheckSquare className="w-4 h-4 text-[#FFD700]" />
          <Users className="w-4 h-4 text-gray-500" />
          <ImageIcon className="w-4 h-4 text-gray-500" />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.02),transparent)]">
          
          {/* Calendar View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rollout Calendar</h4>
              <span className="text-[10px] text-[#FFD700] font-bold">OCT 2026</span>
            </div>
            <div className="bg-zinc-900/40 rounded-2xl border border-white/5 p-3 h-full max-h-[180px]">
              <div className="grid grid-cols-7 gap-1 h-full">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-white/5 flex flex-col items-center justify-center relative">
                    <span className="text-[8px] text-gray-700">{i + 1}</span>
                    {i === 12 && <div className="absolute w-1 h-1 rounded-full bg-[#FFD700] bottom-1 shadow-[0_0_8px_#FFD700]" />}
                    {i === 18 && <div className="absolute w-1 h-1 rounded-full bg-white bottom-1" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Tasks</h4>
            <div className="space-y-2">
              {[
                { task: 'Spotify Pitching', status: 'In Progress', progress: 80 },
                { task: 'EPK Finalization', status: 'Done', progress: 100 },
                { task: 'Tour Routing - NE', status: 'Pending', progress: 20 }
              ].map((t, i) => (
                <div key={i} className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-white">{t.task}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${t.progress === 100 ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-white/5 text-gray-500'}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFD700]" style={{ width: `${t.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Assets */}
          <div className="col-span-2 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shared Assets</h4>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-zinc-900 border border-white/5 relative overflow-hidden group/asset">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Asset_{i}.png</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-40 group-hover/asset:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-[#0A0A0A]" />
    </div>
  );
};
