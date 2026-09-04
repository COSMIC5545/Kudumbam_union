'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { FAMILY_PERSONAS } from '@/data/personas';

interface MemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupInfoDrawer: React.FC<MemberDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-sm h-full bg-ku-surface shadow-glass overflow-y-auto flex flex-col z-10 border-l border-ku-border"
        >
          {/* Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-ku-border shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-ku-teal" />
              <h2 className="font-display font-bold text-sm text-ku-text">
                Family Members
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-ku-surfaceHover text-ku-textMuted hover:text-ku-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Group Banner */}
          <div className="px-5 py-5 text-center border-b border-ku-border">
            {/* Group Avatar */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-ku-bgLight p-0.5 border border-ku-borderLight shadow-glass-sm overflow-hidden mb-3">
              <div className="grid grid-cols-2 gap-px w-full h-full rounded-[14px] overflow-hidden">
                {Object.values(FAMILY_PERSONAS).map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>

            <h1 className="font-display font-bold text-base text-ku-text mb-0.5">
              Kudumbam Union 🌴
            </h1>
            <p className="text-xs text-ku-textDim">
              Kerala&apos;s most dangerous family group
            </p>
            <div className="mt-2 flex justify-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ku-tealMuted text-ku-tealLight font-semibold border border-ku-teal/20">
                4 members
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ku-goldMuted text-ku-goldLight font-semibold border border-ku-gold/20">
                100% Judgement
              </span>
            </div>
          </div>

          {/* Members */}
          <div className="p-4 flex-1">
            <p className="text-[10px] font-semibold text-ku-textDim uppercase tracking-wider mb-3">
              Members ({Object.keys(FAMILY_PERSONAS).length})
            </p>

            <div className="space-y-2">
              {Object.values(FAMILY_PERSONAS).map((persona) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="p-3.5 rounded-xl bg-ku-bgLight border border-ku-border"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-11 h-11 rounded-full object-cover border border-ku-border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-ku-bgLight rounded-full" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold text-ku-text">
                          {persona.realName}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-ku-surface text-ku-textMuted font-medium border border-ku-border">
                          {persona.malayalamTitle}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-ku-teal mb-1">
                        {persona.relation} • Online
                      </p>

                      <p className="text-[11px] text-ku-textMuted italic">
                        &ldquo;{persona.personality}&rdquo;
                      </p>

                      {/* Status quote */}
                      <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-ku-surface border border-ku-border">
                        <p className="text-[10px] text-ku-textDim italic">
                          {persona.statusQuote}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
