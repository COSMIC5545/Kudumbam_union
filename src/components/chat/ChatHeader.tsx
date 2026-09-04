'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Eye } from 'lucide-react';
import { FAMILY_PERSONAS } from '@/data/personas';
import { PersonaId } from '@/types/chat';
import { ThreeDotMenu } from '@/components/chat/ThreeDotMenu';

interface ChatHeaderProps {
  onOpenInfo: () => void;
  onToggleSidebar: () => void;
  onNewDrama: () => void;
  onClearChat: () => void;
  onOpenVerdict: () => void;
  onOpenAbout: () => void;
  isAnalyzing?: boolean;
  typingPersonaId?: PersonaId | null;
  hasVerdict?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenInfo,
  onToggleSidebar,
  onNewDrama,
  onClearChat,
  onOpenVerdict,
  onOpenAbout,
  isAnalyzing,
  typingPersonaId,
  hasVerdict,
}) => {
  const typingPersona =
    typingPersonaId && typingPersonaId in FAMILY_PERSONAS
      ? FAMILY_PERSONAS[typingPersonaId]
      : null;

  return (
    <header className="h-16 px-5 flex items-center justify-between bg-ku-surface border-b border-ku-border shadow-header shrink-0 z-20">
      {/* Left: Group Info */}
      <motion.div
        whileHover={{ x: 2 }}
        onClick={onOpenInfo}
        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
      >
        {/* Group Avatar Mosaic */}
        <div className="relative w-10 h-10 rounded-xl bg-ku-bgLight p-0.5 border border-ku-borderLight shadow-glass-sm shrink-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-px w-full h-full rounded-[10px] overflow-hidden">
            {Object.values(FAMILY_PERSONAS)
              .slice(0, 4)
              .map((p) => (
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
          {/* Online pulse */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-ku-surface rounded-full" />
        </div>

        {/* Group Details */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-base tracking-tight text-ku-text truncate">
              Kudumbam Union
            </h1>
            <span className="text-sm">🌴</span>
          </div>

          <div className="text-xs text-ku-textMuted truncate">
            {typingPersona ? (
              <span className="text-ku-tealLight font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ku-tealLight animate-pulse" />
                {typingPersona.name} is typing...
              </span>
            ) : isAnalyzing ? (
              <span className="text-ku-goldLight font-semibold flex items-center gap-1 animate-pulse">
                <Eye className="w-3 h-3" />
                Family is examining the evidence...
              </span>
            ) : (
              <span>4 relatives • 2 already judging 👀</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={onOpenInfo}
          className="p-2 hover:bg-ku-surfaceHover rounded-xl transition-colors text-ku-textMuted hover:text-ku-text flex items-center gap-1.5 text-xs font-semibold"
          title="Family Members"
        >
          <Users className="w-4 h-4" />
          <span className="hidden lg:inline">Members</span>
        </motion.button>

        <ThreeDotMenu
          onNewDrama={onNewDrama}
          onClearChat={onClearChat}
          onOpenMembers={onOpenInfo}
          onOpenVerdict={onOpenVerdict}
          onOpenAbout={onOpenAbout}
          hasVerdict={hasVerdict}
        />
      </div>
    </header>
  );
};
