'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Sparkles, Heart } from 'lucide-react';

interface FamilyRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RULES = [
  '1. Someone will misunderstand the photo.',
  '2. Latha Aunty will notice something in the background.',
  '3. Soman Uncle will give career/PSC advice nobody requested.',
  '4. Meera (Amma) will ask if you drank Kattan Chaya.',
  '5. Nobody leaves the chat without a Family Verdict.',
];

export const FamilyRulesModal: React.FC<FamilyRulesModalProps> = ({ isOpen, onClose }) => {
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
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-extrabold text-base">Golden Family Rules</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-3 mb-6">
            {RULES.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/70 dark:border-slate-700/70 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            I Accept the Family Rules 👀
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
