"use client"

import { useState } from "react"
import { Bookmark, TrendingUp, Play, Share2, Filter, Sparkles, ChevronRight } from "lucide-react"

const CATEGORIES = ["All Patterns", "TikTok Growth", "Spotify Algo", "Touring", "Distribution", "PR & Press"]

const ARTICLES = [
  {
    title: "The TikTok-to-DSP Pipeline",
    category: "TikTok Growth",
    difficulty: "Advanced",
    readTime: "8 min",
    pattern: "Pattern #87",
    success: "92%",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop"
  },
  {
    title: "Cracking the Release Radar",
    category: "Spotify Algo",
    difficulty: "Intermediate",
    readTime: "12 min",
    pattern: "Pattern #42",
    success: "88%",
    image: "https://images.unsplash.com/photo-1614680376593-902f74cc0d41?q=80&w=400&auto=format&fit=crop"
  },
  {
    title: "High-Engagement Visualizers",
    category: "Content Studio",
    difficulty: "Beginner",
    readTime: "5 min",
    pattern: "Pattern #12",
    success: "95%",
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400&auto=format&fit=crop"
  }
]

export function LearnSection() {
  const [activeCategory, setActiveCategory] = useState("All Patterns")

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Patterns", val: "142", icon: <TrendingUp className="text-[#FFD700]" /> },
          { label: "Bookmarked Guides", val: "12", icon: <Bookmark className="text-[#FFD700]" /> },
          { label: "Success Rate", val: "89%", icon: <Sparkles className="text-[#FFD700]" /> }
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl">
             <div className="flex items-center justify-between mb-4">
                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                {s.icon}
             </div>
             <div className="text-4xl font-black text-white">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Database Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="max-w-xl">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Knowledge Database</h2>
          <p className="text-white/40 font-medium text-lg leading-relaxed">Access our full library of industry-verified rollout patterns, growth strategies, and infrastructure guides.</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/60 p-2 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
           {CATEGORIES.map(cat => (
             <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat ? "bg-[#FFD700] text-black" : "text-white/20 hover:text-white"
                }`}
             >
                {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Database Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {ARTICLES.map((art, i) => (
           <div key={i} className="group bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#FFD700]/30 transition-all duration-500">
              <div className="h-56 relative overflow-hidden">
                 <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={art.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                 <div className="absolute top-6 left-6">
                    <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white">
                       {art.category}
                    </div>
                 </div>
                 <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/20">{art.pattern}</span>
                    <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                       <TrendingUp size={12} className="text-[#FFD700]" />
                       {art.success} Success
                    </div>
                 </div>
              </div>
              <div className="p-8">
                 <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-[#FFD700] transition-colors">{art.title}</h3>
                 <div className="flex items-center gap-6 mb-8 text-white/20 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Play size={12} /> {art.readTime}</span>
                    <span className="flex items-center gap-2"><Filter size={12} /> {art.difficulty}</span>
                 </div>
                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <button className="flex items-center gap-2 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">
                       Access Guide <ChevronRight size={14} />
                    </button>
                    <div className="flex gap-4">
                       <button className="text-white/20 hover:text-white transition-colors"><Bookmark size={16} /></button>
                       <button className="text-white/20 hover:text-white transition-colors"><Share2 size={16} /></button>
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  )
}
