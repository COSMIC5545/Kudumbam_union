'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck } from 'lucide-react';
import { Message } from '@/types/chat';
import { FAMILY_PERSONAS } from '@/data/personas';
import { VoiceNoteBubble } from '@/components/chat/VoiceNoteBubble';
import { FamilyVerdict } from '@/components/chat/FamilyVerdict';

interface MessageBubbleProps {
  message: Message;
  onReact?: (messageId: string, emoji: string) => void;
}

const EMOJI_PICKER = ['❤️', '😂', '🤦‍♂️', '😱', '👍', '☕'];

// Per-persona subtle bubble color
const PERSONA_BUBBLE_COLORS: Record<string, string> = {
  sheela: 'bg-persona-sheelaBubble border-persona-sheela/15',
  anjali: 'bg-persona-anjaliBubble border-persona-anjali/15',
  soman: 'bg-persona-somanBubble border-persona-soman/15',
  latha: 'bg-persona-lathaBubble border-persona-latha/15',
};

const PERSONA_NAME_COLORS: Record<string, string> = {
  sheela: 'text-persona-sheela',
  anjali: 'text-persona-anjali',
  soman: 'text-persona-soman',
  latha: 'text-persona-latha',
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReact }) => {
  const isUser = message.senderId === 'user';
  const isSystem = message.isSystem;
  const isVerdict = message.isVerdict && message.verdictData;
  const persona =
    !isUser && message.senderId in FAMILY_PERSONAS
      ? FAMILY_PERSONAS[message.senderId]
      : null;

  const [showReactions, setShowReactions] = useState(false);

  // System Notification
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div className="glass-light text-[11px] font-medium text-ku-textMuted px-3.5 py-1.5 rounded-xl max-w-xs text-center">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // Verdict
  if (isVerdict && message.verdictData) {
    return <FamilyVerdict verdict={message.verdictData} />;
  }

  const bubbleColor = isUser
    ? 'bg-ku-teal/15 border-ku-teal/20'
    : PERSONA_BUBBLE_COLORS[message.senderId] || 'bg-ku-surface border-ku-border';

  const nameColor = PERSONA_NAME_COLORS[message.senderId] || 'text-ku-text';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex items-end gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Persona Avatar */}
      {!isUser && (
        <div className="shrink-0 mb-0.5">
          <img
            src={persona?.avatar || ''}
            alt={persona?.realName || message.senderName}
            className="w-7 h-7 rounded-full object-cover border border-ku-border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Bubble */}
      <div className="relative max-w-[75%] lg:max-w-[60%] group">
        {/* Emoji Quick Picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: -4 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              className={`absolute -top-8 z-20 flex items-center gap-0.5 bg-ku-surface p-1 rounded-full shadow-glass border border-ku-borderLight ${
                isUser ? 'right-0' : 'left-0'
              }`}
            >
              {EMOJI_PICKER.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onReact) onReact(message.id, emoji);
                    setShowReactions(false);
                  }}
                  className="hover:scale-125 transition-transform p-0.5 text-xs"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          className={`rounded-2xl ${
            isUser ? 'rounded-br-md' : 'rounded-bl-md'
          } px-3.5 py-2.5 border shadow-bubble text-sm transition-colors ${bubbleColor}`}
        >
          {/* Sender Name */}
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`font-bold text-xs ${nameColor}`}>
                {persona?.realName || message.senderName}
              </span>
              <span className="text-[10px] text-ku-textDim">
                {persona?.relation}
              </span>
            </div>
          )}

          {/* Image */}
          {message.imageUrl && (
            <div className="rounded-xl overflow-hidden mb-2 max-h-56 bg-ku-bg border border-ku-border">
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="w-full h-full object-contain max-h-56"
              />
            </div>
          )}

          {/* Voice Note */}
          {message.isVoiceNote && message.voiceNoteData && (
            <VoiceNoteBubble
              voiceNote={message.voiceNoteData}
              speakerName={persona?.realName || message.senderName}
              speakerAvatar={persona?.avatar}
              content={message.content}
            />
          )}

          {/* Text */}
          {message.content && !message.isVoiceNote && (
            <div className="whitespace-pre-wrap leading-relaxed text-[13px] text-ku-text">
              {message.content}
            </div>
          )}

          {/* Malayalam Translation */}
          {message.malayalamTranslation && (
            <div className="mt-1.5 pt-1.5 border-t border-white/5 text-[11px] italic text-ku-textDim">
              💬 {message.malayalamTranslation}
            </div>
          )}

          {/* Timestamp & Status */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-ku-textDim select-none">
            <span>{message.timestamp}</span>
            {isUser && (
              <CheckCheck className="w-3.5 h-3.5 text-ku-teal stroke-[2]" />
            )}
          </div>
        </div>

        {/* Reaction Badges */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-ku-surface border border-ku-border rounded-full px-1.5 py-0.5 shadow-bubble text-xs">
            {message.reactions.map((r, idx) => (
              <span key={idx}>{r.emoji}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
