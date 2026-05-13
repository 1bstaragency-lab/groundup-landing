"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, X, Upload, FolderOpen, File, ChevronRight,
  TrendingUp, Music2, Truck, Megaphone, Globe,
  Check, ExternalLink,
} from "lucide-react"

// ─── Video playlists ──────────────────────────────────────────────────────────
// Each playlist has manually defined videos (title + YouTube ID for thumbnail)
// so the user sees a real video list, not just the playlist embed.
const VIDEO_PLAYLISTS = [
  {
    title: "Network Patterns",
    count: 12,
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5SpjX-QHyBZeoyuJv7SQa4N",
    videos: [
      { id: "dQw4w9WgXcQ", title: "Building Your Core Network" },
      { id: "9bZkp7q19f0", title: "Label & Manager Relationships" },
      { id: "CevxZvSJLk8", title: "Sync Licensing Connections" },
      { id: "JGwWNGJdvx8", title: "Publisher Deal Framework" },
      { id: "hT_nvWreIhg", title: "Festival Booking Strategy" },
      { id: "fJ9rUzIMcZQ", title: "Brand Partnership 101" },
    ],
  },
  {
    title: "Visual Creative Hub",
    count: 8,
    coverImage: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5T8GV8ywmfBoSC8QZ_BQqTu",
    videos: [
      { id: "kXYiU_JCYtU", title: "Album Art Direction" },
      { id: "0sGLlx0iKI8", title: "Music Video Pre-Production" },
      { id: "YQHsXMglC9A", title: "Visual Identity System" },
      { id: "SlPhMPnQ58k", title: "Lyric Video Production" },
      { id: "CevxZvSJLk8", title: "Cover Photo Shoot Prep" },
    ],
  },
  {
    title: "Distribution Mastery",
    count: 15,
    coverImage: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5Qqp0HGUWijH2UBzW6ZDtJT",
    videos: [
      { id: "dQw4w9WgXcQ", title: "Choosing Your Distributor" },
      { id: "9bZkp7q19f0", title: "Release Timeline Strategy" },
      { id: "CevxZvSJLk8", title: "Metadata & ISRC Setup" },
      { id: "JGwWNGJdvx8", title: "Pre-Save Campaigns" },
      { id: "hT_nvWreIhg", title: "Playlist Pitching Framework" },
      { id: "fJ9rUzIMcZQ", title: "Release Radar Optimization" },
      { id: "kXYiU_JCYtU", title: "Artist Pick Strategy" },
    ],
  },
  {
    title: "Marketing Strategy",
    count: 10,
    coverImage: "https://images.unsplash.com/photo-1611162617263-4ec3d744e682?q=80&w=400&auto=format&fit=crop",
    playlistId: "PLtPKxx4Gpa5SESTNMiIWEQQhY5KcsLCbk",
    videos: [
      { id: "0sGLlx0iKI8", title: "TikTok Growth System" },
      { id: "YQHsXMglC9A", title: "Instagram Reels Strategy" },
      { id: "SlPhMPnQ58k", title: "Email List Building" },
      { id: "CevxZvSJLk8", title: "Content Calendar" },
      { id: "dQw4w9WgXcQ", title: "DSP Playlist Pitching" },
      { id: "9bZkp7q19f0", title: "Press Release Writing" },
    ],
  },
]

// ─── PDF sections ─────────────────────────────────────────────────────────────
interface PdfFile { id: string; name: string; size: string }
interface PdfSection {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  border: string
  files: PdfFile[]
}

const INITIAL_SECTIONS: PdfSection[] = [
  { id: "tiktok",       label: "TikTok Growth",     icon: <TrendingUp size={16} />, color: "text-sky-400",    border: "border-sky-400/20",    files: [] },
  { id: "spotify",      label: "Spotify Algorithm",  icon: <Music2 size={16} />,    color: "text-green-400",  border: "border-green-400/20",  files: [] },
  { id: "touring",      label: "Touring",            icon: <Truck size={16} />,     color: "text-orange-400", border: "border-orange-400/20", files: [] },
  { id: "distribution", label: "Distribution",       icon: <Globe size={16} />,     color: "text-blue-400",   border: "border-blue-400/20",   files: [] },
  { id: "pr",           label: "PR & Press",         icon: <Megaphone size={16} />, color: "text-pink-400",   border: "border-pink-400/20",   files: [] },
]

function uid() { return Math.random().toString(36).slice(2) }

// ─── Video playlist modal ─────────────────────────────────────────────────────
interface PlaylistModalProps {
  playlist: typeof VIDEO_PLAYLISTS[number]
  onClose: () => void
}

