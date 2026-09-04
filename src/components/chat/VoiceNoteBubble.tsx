'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { VoiceNote } from '@/types/chat';

interface VoiceNoteBubbleProps {
  voiceNote: VoiceNote;
  speakerName: string;
  speakerAvatar?: string;
  content: string;
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  voiceNote,
  speakerName,
  speakerAvatar,
  content,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleVoiceNote = () => {
    setIsPlaying(!isPlaying);

    if ('speechSynthesis' in window) {
      if (!isPlaying) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          voiceNote.malayalamText || content
        );
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        window.speechSynthesis.cancel();
      }
    }
  };

  const waveformBars = [40, 70, 30, 90, 50, 100, 60, 80, 40, 70, 90, 50, 60, 80, 45, 75];

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-ku-bgLight/50 border border-ku-border">
      {/* Play/Pause */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={toggleVoiceNote}
        className="w-9 h-9 rounded-full bg-ku-teal hover:bg-ku-tealDark text-white flex items-center justify-center shrink-0 shadow-sm transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>

      {/* Waveform */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[2px] h-5 my-0.5">
          {waveformBars.map((h, i) => (
            <span
              key={i}
              className={`w-[2.5px] rounded-full bg-ku-teal/60 transition-all ${
                isPlaying ? 'animate-wave-bar' : ''
              }`}
              style={{
                height: isPlaying ? undefined : `${h * 0.16}px`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[10px] text-ku-textDim font-medium">
          <span>{speakerName}&apos;s voice note</span>
          <span>
            0:
            {voiceNote.durationSeconds < 10
              ? `0${voiceNote.durationSeconds}`
              : voiceNote.durationSeconds}
          </span>
        </div>
      </div>
    </div>
  );
};
