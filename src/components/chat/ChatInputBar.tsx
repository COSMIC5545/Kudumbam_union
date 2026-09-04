'use client';

import React, { useState } from 'react';
import { Smile, ImagePlus, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  onOpenPhotoPicker: () => void;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  onOpenPhotoPicker,
  disabled = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <footer className="px-4 py-3 flex items-center gap-3 bg-ku-surface border-t border-ku-border shrink-0 z-10">
      {/* Attach Photo */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        type="button"
        onClick={onOpenPhotoPicker}
        className="p-2.5 hover:bg-ku-surfaceHover rounded-xl transition-colors text-ku-teal flex items-center gap-1.5 text-xs font-semibold shrink-0"
        title="Attach Photo"
      >
        <ImagePlus className="w-5 h-5" />
        <span className="hidden sm:inline">Attach</span>
      </motion.button>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <input
          type="text"
          disabled={disabled}
          placeholder={
            disabled ? 'Family is reviewing...' : 'Type a message...'
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-ku-bgLight text-ku-text text-sm placeholder-ku-textDim border border-ku-border focus:outline-none focus:border-ku-teal/40 focus:ring-1 focus:ring-ku-teal/20 transition-all"
        />
      </form>

      {/* Send */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="p-2.5 rounded-xl bg-ku-teal hover:bg-ku-tealDark text-white shadow-glow-teal transition-all disabled:opacity-30 disabled:shadow-none shrink-0"
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </footer>
  );
};
