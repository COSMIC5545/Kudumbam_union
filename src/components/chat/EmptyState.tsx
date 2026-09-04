'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ImagePlus } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-12"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-6 select-none"
      >
        👀
      </motion.div>

      <h2 className="font-display font-bold text-lg text-ku-text mb-2 text-center">
        Kudumbam Union is unusually quiet...
      </h2>
      <p className="text-sm text-ku-textMuted text-center max-w-md">
        Say something. Someone will definitely misunderstand it. 😂
      </p>
    </motion.div>
  );
};
