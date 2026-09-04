'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Sparkles, Heart, Trophy } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-teal-500/30 text-slate-800 dark:text-slate-100 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-teal-500" />
              <h2 className="font-extrabold text-base">About Kudumbam Union</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-6">
            <p className="font-bold text-slate-800 dark:text-slate-100">
              🎯 Developed for TinkerHub Useless Projects 3.0 Hackathon!
            </p>
            <p>
              <strong>Kudumbam Union</strong> is an AI-powered Kerala family group simulator. Upload any photo to let Meera (Amma), Anjali (Sister), Soman (Uncle), and Latha (Neighbour) dissect your evidence, troll your choices, and deliver a unanimous Family Verdict!
            </p>
            <div className="bg-teal-50 dark:bg-teal-950/60 p-3 rounded-2xl border border-teal-200 dark:border-teal-800 font-medium text-teal-900 dark:text-teal-200">
              Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion & OpenAI Vision AI.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            Close Info
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
