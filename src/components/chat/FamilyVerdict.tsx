'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, Flame, Heart, Sparkles } from 'lucide-react';
import { FamilyVerdictData } from '@/types/chat';

interface FamilyVerdictProps {
  verdict: FamilyVerdictData;
}

export const FamilyVerdict: React.FC<FamilyVerdictProps> = ({ verdict }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="my-6 max-w-lg mx-auto"
    >
      <div className="bg-gradient-to-br from-amber-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950 p-6 rounded-3xl shadow-2xl border-2 border-amber-400 dark:border-amber-500/60 relative overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 dark:border-amber-900/40 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                OFFICIAL FAMILY VERDICT 🎯
              </h2>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                Kudumbam Union Consensus Score: {verdict.approvalRating}%
              </p>
            </div>
          </div>
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            FINAL
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-rose-600 dark:text-rose-400 mb-2 italic text-center">
          "{verdict.title}"
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 text-center leading-relaxed font-medium">
          {verdict.summary}
        </p>

        {/* Persona Verdict Highlights Grid */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50">
            <strong className="text-rose-700 dark:text-rose-300">Meera (Amma 🤱): </strong>
            <span className="italic">"{verdict.meeraComment}"</span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-900/50">
            <strong className="text-purple-700 dark:text-purple-300">Anjali (Sister 😈): </strong>
            <span className="italic">"{verdict.anjaliComment}"</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50">
            <strong className="text-amber-800 dark:text-amber-300">Soman (Uncle 👴): </strong>
            <span className="italic">"{verdict.somanComment}"</span>
          </div>

          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/50">
            <strong className="text-teal-800 dark:text-teal-300">Latha (Neighbour 🤫): </strong>
            <span className="italic">"{verdict.lathaComment}"</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
