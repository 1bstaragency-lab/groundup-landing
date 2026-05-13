"use client"

import { useState } from "react"
import { 
  Plus, 
  Upload, 
  Grid, 
  List, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music as MusicIcon,
  MoreVertical,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Wand2
} from "lucide-react"

const ASSETS = [
  { name: "Midnight_Sun_Master.wav", type: "audio", size: "45.2 MB", date: "May 12, 2026", icon: <MusicIcon className="text-blue-400" /> },
  { name: "Album_Cover_V3.png", type: "image", size: "8.1 MB", date: "May 11, 2026", icon: <ImageIcon className="text-purple-400" /> },
  { name: "Official_Visualizer_4K.mp4", type: "video", size: "1.2 GB", date: "May 10, 2026", icon: <Video className="text-[#FFD700]" /> },
  { name: "Press_Kit_Draft.pdf", type: "document", size: "2.4 MB", date: "May 09, 2026", icon: <File className="text-gray-400" /> },
  { name: "Tour_Poster_Design.ai", type: "image", size: "15.7 MB", date: "May 08, 2026", icon: <ImageIcon className="text-orange-400" /> }
]

export function StudioSection() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="max-w-xl">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Asset Bank</h2>
          <p className="text-white/40 font-medium text-lg leading-relaxed">Centralized storage for your masters, artwork, and creative content. Seamless team handoff.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-zinc-900 flex p-1 rounded-2xl border border-white/5 mr-4">
              <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-[#FFD700] text-black" : "text-white/20 hover:text-white"}`}><Grid size={18} /></button>
              <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-[#FFD700] text-black" : "text-white/20 hover:text-white"}`}><List size={18} /></button>
           </div>
           <button className="px-8 py-4 rounded-2xl bg-zinc-900 border border-white/5 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3">
              <Plus size={18} /> New Folder
           </button>
           <button className="px-8 py-4 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
              <Upload size={18} /> Upload Assets
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-zinc-900/40 border border-[#FFD700]/20 p-10 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-[#FFD700]">
               <Wand2 size={120} />
            </div>
            <div className="relative z-10">
               <div className="w-14 h-14 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#FFD700]/20">
                  <Sparkles className="text-[#FFD700]" />
               </div>
               <h3 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">AI Image Studio</h3>
               <p className="text-white/40 font-medium mb-8 leading-relaxed max-w-sm">Generate high-fidelity album art, press photos, and social assets in seconds.</p>
               <div className="flex gap-4">
                  <input type="text" placeholder="Describe your vision..." className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 font-medium text-xs text-white outline-none focus:border-[#FFD700]/30 transition-all" />
                  <button className="p-4 rounded-2xl bg-[#FFD700] text-black font-black hover:scale-105 transition-transform"><Plus size={20} /></button>
               </div>
            </div>
         </div>

         <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-white">
               <Video size={120} />
            </div>
            <div className="relative z-10">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                  <Video className="text-white" />
               </div>
               <h3 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">AI Video Gen</h3>
               <p className="text-white/40 font-medium mb-8 leading-relaxed max-w-sm">Create cinematic visualizers and lyric videos from your latest audio stems.</p>
               <div className="flex gap-4">
                  <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">New Visualizer</button>
                  <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">New Lyric Video</button>
               </div>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-8 py-4 px-8 bg-zinc-900/40 rounded-[2rem] border border-white/5">
         <div className="flex items-center gap-4 text-[#FFD700] font-black text-[10px] uppercase tracking-widest">
            <span className="opacity-40">Path:</span>
            <span>Root</span>
            <ChevronRight size={12} className="opacity-20" />
            <span className="opacity-40">Campaign:</span>
            <span>Midnight Sun</span>
         </div>
         <div className="h-4 w-px bg-white/10 ml-auto" />
         <div className="flex items-center gap-6">
            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Storage: 4.2 GB / 50 GB</span>
            <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
               <div className="bg-[#FFD700] h-full w-[8%]" />
            </div>
         </div>
      </div>

      <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-5" : "grid-cols-1"}`}>
         {ASSETS.map((asset, i) => (
           viewMode === "grid" ? (
             <div key={i} className="group bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-8 hover:border-[#FFD700]/30 transition-all duration-500 relative">
                <div className="flex justify-between items-start mb-10">
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {asset.icon}
                   </div>
                   <button className="text-white/10 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </div>
                <h3 className="text-sm font-black text-white truncate mb-2 group-hover:text-[#FFD700] transition-colors">{asset.name}</h3>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                   <span>{asset.type}</span>
                   <span>{asset.size}</span>
                </div>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300">
                   <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform"><Download size={20} /></button>
                   <button className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-110 transition-transform"><ExternalLink size={20} /></button>
                   <button className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-red-400 hover:scale-110 transition-transform"><Trash2 size={20} /></button>
                </div>
             </div>
           ) : (
             <div key={i} className="group bg-zinc-900/20 border border-white/5 rounded-3xl p-6 flex items-center gap-8 hover:border-[#FFD700]/30 transition-all">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">{asset.icon}</div>
                <div className="flex-1">
                   <h3 className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors">{asset.name}</h3>
                   <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1">{asset.type} • {asset.size}</p>
                </div>
                <div className="text-right">
                   <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Added</p>
                   <p className="text-white/60 font-bold text-[10px] mt-1 uppercase">{asset.date}</p>
                </div>
                <div className="flex items-center gap-4 ml-10">
                   <button className="p-3 text-white/20 hover:text-white transition-colors"><Download size={18} /></button>
                   <button className="p-3 text-white/20 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                </div>
             </div>
           )
         ))}
      </div>
    </div>
  )
}
