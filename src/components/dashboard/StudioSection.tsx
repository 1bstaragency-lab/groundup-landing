"use client"

import { useEffect, useRef, useState } from "react"
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
  Folder,
  X,
  Check,
  Layers,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import { supabase } from "../../lib/supabaseClient"

// NOTE: Image + Video Studio tabs show "Coming Soon" placeholders until
// the FAL / Runway API keys are provisioned. Asset Bank persists real
// uploads via the studio-assets storage bucket + studio_assets table.

interface StudioFolder { id: string; name: string; created_at: string }
interface StudioAsset {
  id:           string
  user_id:      string
  folder_id:    string | null
  name:         string
  mime_type:    string | null
  size_bytes:   number
  storage_path: string
  created_at:   string
}

const STORAGE_BUCKET = "studio-assets"
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB default per user

// Pretty-format byte counts: 0 B → 1.4 MB → 2.3 GB
function fmtBytes(bytes: number): string {
  if (bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function iconForMime(mime: string | null) {
  if (!mime) return <File size={18} className="text-gray-400" />
  if (mime.startsWith("image/")) return <ImageIcon size={18} className="text-purple-400" />
  if (mime.startsWith("video/")) return <Video size={18} className="text-[#FFD700]" />
  if (mime.startsWith("audio/")) return <MusicIcon size={18} className="text-blue-400" />
  return <File size={18} className="text-gray-400" />
}

function kindForMime(mime: string | null): string {
  if (!mime) return "file"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"
  return "document"
}

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
  const [viewMode,        setViewMode]        = useState<"grid" | "list">("grid")
  const [folders,         setFolders]         = useState<StudioFolder[]>([])
  const [assets,          setAssets]          = useState<StudioAsset[]>([])
  const [loading,         setLoading]         = useState(true)
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [folderName,      setFolderName]      = useState("")
  const [uploading,       setUploading]       = useState(false)
  const [uploadError,     setUploadError]     = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load folders + assets from Supabase
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      const [foldersRes, assetsRes] = await Promise.all([
        supabase
          .from("studio_folders")
          .select("id, name, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("studio_assets")
          .select("id, user_id, folder_id, name, mime_type, size_bytes, storage_path, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ])

      if (cancelled) return

      if (foldersRes.error) console.warn("[studio] folder load error:", foldersRes.error)
      if (assetsRes.error)  console.warn("[studio] asset load error:",  assetsRes.error)

      setFolders((foldersRes.data ?? []) as StudioFolder[])
      setAssets((assetsRes.data ?? []) as StudioAsset[])
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [user?.id])

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
  }

  // ─── Folder CRUD ──────────────────────────────────────────────────────────
  async function createFolder() {
    const name = folderName.trim()
    if (!name || !user?.id) return
    setFolderName("")
    setShowFolderInput(false)

    const { data, error } = await supabase
      .from("studio_folders")
      .insert({ user_id: user.id, name })
      .select("id, name, created_at")
      .single()

    if (error) {
      console.warn("[studio] folder create error:", error)
      return
    }
    if (data) setFolders(prev => [data as StudioFolder, ...prev])
  }

  async function removeFolder(id: string) {
    setFolders(prev => prev.filter(f => f.id !== id))
    const { error } = await supabase.from("studio_folders").delete().eq("id", id)
    if (error) console.warn("[studio] folder delete error:", error)
  }

  // ─── Upload ───────────────────────────────────────────────────────────────
  function triggerUpload() {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user?.id) return
    const files = Array.from(e.target.files ?? [])
    e.target.value = "" // allow same file re-pick
    if (files.length === 0) return

    setUploading(true)
    setUploadError(null)

    for (const file of files) {
      // Sanitize filename for storage paths (no spaces, no weird chars)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const storagePath = `${user.id}/${Date.now()}_${safeName}`

      const { error: upErr } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, { contentType: file.type, upsert: false })

      if (upErr) {
        console.warn("[studio] upload error:", upErr)
        setUploadError(`Couldn't upload "${file.name}" — ${upErr.message}`)
        continue
      }

      const { data: row, error: rowErr } = await supabase
        .from("studio_assets")
        .insert({
          user_id:      user.id,
          name:         file.name,
          mime_type:    file.type || null,
          size_bytes:   file.size,
          storage_path: storagePath,
        })
        .select("id, user_id, folder_id, name, mime_type, size_bytes, storage_path, created_at")
        .single()

      if (rowErr) {
        console.warn("[studio] asset row error:", rowErr)
        // Clean up the orphan file
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
        setUploadError(`Saved file but couldn't record metadata for "${file.name}".`)
        continue
      }
      if (row) setAssets(prev => [row as StudioAsset, ...prev])
    }

    setUploading(false)
  }

  // ─── Delete asset ─────────────────────────────────────────────────────────
  async function deleteAsset(asset: StudioAsset) {
    setAssets(prev => prev.filter(a => a.id !== asset.id))
    await supabase.storage.from(STORAGE_BUCKET).remove([asset.storage_path])
    await supabase.from("studio_assets").delete().eq("id", asset.id)
  }

  // ─── Download asset (signed URL) ──────────────────────────────────────────
  async function downloadAsset(asset: StudioAsset) {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(asset.storage_path, 60)
    if (error || !data?.signedUrl) {
      console.warn("[studio] signed URL error:", error)
      return
    }
    window.open(data.signedUrl, "_blank")
  }

  // ─── Derived totals ───────────────────────────────────────────────────────
  const totalBytes  = assets.reduce((sum, a) => sum + (a.size_bytes ?? 0), 0)
  const quotaPct    = Math.min(100, (totalBytes / STORAGE_QUOTA_BYTES) * 100)

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
              <button
                onClick={triggerUpload}
                disabled={uploading}
                className="px-5 py-2.5 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-60 disabled:hover:scale-100"
              >
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload Assets"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFiles}
              />
            </div>

            {uploadError && (
              <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-300 text-xs">
                {uploadError}
              </div>
            )}

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

            {/* Storage bar — real totals from uploaded assets */}
            <div className="flex flex-wrap items-center gap-4 py-3 px-6 bg-zinc-900/40 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 text-[#FFD700] font-black text-[10px] uppercase tracking-widest">
                <span className="opacity-40">Path:</span>
                <span>Root</span>
                <ChevronRight size={10} className="opacity-20" />
                <span className="opacity-40">Assets</span>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                  {fmtBytes(totalBytes)} / {fmtBytes(STORAGE_QUOTA_BYTES)}
                </span>
                <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#FFD700] h-full transition-all" style={{ width: `${quotaPct}%` }} />
                </div>
              </div>
            </div>

            {/* Assets — real grid/list OR empty state */}
            {loading ? (
              <div className="py-20 text-center text-white/30 text-xs font-black uppercase tracking-widest">
                Loading your assets…
              </div>
            ) : assets.length === 0 ? (
              <EmptyAssetState onUpload={triggerUpload} />
            ) : (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-1"}`}>
                {assets.map(asset => (
                  viewMode === "grid" ? (
                    <div key={asset.id} className="group bg-zinc-900/20 border border-white/5 rounded-3xl p-6 hover:border-[#FFD700]/30 transition-all relative">
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          {iconForMime(asset.mime_type)}
                        </div>
                        <button className="text-white/10 hover:text-white transition-colors"><MoreVertical size={14} /></button>
                      </div>
                      <h3 className="text-xs font-black text-white truncate mb-1 group-hover:text-[#FFD700] transition-colors">{asset.name}</h3>
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
                        <span>{kindForMime(asset.mime_type)}</span>
                        <span>{fmtBytes(asset.size_bytes)}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all">
                        <button onClick={() => downloadAsset(asset)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-transform"><Download size={16} /></button>
                        <button onClick={() => downloadAsset(asset)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-110 transition-transform"><ExternalLink size={16} /></button>
                        <button onClick={() => deleteAsset(asset)} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-red-400 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ) : (
                    <div key={asset.id} className="group bg-zinc-900/20 border border-white/5 rounded-2xl p-4 flex items-center gap-6 hover:border-[#FFD700]/30 transition-all">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">{iconForMime(asset.mime_type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white group-hover:text-[#FFD700] transition-colors truncate">{asset.name}</h3>
                        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">{kindForMime(asset.mime_type)} · {fmtBytes(asset.size_bytes)}</p>
                      </div>
                      <p className="text-white/20 text-[9px] font-black uppercase hidden sm:block">{fmtDate(asset.created_at)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => downloadAsset(asset)} className="p-2 text-white/20 hover:text-white transition-colors"><Download size={16} /></button>
                        <button onClick={() => deleteAsset(asset)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "image" && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <ComingSoonPanel
              icon={<Sparkles size={28} className="text-[#FFD700]" />}
              title="Image Studio"
              subtitle="AI-generated album art, press photos, social assets"
              accentColor="#FFD700"
            />
          </motion.div>
        )}

        {activeTab === "video" && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <ComingSoonPanel
              icon={<Video size={28} className="text-white" />}
              title="Video Studio"
              subtitle="AI-generated visualizers, lyric videos, teasers"
              accentColor="#FFFFFF"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Empty state for Asset Bank when user has no uploads yet ─────────────────

function EmptyAssetState({ onUpload }: { onUpload: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-white/10 bg-zinc-900/30 px-8 py-20 flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <Folder size={28} className="text-white/30" />
      </div>
      <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">No assets yet</h3>
      <p className="text-white/40 text-sm max-w-md mb-6">
        Upload masters, artwork, photos, videos, and PDFs to keep your release files in one place. Drag-and-drop coming soon — for now use the button below.
      </p>
      <button
        onClick={onUpload}
        className="px-5 py-2.5 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <Upload size={14} /> Upload Your First Asset
      </button>
    </motion.div>
  )
}

// ─── Coming Soon placeholder for Image / Video studio tabs ────────────────────

function ComingSoonPanel({
  icon,
  title,
  subtitle,
  accentColor,
}: {
  icon:        React.ReactNode
  title:       string
  subtitle:    string
  accentColor: string
}) {
  const isGold = accentColor === "#FFD700"
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border bg-zinc-900/40 px-8 py-16 sm:py-24 flex flex-col items-center text-center"
      style={{ borderColor: isGold ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)" }}
    >
      {/* soft accent glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60%] h-64 blur-[100px] rounded-full pointer-events-none"
        style={{ background: isGold ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.06)" }}
      />

      {/* Icon block */}
      <div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center border mb-5"
        style={{
          background:  isGold ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.04)",
          borderColor: isGold ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.12)",
        }}
      >
        {icon}
      </div>

      {/* Coming Soon badge */}
      <div
        className="relative px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] mb-4"
        style={{
          background:  isGold ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.06)",
          borderColor: isGold ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.15)",
          color:       isGold ? "#FFD700" : "#FFFFFF",
        }}
      >
        Coming Soon
      </div>

      {/* Title */}
      <h3 className="relative text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="relative text-gray-400 text-sm max-w-md">
        {subtitle}
      </p>

      {/* uP iMessage prompt */}
      <p className="relative text-gray-500 text-xs mt-6 max-w-md leading-relaxed">
        Text uP to be notified when this drops — it'll ping you the moment it's live.
      </p>
    </motion.div>
  )
}
