'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ImagePlus } from 'lucide-react';

interface EmptyStateProps {
  onOpenUpload: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenUpload }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-12"
    >
      {/* Floating eyes emoji */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-6 select-none"
      >
        👀
      </motion.div>

      {/* Main text */}
      <h2 className="font-display font-bold text-lg text-ku-text mb-1.5 text-center">
        Kudumbam Union is watching...
      </h2>
      <p className="text-sm text-ku-textMuted mb-1 text-center">
        Upload something. Anything.
      </p>
      <p className="text-xs text-ku-textDim mb-8 text-center italic">
        Your family has absolutely no business knowing this.
      </p>

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={onOpenUpload}
        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-ku-teal to-emerald-600 hover:from-ku-tealDark hover:to-emerald-700 text-white font-bold text-sm shadow-glow-teal transition-all flex items-center gap-2"
      >
        <ImagePlus className="w-4 h-4" />
        Upload Photo
      </motion.button>

      {/* Or text */}
      <p className="mt-4 text-[11px] text-ku-textDim">
        or type a message below to start the drama
      </p>
    </motion.div>
  );
};
