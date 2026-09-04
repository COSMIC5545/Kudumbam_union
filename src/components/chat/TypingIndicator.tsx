'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FAMILY_PERSONAS } from '@/data/personas';
import { PersonaId } from '@/types/chat';

interface TypingIndicatorProps {
  typingPersonaId: PersonaId | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingPersonaId }) => {
  if (!typingPersonaId || !(typingPersonaId in FAMILY_PERSONAS)) return null;

  const persona = FAMILY_PERSONAS[typingPersonaId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex items-end gap-2 mb-2 justify-start"
    >
      {/* Avatar with pulse */}
      <div className="shrink-0 mb-0.5">
        <img
          src={persona.avatar}
          alt={persona.name}
          className="w-7 h-7 rounded-full object-cover border border-ku-border animate-pulse"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Typing Bubble */}
      <div className="bg-ku-surface border border-ku-border rounded-2xl rounded-bl-md px-4 py-2.5 shadow-bubble flex items-center gap-3">
        <span className="text-xs font-medium text-ku-textMuted">
          {persona.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-ku-teal rounded-full animate-bounce-dot-1" />
          <span className="w-1.5 h-1.5 bg-ku-teal rounded-full animate-bounce-dot-2" />
          <span className="w-1.5 h-1.5 bg-ku-teal rounded-full animate-bounce-dot-3" />
        </div>
      </div>
    </motion.div>
  );
};