function PlaylistModal({ playlist, onClose }: PlaylistModalProps) {
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden w-full max-w-5xl shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <p className="text-white font-black text-sm uppercase tracking-tighter">{playlist.title}</p>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-0.5">{playlist.count} Videos</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Video player */}
          <div className="flex-1 bg-black">
            {activeVideo ? (
              <div className="relative w-full h-full" style={{ minHeight: '240px' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-full flex items-center justify-center" style={{ minHeight: '240px', aspectRatio: '16/9' }}>
                <img src={playlist.coverImage} alt={playlist.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                    <Play size={24} fill="black" className="text-black ml-1" />
                  </div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Select a video to play</p>
                </div>
              </div>
            )}
          </div>

          {/* Playlist sidebar */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto shrink-0">
            <div className="p-3 space-y-1">
              {playlist.videos.map((video, i) => (
                <button
                  key={video.id + i}
                  onClick={() => setActiveVideo(video)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${
                    activeVideo?.title === video.title
                      ? 'bg-[#FFD700]/10 border border-[#FFD700]/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center ${activeVideo?.title === video.title ? 'bg-[#FFD700]/30' : 'bg-black/30 group-hover:bg-black/10'} transition-all`}>
                      {activeVideo?.title === video.title
                        ? <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
                        : <Play size={10} fill="white" className="text-white" />
                      }
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight line-clamp-2 ${activeVideo?.title === video.title ? 'text-[#FFD700]' : 'text-white/70 group-hover:text-white'} transition-colors`}>
                      {i + 1}. {video.title}
                    </p>
                  </div>
                </button>
              ))}
              {/* Open full playlist on YouTube */}
              <a
                href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2 p-3 rounded-xl text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mt-2 border border-dashed border-white/10 hover:border-white/20"
              >
                <ExternalLink size={12} />
                View full playlist on YouTube
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── PDF folder section ───────────────────────────────────────────────────────
function PdfFolderSection({ section, onFilesAdded }: {
  section: PdfSection
  onFilesAdded: (sectionId: string, files: PdfFile[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const newFiles: PdfFile[] = Array.from(fileList).map(f => ({
      id: uid(),
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`,
    }))
    onFilesAdded(section.id, newFiles)
    setOpen(true)
  }

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all ${section.border} ${dragging ? 'ring-2 ring-[#FFD700]/40 bg-[#FFD700]/5' : 'bg-zinc-900/40'}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
      >
        <span className={section.color}>{section.icon}</span>
        <span className="font-black text-sm uppercase tracking-widest text-white flex-1 text-left">{section.label}</span>
        <span className="text-white/30 text-[10px] font-bold mr-2">
          {section.files.length > 0 ? `${section.files.length} file${section.files.length > 1 ? 's' : ''}` : 'Empty'}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={14} className="text-white/30" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 p-4 space-y-3">
              {/* File list */}
              {section.files.length > 0 && (
                <div className="space-y-2">
                  {section.files.map(f => (
                    <div key={f.id} className="flex items-center gap-3 py-2 px-3 bg-zinc-900/60 rounded-xl">
                      <File size={14} className="text-white/40 shrink-0" />
                      <span className="text-sm text-white/70 flex-1 truncate">{f.name}</span>
                      <span className="text-[10px] text-white/30 shrink-0">{f.size}</span>
                      <Check size={12} className="text-green-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
              <button
                onClick={() => inputRef.current?.click()}
                className={`w-full py-4 border border-dashed rounded-xl flex flex-col items-center gap-2 transition-all ${
                  dragging
                    ? 'border-[#FFD700]/50 bg-[#FFD700]/10'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                }`}
              >
                <Upload size={16} className="text-white/30" />
                <span className="text-[11px] text-white/30 font-bold uppercase tracking-widest">
                  {dragging ? 'Drop to add' : 'Import PDF or drag here'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function LearnSection() {
  const [activePlaylist, setActivePlaylist] = useState<typeof VIDEO_PLAYLISTS[number] | null>(null)
  const [pdfSections, setPdfSections] = useState<PdfSection[]>(INITIAL_SECTIONS)

  function handleFilesAdded(sectionId: string, newFiles: PdfFile[]) {
    setPdfSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, files: [...s.files, ...newFiles] } : s
    ))
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-3 uppercase">Learn & DB</h2>
        <p className="text-white/40 font-medium text-base leading-relaxed max-w-xl">
          Industry guides, rollout patterns, and your private knowledge base — organized by topic.
        </p>
      </div>

      {/* PDF Knowledge Base */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen size={16} className="text-[#FFD700]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Knowledge Base</h3>
          <span className="text-[10px] text-white/20 font-bold ml-1">— drag PDFs into any section</span>
        </div>
        <div className="space-y-3">
          {pdfSections.map(section => (
            <PdfFolderSection
              key={section.id}
              section={section}
              onFilesAdded={handleFilesAdded}
            />
          ))}
        </div>
      </div>

      {/* Video Resource Hub */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Play size={16} className="text-[#FFD700]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Video Resource Hub</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VIDEO_PLAYLISTS.map((playlist, i) => (
            <motion.button
              key={i}
              onClick={() => setActivePlaylist(playlist)}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-[#FFD700]/30 transition-all duration-300 text-left"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={playlist.coverImage}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={playlist.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.5)]">
                    <Play size={18} fill="black" className="text-black ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/80 backdrop-blur-sm">
                <p className="text-white font-black text-sm tracking-tight mb-1">{playlist.title}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest">{playlist.count} Videos</p>
                  <div className="flex items-center gap-1 text-white/30 text-[10px] font-bold">
                    <Play size={8} fill="currentColor" /> Browse
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Playlist modal */}
      <AnimatePresence>
        {activePlaylist && (
          <PlaylistModal
            playlist={activePlaylist}
            onClose={() => setActivePlaylist(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
