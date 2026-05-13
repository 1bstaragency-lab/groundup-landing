import { motion } from 'framer-motion';
import { Download, Trash2, Play, Clock, Loader2 } from 'lucide-react';
import type { GeneratedVideo } from '../../types/videoGeneration.types';

interface Props {
  videos: GeneratedVideo[];
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-500/20 text-yellow-400' },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400' },
  complete:   { label: 'Complete',   color: 'bg-green-500/20 text-green-400' },
  failed:     { label: 'Failed',     color: 'bg-red-500/20 text-red-400' },
};

export default function VideoGallery({ videos, onDelete }: Props) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/8 flex items-center justify-center mb-4">
          <span className="text-2xl">🎬</span>
        </div>
        <p className="text-gray-500 text-sm">No videos yet — generate your first one above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {videos.map((video, i) => {
        const badge = STATUS_BADGE[video.status] ?? STATUS_BADGE.pending;
        return (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-zinc-900/60 border border-white/8 rounded-2xl overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {video.status === 'processing' || video.status === 'pending' ? (
                    <Loader2 size={28} className="text-gray-600 animate-spin" />
                  ) : (
                    <Play size={28} className="text-gray-600" />
                  )}
                </div>
              )}

              {/* Play overlay */}
              {video.video_url && (
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play size={18} fill="white" className="text-white ml-0.5" />
                  </div>
                </a>
              )}

              {/* Status badge */}
              <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badge.color}`}>
                {badge.label}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-sm text-white font-semibold line-clamp-1 mb-1">{video.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
                <span className="bg-zinc-800 rounded-full px-2 py-0.5">{video.concept}</span>
                <span className="bg-zinc-800 rounded-full px-2 py-0.5">{video.style}</span>
                <span className="flex items-center gap-1">
                  <Clock size={9} />
                  {video.duration}
                </span>
              </div>
              <div className="flex gap-2">
                {video.video_url ? (
                  <a
                    href={video.video_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/20 rounded-xl py-2 flex items-center justify-center gap-1.5 text-[#FFD700] text-xs font-bold transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </a>
                ) : (
                  <div className="flex-1 bg-zinc-800/50 rounded-xl py-2 flex items-center justify-center text-gray-600 text-xs">
                    Not ready
                  </div>
                )}
                <button
                  onClick={() => onDelete(video.id)}
                  className="bg-zinc-800 hover:bg-red-500/20 rounded-xl px-3 py-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
