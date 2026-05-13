"use client"

import { useState, useRef } from "react"
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
  Wand2,
  Folder,
  X,
  Check,
  Layers,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import ImageGenerationForm from "./ImageGenerationForm"
import ImageGallery from "./ImageGallery"
import VideoGenerationForm from "./VideoGenerationForm"
import VideoGallery from "./VideoGallery"
import {
  generateImage,
  fetchUserImages,
  deleteImage,
  imageGenConfigured,
} from "../../lib/services/imageGenerationService"
import {
  generateVideo,
  fetchUserVideos,
  deleteVideo,
  videoGenConfigured,
} from "../../lib/services/videoGenerationService"
import type { GeneratedImage } from "../../types/imageGeneration.types"
import type { GeneratedVideo } from "../../types/videoGeneration.types"
import type { GenerateImageParams } from "../../types/imageGeneration.types"
import type { GenerateVideoParams } from "../../types/videoGeneration.types"

const ASSETS = [
  { name: "Midnight_Sun_Master.wav", type: "audio", size: "45.2 MB", date: "May 12, 2026", icon: <MusicIcon className="text-blue-400" /> },
  { name: "Album_Cover_V3.png", type: "image", size: "8.1 MB", date: "May 11, 2026", icon: <ImageIcon className="text-purple-400" /> },
  { name: "Official_Visualizer_4K.mp4", type: "video", size: "1.2 GB", date: "May 10, 2026", icon: <Video className="text-[#FFD700]" /> },
  { name: "Press_Kit_Draft.pdf", type: "document", size: "2.4 MB", date: "May 09, 2026", icon: <File className="text-gray-400" /> },
  { name: "Tour_Poster_Design.ai", type: "image", size: "15.7 MB", date: "May 08, 2026", icon: <ImageIcon className="text-orange-400" /> },
]

interface StudioFolder { id: string; name: string }
function uid() { return Math.random().toString(36).slice(2) }

type Tab = "assets" | "image" | "video"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "assets", label: "Asset Bank",    icon: <Layers size={14} /> },
  { id: "image",  label: "Image Studio",  icon: <Sparkles size={14} /> },
  { id: "video",  label: "Video Studio",  icon: <Video size={14} /> },
]

