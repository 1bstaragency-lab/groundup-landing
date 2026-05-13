import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, X, Expand } from 'lucide-react';
import type { GeneratedImage } from '../../types/imageGeneration.types';

interface Props {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
}

export default function ImageGallery({ images, onDelete }: Props) {
  const [preview, setPreview] = useState<GeneratedImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/8 flex items-center justify-center mb-4">
          <span className="text-2xl">🎨</span>
        </div>
        <p className="text-gray-500 text-sm">No images yet — generate your first one above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/8"
          >
            <img
              src={img.image_url}
              alt={img.description}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <div className="flex gap-1.5 w-full">
                <button
                  onClick={() => setPreview(img)}
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg py-1.5 flex items-center justify-center transition-colors"
                >
                  <Expand size={13} className="text-white" />
                </button>
                <a
                  href={img.image_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-white/10 hover:bg-[#FFD700]/30 backdrop-blur-sm rounded-lg py-1.5 flex items-center justify-center transition-colors"
                >
                  <Download size={13} className="text-white" />
                </a>
                <button
                  onClick={() => onDelete(img.id)}
                  className="flex-1 bg-white/10 hover:bg-red-500/30 backdrop-blur-sm rounded-lg py-1.5 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={13} className="text-white" />
                </button>
              </div>
            </div>
            {/* Style badge */}
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
              {img.style}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={preview.image_url}
                alt={preview.description}
                className="w-full rounded-2xl"
              />
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-semibold">{preview.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{preview.style} · {preview.mood} · {preview.aspect_ratio}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={preview.image_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#FFD700] text-black rounded-xl p-2.5 hover:bg-yellow-300 transition-colors"
                  >
                    <Download size={15} />
                  </a>
                  <button
                    onClick={() => setPreview(null)}
                    className="bg-zinc-800 text-white rounded-xl p-2.5 hover:bg-zinc-700 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
