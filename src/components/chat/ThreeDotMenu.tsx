'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  RefreshCw,
  Trash2,
  Users,
  Scale,
  Clapperboard,
  Info,
} from 'lucide-react';

interface ThreeDotMenuProps {
  onNewDrama: () => void;
  onClearChat: () => void;
  onOpenMembers: () => void;
  onOpenVerdict: () => void;
  onOpenAbout: () => void;
  hasVerdict?: boolean;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  onNewDrama,
  onClearChat,
  onOpenMembers,
  onOpenVerdict,
  onOpenAbout,
  hasVerdict,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      icon: RefreshCw,
      label: 'Start New Family Drama',
      onClick: onNewDrama,
      color: 'text-ku-tealLight',
      emoji: '🔥',
    },
    {
      icon: Trash2,
      label: 'Clear Conversation',
      onClick: onClearChat,
      color: 'text-orange-400',
      emoji: '🧹',
    },
    {
      icon: Users,
      label: 'Family Members',
      onClick: onOpenMembers,
      color: 'text-purple-400',
      emoji: '👥',
    },
    {
      icon: Scale,
      label: 'Family Verdict',
      onClick: onOpenVerdict,
      color: hasVerdict ? 'text-ku-goldLight' : 'text-ku-textDim',
      emoji: '⚖️',
      disabled: !hasVerdict,
    },
    {
      icon: Clapperboard,
      label: 'Demo Mode',
      onClick: () => {},
      color: 'text-ku-textDim',
      emoji: '🎬',
      disabled: true,
    },
    {
      icon: Info,
      label: 'About Kudumbam Union',
      onClick: onOpenAbout,
      color: 'text-ku-textMuted',
      emoji: 'ℹ️',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-ku-surfaceHover rounded-xl transition-colors text-ku-textMuted hover:text-ku-text"
        title="More Options"
      >
        <MoreVertical className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-ku-surface rounded-2xl shadow-glass border border-ku-borderLight py-1.5 z-50 overflow-hidden"
          >
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-xs font-medium transition-colors ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-ku-surfaceHover cursor-pointer'
                } ${item.color}`}
              >
                <span className="text-sm">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
