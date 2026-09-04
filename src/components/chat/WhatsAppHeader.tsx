'use client';

import React from 'react';
import { Users, Wifi, BatteryMedium, Signal, Eye, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { FAMILY_PERSONAS } from '@/data/personas';
import { PersonaId } from '@/types/chat';
import { ThreeDotMenu } from '@/components/chat/ThreeDotMenu';

interface HeaderProps {
  onOpenInfo: () => void;
  onNewCase: () => void;
  onOpenRules: () => void;
  onOpenAbout: () => void;
  isAnalyzing?: boolean;
  typingPersonaId?: PersonaId | null;
}

export const WhatsAppHeader: React.FC<HeaderProps> = ({
  onOpenInfo,
  onNewCase,
  onOpenRules,
  onOpenAbout,
  isAnalyzing,
  typingPersonaId,
}) => {
  const typingPersona = typingPersonaId && typingPersonaId in FAMILY_PERSONAS ? FAMILY_PERSONAS[typingPersonaId] : null;

  return (
    <div className="flex flex-col z-20 sticky top-0 shadow-md select-none">
      {/* Top Status Bar Shell */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex justify-between items-center border-b border-slate-800">
        <div className="font-bold tracking-wider text-amber-400">09:41 AM</div>
        <div className="flex items-center gap-1.5 text-xs opacity-90">
          <Signal className="w-3 h-3 text-emerald-400" />
          <Wifi className="w-3 h-3 text-teal-400" />
          <span className="text-[10px] font-extrabold text-slate-200">98%</span>
          <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Main Desktop Header */}
      <header className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white px-5 py-3.5 flex items-center justify-between border-b border-teal-800/40">
        {/* Group Info & Avatar Cluster */}
        <motion.div
          whileHover={{ x: 2 }}
          onClick={onOpenInfo}
          className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
        >
          {/* Avatar Ring Stack */}
          <div className="relative w-12 h-12 rounded-full bg-slate-900 p-0.5 border-2 border-amber-300 shadow-md shrink-0 overflow-hidden group">
            <div className="grid grid-cols-2 gap-0.5 p-0.5 w-full h-full rounded-full overflow-hidden">
              {Object.values(FAMILY_PERSONAS).slice(0, 4).map((p) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 border-2 border-teal-700 rounded-full animate-ping" />
          </div>

          {/* Group Details & Status */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight truncate text-white">
                Kudumbam Union 🌴
              </h1>
              <span className="bg-amber-300 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                UP 3.0
              </span>
            </div>

            <div className="text-xs text-teal-100/90 truncate flex items-center gap-1 font-medium">
              {typingPersona ? (
                <span className="text-amber-300 font-bold animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                  {typingPersona.name} is typing...
                </span>
              ) : isAnalyzing ? (
                <span className="text-amber-200 animate-pulse font-bold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  Family is inspecting evidence...
                </span>
              ) : (
                <span className="truncate">4 relatives online • 2 judging 👀</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Group Controls */}
        <div className="flex items-center space-x-2 text-teal-100 shrink-0">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onOpenInfo}
            className="p-2 hover:bg-teal-800/60 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Family Members Drawer"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Members</span>
          </motion.button>

          {/* Working 3-Dot Menu */}
          <ThreeDotMenu
            onNewCase={onNewCase}
            onOpenRules={onOpenRules}
            onOpenAbout={onOpenAbout}
          />
        </div>
      </header>
    </div>
  );
};
