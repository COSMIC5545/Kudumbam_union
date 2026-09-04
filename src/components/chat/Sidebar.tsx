'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { FAMILY_PERSONAS } from '@/data/personas';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const personas = Object.values(FAMILY_PERSONAS);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="h-full bg-ku-surface border-r border-ku-border flex flex-col overflow-hidden shrink-0 z-10"
        >
          {/* Sidebar Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-ku-border shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌴</span>
              <h2 className="font-display font-bold text-sm text-ku-text">
                Kudumbam Union
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-ku-surfaceHover text-ku-textMuted hover:text-ku-text transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Group Description */}
          <div className="px-4 py-4 border-b border-ku-border">
            <p className="text-[11px] text-ku-textDim font-medium leading-relaxed">
              Kerala&apos;s most dangerous family group 👀
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ku-tealMuted text-ku-tealLight font-semibold border border-ku-teal/20">
                4 members
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ku-goldMuted text-ku-goldLight font-semibold border border-ku-gold/20">
                All online
              </span>
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <p className="text-[10px] font-semibold text-ku-textDim uppercase tracking-wider px-1 mb-2">
              Family Members
            </p>
            <div className="space-y-1">
              {personas.map((persona) => (
                <motion.div
                  key={persona.id}
                  whileHover={{ x: 2, backgroundColor: 'rgba(148, 163, 184, 0.06)' }}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-default transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-9 h-9 rounded-full object-cover border border-ku-border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-ku-surface rounded-full" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ku-text truncate">
                        {persona.realName}
                      </span>
                    </div>
                    <p className="text-[11px] text-ku-textMuted truncate">
                      {persona.relation} • Online
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-ku-border">
            <p className="text-[10px] text-ku-textDim text-center">
              TinkerHub Useless Projects 3.0 🎯
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