export function StudioSection() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("assets")

  // Asset Bank state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [folders, setFolders] = useState<StudioFolder[]>([])
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [folderName, setFolderName] = useState("")

  // Image Studio state
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [imgLoading, setImgLoading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [, setImageRef] = useState<string | null>(null)

  // Video Studio state
  const [videos, setVideos] = useState<GeneratedVideo[]>([])
  const [vidLoading, setVidLoading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [, setVideoRef] = useState<string | null>(null)

  // Load images/videos lazily when tab is first opened
  const [imgLoaded, setImgLoaded] = useState(false)
  const [vidLoaded, setVidLoaded] = useState(false)

  async function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    if (tab === "image" && !imgLoaded && user) {
      setImgLoaded(true)
      const existing = await fetchUserImages(user.id)
      setImages(existing)
    }
    if (tab === "video" && !vidLoaded && user) {
      setVidLoaded(true)
      const existing = await fetchUserVideos(user.id)
      setVideos(existing)
    }
  }

  async function handleGenerateImage(params: GenerateImageParams) {
    if (!user) return
    setImgLoading(true)
    try {
      const img = await generateImage(params, user.id)
      setImages(prev => [img, ...prev])
    } finally {
      setImgLoading(false)
    }
  }

  async function handleDeleteImage(id: string) {
    await deleteImage(id)
    setImages(prev => prev.filter(i => i.id !== id))
  }

  async function handleGenerateVideo(params: GenerateVideoParams) {
    if (!user) return
    setVidLoading(true)
    try {
      const vid = await generateVideo(params, user.id)
      setVideos(prev => [vid, ...prev])
    } finally {
      setVidLoading(false)
    }
  }

  async function handleDeleteVideo(id: string) {
    await deleteVideo(id)
    setVideos(prev => prev.filter(v => v.id !== id))
  }

  function createFolder() {
    if (!folderName.trim()) return
    setFolders(prev => [...prev, { id: uid(), name: folderName.trim() }])
    setFolderName("")
    setShowFolderInput(false)
  }

  function removeFolder(id: string) {
    setFolders(prev => prev.filter(f => f.id !== id))
  }

  function handleImageRef(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setImageRef(file.name)
  }

  function handleVideoRef(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setVideoRef(file.name)
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-3 uppercase">Studio</h2>
          <p className="text-white/40 font-medium text-base leading-relaxed">Asset storage, AI image generation, and AI video creation — all in one place.</p>
        </div>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-2 bg-zinc-900/60 border border-white/8 rounded-2xl p-1.5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "bg-[#FFD700] text-black"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "assets" && (
          <motion.div
            key="assets"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-8"
          >
            {/* Asset Bank toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-zinc-900 flex p-1 rounded-2xl border border-white/5">
                <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-[#FFD700] text-black" : "text-white/20 hover:text-white"}`}><Grid size={16} /></button>
                <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-[#FFD700] text-black" : "text-white/20 hover:text-white"}`}><List size={16} /></button>
              </div>
              <button
                onClick={() => setShowFolderInput(true)}
                className="px-5 py-2.5 rounded-2xl bg-zinc-900 border border-white/5 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Plus size={14} /> New Folder
              </button>
              <button className="px-5 py-2.5 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
                <Upload size={14} /> Upload Assets
              </button>
            </div>

            <AnimatePresence>
              {showFolderInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 bg-zinc-900/60 border border-[#FFD700]/20 rounded-2xl"
                >
                  <Folder size={18} className="text-[#FFD700] shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Folder name..."
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowFolderInput(false) }}
                    className="flex-1 bg-transparent outline-none text-white font-bold text-sm placeholder:text-white/20"
                  />
                  <button onClick={createFolder} className="p-2 bg-[#FFD700] rounded-xl text-black hover:scale-105 transition-transform"><Check size={14} /></button>
                  <button onClick={() => setShowFolderInput(false)} className="p-2 text-white/20 hover:text-white transition-colors"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {folders.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Folders</p>
                  <div className="flex flex-wrap gap-3">
                    {folders.map(f => (
                      <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group flex items-center gap-3 px-4 py-2.5 bg-zinc-900/40 border border-white/5 rounded-2xl hover:border-[#FFD700]/30 transition-all cursor-pointer"
                      >
                        <Folder size={14} className="text-[#FFD700]" />
                        <span className="text-white font-black text-[11px] uppercase tracking-wide">{f.name}</span>
                        <button onClick={() => removeFolder(f.id)} className="opacity-0 group-hover:opacity-100 ml-1 text-white/20 hover:text-red-400 transition-all">
                          <X size={11} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Storage bar */}
            <div className="flex flex-wrap items-center gap-4 py-3 px-6 bg-zinc-900/40 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 text-[#FFD700] font-black text-[10px] uppercase tracking-widest">
                <span className="opacity-40">Path:</span>
                <span>Root</span>
                <ChevronRight size={10} className="opacity-20" />
                <span className="opacity-40">Assets</span>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">4.2 GB / 50 GB</span>
                <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#FFD700] h-full w-[8%]" />
                </div>
              </div>
            </div>

            {/* File grid/list */}
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-1"}`}>
              {ASSETS.map((asset, i) => (
                viewMode === "grid" ? (
                  <div key={i} className="group bg-zinc-900/20 border border-white/5 rounded-3xl p-6 hover:border-[#FFD700]/30 transition-all relative">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {asset.icon}
                      </div>
                      <button className="text-white/10 hover:text-white transition-colors"><MoreVertical size={14} /></button>
                    </div>
                    <h3 className="text-xs font-black text-white truncate mb-1 group-hover:text-[#FFD700] transition-colors">{asset.name}</h3>
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
                      <span>{asset.type}</span>
                      <span>{asset.size}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all">
                      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform"><Download size={16} /></button>
                      <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-110 transition-transform"><ExternalLink size={16} /></button>
                      <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-400 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="group bg-zinc-900/20 border border-white/5 rounded-2xl p-4 flex items-center gap-6 hover:border-[#FFD700]/30 transition-all">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">{asset.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors truncate">{asset.name}</h3>
                      <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">{asset.type} · {asset.size}</p>
                    </div>
                    <p className="text-white/20 text-[9px] font-black uppercase hidden sm:block">{asset.date}</p>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-white/20 hover:text-white transition-colors"><Download size={16} /></button>
                      <button className="p-2 text-white/20 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                    </div>
                  </div>
                )
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "image" && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-8"
          >
            {/* Hidden legacy ref input */}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageRef} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-zinc-900/40 border border-[#FFD700]/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-[#FFD700] pointer-events-none">
                  <Wand2 size={100} />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#FFD700]/10 rounded-xl flex items-center justify-center border border-[#FFD700]/20">
                      <Sparkles size={16} className="text-[#FFD700]" />
                    </div>
                    <div>
                      <h3 className="font-black text-white uppercase tracking-tight">Image Studio</h3>
                      <p className="text-gray-500 text-xs">Album art, press photos, social assets</p>
                    </div>
                  </div>
                  <ImageGenerationForm
                    onGenerate={handleGenerateImage}
                    loading={imgLoading}
                    configured={imageGenConfigured}
                  />
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Generated Images</h3>
                <ImageGallery images={images} onDelete={handleDeleteImage} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-8"
          >
            <input ref={videoInputRef} type="file" accept="video/*,image/*" className="hidden" onChange={handleVideoRef} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-zinc-900/40 border border-white/8 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-white pointer-events-none">
                  <Video size={100} />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Video size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white uppercase tracking-tight">Video Studio</h3>
                      <p className="text-gray-500 text-xs">Visualizers, lyric videos, teasers</p>
                    </div>
                  </div>
                  <VideoGenerationForm
                    onGenerate={handleGenerateVideo}
                    loading={vidLoading}
                    configured={videoGenConfigured}
                  />
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Generated Videos</h3>
                <VideoGallery videos={videos} onDelete={handleDeleteVideo} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
