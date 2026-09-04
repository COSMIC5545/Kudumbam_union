'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoUploadZoneProps {
  onPhotoSelected: (fileOrUrl: File | string, caption: string) => void;
  isProcessing?: boolean;
}

const DEMO_SAMPLES = [
  {
    label: '☕ Kattan Chaya',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    caption: 'Evening Kattan Chaya & Parippuvada! ☕',
  },
  {
    label: '🍛 Home Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    caption: 'Tried cooking special Malabar Biryani today 🍛',
  },
  {
    label: '🌴 Wayanad Trip',
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80',
    caption: 'Chilling at Wayanad resorts with friends 🌴',
  },
  {
    label: '👔 New Outfit',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    caption: 'New outfit for wedding 👔',
  },
];

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  onPhotoSelected,
  isProcessing = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) handleFileChange(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSelectSample = (sample: (typeof DEMO_SAMPLES)[0]) => {
    setSelectedFile(null);
    setPreviewUrl(sample.url);
    setCaption(sample.caption);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setCaption('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onPhotoSelected(selectedFile, caption);
    } else if (previewUrl) {
      onPhotoSelected(previewUrl, caption);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.div
            key="dropzone"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 bg-ku-surface/80 backdrop-blur-sm overflow-hidden ${
              dragActive
                ? 'border-ku-teal bg-ku-tealMuted scale-[1.01]'
                : 'border-ku-border hover:border-ku-teal/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {/* Upload Icon */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 mx-auto mb-3 rounded-xl bg-ku-tealMuted border border-ku-teal/20 flex items-center justify-center cursor-pointer transition-colors hover:bg-ku-teal/15"
            >
              <UploadCloud className="w-6 h-6 text-ku-teal" />
            </motion.div>

            <h2 className="text-sm font-bold text-ku-text mb-1">
              Drop the evidence here 📸
            </h2>
            <p className="text-xs text-ku-textDim mb-4">
              Click to choose, drag & drop, or paste an image
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 rounded-xl bg-ku-teal hover:bg-ku-tealDark text-white text-xs font-bold shadow-sm transition-all"
            >
              Choose a Photo
            </motion.button>

            {/* Demo Samples */}
            <div className="mt-4 pt-3 border-t border-ku-border">
              <p className="text-[10px] font-semibold text-ku-textDim uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-ku-gold" />
                Quick test photos
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-[10px] font-semibold py-1.5 px-2 rounded-lg bg-ku-bgLight hover:bg-ku-surfaceHover text-ku-textMuted border border-ku-border text-center truncate transition-colors"
                  >
                    {sample.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-ku-surface rounded-2xl p-4 shadow-glass border border-ku-borderLight overflow-hidden"
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ku-textMuted">
                Send this to the family?
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg text-ku-textDim hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden bg-ku-bg aspect-[4/3] mb-3 border border-ku-border">
              <img
                src={previewUrl}
                alt="Upload Preview"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption & Submit */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <input
                type="text"
                placeholder="Add a caption (optional) 👀"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-ku-bgLight text-ku-text text-sm border border-ku-border focus:outline-none focus:border-ku-teal/40 focus:ring-1 focus:ring-ku-teal/20 placeholder-ku-textDim transition-all"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-2.5 rounded-xl bg-ku-bgLight hover:bg-ku-surfaceHover text-ku-textMuted text-xs font-semibold border border-ku-border transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-ku-teal hover:bg-ku-tealDark text-white text-xs font-bold shadow-glow-teal flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isProcessing ? 'Sending...' : 'Send to Kudumbam 👀'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
