"use client"

import { useState } from "react"
import {
  Camera,
  MapPin,
  Link as LinkIcon,
  Globe,
  Plus,
  CheckCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  Music as MusicIcon
} from "lucide-react"
import { GlassAccountSettingsCard } from "../ui/glass-account-settings-card"

export function ProfileSection() {
  const [bio, setBio] = useState("Rising alternative pop artist based in Los Angeles. Crafting futuristic sounds for the new wave.")

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="max-w-xl">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Artist Profile</h2>
          <p className="text-white/40 font-medium text-lg leading-relaxed">Your public identity and industry credentials. Keep your assets and bio synced across all platforms.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-8 py-4 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
              Update Profile
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Left Column: Bio & Info */}
         <div className="lg:col-span-8 space-y-12">
            <div className="flex items-start gap-10 bg-zinc-900/20 border border-white/5 p-12 rounded-[3rem] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border border-white/10 relative">
                     <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Profile" />
                     <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera size={24} />
                     </button>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFD700] rounded-2xl flex items-center justify-center text-black border-4 border-black">
                     <CheckCircle size={18} strokeWidth={3} />
                  </div>
               </div>
               <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">ELARA</h3>
                    <p className="flex items-center gap-2 text-white/40 text-[11px] font-black uppercase tracking-widest">
                       <MapPin size={12} className="text-[#FFD700]" /> Los Angeles, CA
                    </p>
                  </div>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-white/60 font-medium leading-relaxed outline-none focus:border-[#FFD700]/30 transition-all resize-none"
                    rows={4}
                  />
                  <div className="flex gap-4">
                     {[
                       { icon: <Globe size={18} />, label: "@elara_sounds" },
                       { icon: <LinkIcon size={18} />, label: "@elara" },
                       { icon: <MusicIcon size={18} />, label: "ElaraOfficial" }
                     ].map((social, i) => (
                       <div key={i} className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-xl border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer">
                          {social.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{social.label}</span>
                       </div>
                     ))}
                     <button className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/20 hover:text-white transition-colors">
                        <Plus size={18} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-zinc-900/20 border border-white/5 p-10 rounded-[2.5rem]">
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8 border-b border-white/5 pb-4 flex items-center justify-between">
                     Industry Credentials <ChevronRight size={14} className="text-[#FFD700]" />
                  </h4>
                  <div className="space-y-6">
                     {[
                       { label: "PRO", val: "ASCAP" },
                       { label: "Publisher", val: "uP Publishing" },
                       { label: "Distribution", val: "Independent (via uP)" },
                       { label: "Booking", val: "GrounduP Agency" }
                     ].map((cred, i) => (
                       <div key={i} className="flex items-center justify-between group">
                          <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{cred.label}</span>
                          <span className="text-white font-bold text-sm tracking-tight group-hover:text-[#FFD700] transition-colors uppercase">{cred.val}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-zinc-900/20 border border-white/5 p-10 rounded-[2.5rem]">
                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8 border-b border-white/5 pb-4 flex items-center justify-between">
                     Verification Progress <ChevronRight size={14} className="text-[#FFD700]" />
                  </h4>
                  <div className="space-y-6">
                     {[
                       { label: "Email Verified", done: true },
                       { label: "Identity Check", done: true },
                       { label: "Catalog Audit", done: false },
                       { label: "Official Artist Profile", done: false }
                     ].map((step, i) => (
                       <div key={i} className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${step.done ? "bg-[#FFD700] border-transparent text-black" : "bg-white/5 border-white/10 text-transparent"}`}>
                             <CheckCircle size={12} strokeWidth={4} />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${step.done ? "text-white/60" : "text-white/20"}`}>{step.label}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Mini Stats/Links */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5">
               <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Official Links</h4>
               <div className="space-y-4">
                  {[
                    { label: "Official Website", icon: <Globe size={16} /> },
                    { label: "Smart Link", icon: <LinkIcon size={16} /> },
                    { label: "Latest Release", icon: <MusicIcon size={16} /> }
                  ].map((link, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-4">
                          {link.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                       </div>
                       <ExternalLink size={14} className="opacity-20" />
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-[#FFD700]/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 text-[#FFD700]/5">
                  <Clock size={80} />
               </div>
               <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8 relative z-10">Last Profile Sync</h4>
               <div className="relative z-10 space-y-2">
                  <p className="text-white font-black text-3xl tracking-tighter">4H AGO</p>
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">All platforms updated</p>
                  <div className="pt-6">
                    <button className="text-[#FFD700] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                       View Audit Log <ChevronRight size={14} />
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
      {/* Subscription & Account Settings */}
      <div>
        <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-6">Subscription</h3>
        <GlassAccountSettingsCard />
      </div>
    </div>
  )
}
