"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]

const EVENTS = [
  { day: 12, title: "Release: Midnight Sun", type: "Release", color: "bg-[#FFD700] text-black" },
  { day: 14, title: "TikTok Campaign Launch", type: "Social", color: "bg-white/10 text-white" },
  { day: 18, title: "Press Kit Delivery", type: "PR", color: "bg-[#FFD700]/20 text-[#FFD700]" },
  { day: 22, title: "Team Strategy Sync", type: "Meeting", color: "bg-white/5 text-white/40" },
]

export function SchedulerSection() {
  const [currentMonth] = useState(4) // May

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="max-w-xl">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Campaign Scheduler</h2>
          <p className="text-white/40 font-medium text-lg leading-relaxed">Coordinate your releases, content drops, and team meetings in one high-fidelity timeline.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={20} />
           </button>
           <div className="bg-zinc-900 px-8 py-4 rounded-2xl border border-white/5 font-black text-xs uppercase tracking-[0.3em] text-white">
              {MONTHS[currentMonth]} 2026
           </div>
           <button className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-white/40 hover:text-white transition-colors">
              <ChevronRight size={20} />
           </button>
           <button className="ml-6 p-4 rounded-2xl bg-[#FFD700] text-black font-black flex items-center gap-2 hover:scale-105 transition-transform">
              <Plus size={20} /> <span className="text-[10px] uppercase tracking-widest">New Event</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Main Calendar Grid */}
         <div className="lg:col-span-8 bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 backdrop-blur-3xl overflow-x-auto">
            <div className="min-w-[800px]">
               <div className="grid grid-cols-7 gap-4 mb-8">
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-white/20 tracking-widest uppercase py-4">{day}</div>
                  ))}
               </div>
               <div className="grid grid-cols-7 gap-4 auto-rows-fr">
                  {Array.from({ length: 31 }).map((_, i) => {
                    const dayNum = i + 1
                    const event = EVENTS.find(e => e.day === dayNum)
                    return (
                      <div key={i} className={`min-h-[140px] rounded-2xl border p-4 transition-all duration-300 relative group ${
                        event ? "border-white/10 bg-white/5" : "border-white/5 hover:border-white/10 hover:bg-white/5"
                      }`}>
                         <span className={`text-xs font-black ${event ? "text-white" : "text-white/20 group-hover:text-white/40"}`}>{dayNum}</span>
                         {event && (
                           <div className={`mt-4 p-3 rounded-xl text-[9px] font-black leading-tight uppercase tracking-tight ${event.color}`}>
                              {event.title}
                           </div>
                         )}
                         {dayNum === 12 && (
                           <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]" />
                         )}
                      </div>
                    )
                  })}
               </div>
            </div>
         </div>

         {/* Right Column: Upcoming Tasks */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/40 border border-[#FFD700]/20 p-8 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 text-[#FFD700]/10">
                  <Clock size={60} />
               </div>
               <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3">
                  Next Up <span className="text-[#FFD700] text-[10px] bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/20">Live</span>
               </h3>
               
               <div className="space-y-6">
                  {EVENTS.slice(0, 3).map((ev, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                       <div className="flex flex-col items-center">
                          <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
                          <div className="w-px h-full bg-white/5 my-2" />
                       </div>
                       <div>
                          <p className="text-white font-bold text-sm tracking-tight mb-1 group-hover:text-[#FFD700] transition-colors">{ev.title}</p>
                          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Starts in 4 hours • {ev.type}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="pt-6 border-t border-white/5 mt-6">
                  <button className="w-full py-4 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform">
                     Notify Me / Text Me
                  </button>
               </div>
            </div>

            <div className="bg-zinc-950/60 border border-white/5 p-8 rounded-[2.5rem]">
               <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Recent Team Activity</h3>
               <div className="space-y-8">
                  {[
                    { user: "KAIXO", msg: "Uploaded new master for 'Sun'", time: "2m ago" },
                    { user: "LYRA", msg: "Visualizer V3 is approved", time: "1h ago" },
                    { user: "NOVA", msg: "Requested budget review", time: "3h ago" }
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
                       <div className="flex-1">
                          <p className="text-white font-bold text-xs tracking-tight"><span className="text-[#FFD700] uppercase text-[10px] mr-2">{act.user}</span> {act.msg}</p>
                          <p className="text-white/10 text-[9px] font-black uppercase tracking-widest">{act.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
