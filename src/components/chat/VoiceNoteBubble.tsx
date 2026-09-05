'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Loader2 } from 'lucide-react';
import { VoiceNote } from '@/types/chat';

interface VoiceNoteBubbleProps {
  voiceNote: VoiceNote;
  speakerName: string;
  speakerAvatar?: string;
  content: string;
}

type Character = 'sister' | 'aunty' | 'amma' | 'uncle';

function detectCharacter(speakerName: string): Character {
  const name = speakerName.toLowerCase();

  if (
    name.includes('anjali') ||
    name.includes('sister')
  ) {
    return 'sister';
  }

  if (
    name.includes('latha') ||
    name.includes('aunty')
  ) {
    return 'aunty';
  }

  if (
    name.includes('sheela') ||
    name.includes('amma')
  ) {
    return 'amma';
  }

  if (
    name.includes('soman') ||
    name.includes('mama') ||
    name.includes('uncle')
  ) {
    return 'uncle';
  }

  return 'amma';
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  voiceNote,
  speakerName,
  content,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const waveformBars = [
    40, 70, 30, 90, 50, 100, 60, 80,
    40, 70, 90, 50, 60, 80, 45, 75,
  ];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
  };

  const playVoice = async () => {
    try {
      setError(null);

      const character = detectCharacter(speakerName);

      // Uncle intentionally has no voice.
      if (character === 'uncle') {
        setError('This family member only sends text 😭');
        return;
      }

      // If audio is already loaded, just play it.
      if (audioRef.current) {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      setIsLoading(true);

      /*
       * The chat UI continues displaying Manglish.
       *
       * If the AI has already generated Malayalam pronunciation text,
       * use that internally for ElevenLabs. Otherwise fall back to the
       * visible message.
       */
      const speechText =
        voiceNote.malayalamText?.trim() || content;

      const response = await fetch('/api/voice-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character,
          text: speechText,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        let message = 'Voice generation failed';

        try {
          const parsed = JSON.parse(errorText);
          message = parsed.error || message;
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const audioBuffer = await response.arrayBuffer();

      const blob = new Blob([audioBuffer], {
        type: 'audio/mpeg',
      });

      const audioUrl = URL.createObjectURL(blob);

      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        setError('Could not play this voice note');
      };

      await audio.play();

      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Voice note error:', err);

      setIsLoading(false);
      setIsPlaying(false);

      setError(
        err instanceof Error
          ? err.message
          : 'Voice generation failed'
      );
    }
  };

  const toggleVoiceNote = () => {
    if (isLoading) return;

    if (isPlaying) {
      stopAudio();
      return;
    }

    void playVoice();
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-ku-bgLight/50 border border-ku-border">

      {/* Play / Pause */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={toggleVoiceNote}
        disabled={isLoading}
        aria-label={
          isLoading
            ? 'Loading voice note'
            : isPlaying
              ? 'Pause voice note'
              : 'Play voice note'
        }
        className="w-9 h-9 rounded-full bg-ku-teal hover:bg-ku-tealDark text-white flex items-center justify-center shrink-0 shadow-sm transition-colors disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </motion.button>

      {/* Waveform */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[2px] h-5 my-0.5">
          {waveformBars.map((height, index) => (
            <span
              key={index}
              className={`w-[2.5px] rounded-full bg-ku-teal/60 transition-all ${
                isPlaying ? 'animate-wave-bar' : ''
              }`}
              style={{
                height: isPlaying
                  ? undefined
                  : `${height * 0.16}px`,
                animationDelay: `${index * 0.08}s`,
              }}
            />
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] text-ku-textDim font-medium">
          <span>
            {speakerName}&apos;s voice note
          </span>

          <span>
            0
            {voiceNote.durationSeconds < 10
              ? `0${voiceNote.durationSeconds}`
              : voiceNote.durationSeconds}
          </span>
        </div>

        {error && (
          <div className="text-[9px] text-red-500 mt-1 truncate">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};