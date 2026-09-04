'use client';

import React from 'react';
import { Flame, Eye } from 'lucide-react';
import { ChatStatus } from '@/types/chat';

interface StatusStripProps {
  chatStatus: ChatStatus;
  messageCount: number;
}

export const StatusStrip: React.FC<StatusStripProps> = ({
  chatStatus,
  messageCount,
}) => {
  const getJudgementLevel = () => {
    if (chatStatus === 'ready') return { text: 'MAXIMUM 🔥', color: 'text-red-400' };
    if (chatStatus === 'analyzing' || chatStatus === 'responding') return { text: 'Analyzing...', color: 'text-ku-goldLight' };
    if (messageCount > 5) return { text: 'HIGH', color: 'text-orange-400' };
    if (messageCount > 0) return { text: 'Rising...', color: 'text-ku-goldLight' };
    return { text: 'Waiting...', color: 'text-ku-textDim' };
  };

  const getGossipPotential = () => {
    if (chatStatus === 'analyzing' || chatStatus === 'responding') return { text: 'Examining 🔍', color: 'text-ku-tealLight' };
    if (chatStatus === 'ready') return { text: 'Off the charts', color: 'text-ku-tealLight' };
    if (messageCount > 3) return { text: 'Spreading...', color: 'text-ku-tealLight' };
    if (messageCount > 0) return { text: 'Brewing', color: 'text-ku-textMuted' };
    return { text: 'Dormant', color: 'text-ku-textDim' };
  };

  const judgement = getJudgementLevel();
  const gossip = getGossipPotential();

  return (
    <div className="px-5 py-1.5 flex items-center justify-between text-[11px] font-medium border-b border-ku-border bg-ku-bgLight/50 select-none shrink-0">
      <div className="flex items-center gap-1.5">
        <Flame className="w-3 h-3 text-orange-500" />
        <span className="text-ku-textDim">Judgement:</span>
        <span className={`font-bold ${judgement.color}`}>{judgement.text}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Eye className="w-3 h-3 text-ku-teal" />
        <span className="text-ku-textDim">Gossip:</span>
        <span className={`font-bold ${gossip.color}`}>{gossip.text}</span>
      </div>
    </div>
  );
};
