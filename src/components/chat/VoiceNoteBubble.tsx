'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { VoiceNote } from '@/types/chat';

interface VoiceNoteBubbleProps {
  voiceNote: VoiceNote;
  speakerName: string;
  speakerAvatar?: string;
  content: string;
}

/**
 * ---------------------------------------------------------------------------
 * Manglish -> Malayalam pronunciation layer
 * ---------------------------------------------------------------------------
 * This is ONLY used to build the string we hand to SpeechSynthesisUtterance.
 * It never touches what's rendered in the chat UI (that still uses `content`
 * exactly as before).
 *
 * Intentionally small and additive: unknown words are left untouched rather
 * than guessed at, so we never corrupt a sentence we don't recognize.
 * Longer phrases are matched before single words so things like
 * "ayyo mone" or "just asking alle" get a more natural combined reading.
 * ---------------------------------------------------------------------------
 */
const MANGLISH_PHRASE_MAP: Array<[string, string]> = [
  // Multi-word phrases first (checked before single words).
  ['ayyo mone', 'അയ്യോ മോനേ'],
  ['just asking alle', 'ജസ്റ്റ് ആസ്കിംഗ് അല്ലേ'],

  // Single words.
  ['ayyo', 'അയ്യോ'],
  ['mone', 'മോനേ'],
  ['monee', 'മോനേ'],
  ['eda', 'എടാ'],
  ['chetta', 'ചേട്ടാ'],
  ['alle', 'അല്ലേ'],
  ['entha', 'എന്താ'],
  ['ithokke', 'ഇതൊക്കെ'],
  ['ithu', 'ഇത്'],
  ['njan', 'ഞാൻ'],
  ['nee', 'നീ'],
  ['evida', 'എവിടാ'],
  ['poyi', 'പോയി'],
  ['veruthe', 'വെറുതെ'],
  ['chodichatha', 'ചോദിച്ചതാ'],
  ['kollam', 'കൊള്ളാം'],
  ['ammayodu', 'അമ്മയോട്'],
  ['serikkum', 'ശരിക്കും'],
  ['sherikkum', 'ശരിക്കും'],
  ['mmm', 'മ്മ്'],
];

// Words that deserve a small breathing pause after them when spoken, so the
// voice doesn't rush through an exclamation or filler sound. Matched against
// the *converted* Malayalam token.
const PAUSE_AFTER = new Set(['അയ്യോ', 'മ്മ്', 'അയ്യോ മോനേ']);

// Sort longest-phrase-first so multi-word entries are consumed before their
// single-word components would otherwise match.
const SORTED_MANGLISH_ENTRIES = [...MANGLISH_PHRASE_MAP].sort(
  (a, b) => b[0].split(' ').length - a[0].split(' ').length || b[0].length - a[0].length,
);

const escapeForRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Converts recognizable Kerala Manglish tokens/phrases in `text` into their
 * Malayalam-script equivalents for speech only. English words and anything
 * not in the small dictionary above are preserved as-is.
 */
function buildSpeechText(text: string): string {
  let result = text;

  for (const [manglish, malayalam] of SORTED_MANGLISH_ENTRIES) {
    // Word-boundary, case-insensitive match so "Ayyo", "AYYO", "ayyo" all hit.
    const pattern = new RegExp(`\\b${escapeForRegex(manglish)}\\b`, 'gi');
    result = result.replace(pattern, (match) => {
      const replacement = malayalam;
      return PAUSE_AFTER.has(replacement) ? `${replacement},` : replacement;
    });
  }

  // Collapse any accidental double punctuation/pauses introduced above.
  return result.replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' ').trim();
}

/**
 * ---------------------------------------------------------------------------
 * Character voice profiles
 * ---------------------------------------------------------------------------
 */
type CharacterKey = 'anjali' | 'latha' | 'soman' | 'sheela';

interface CharacterStyle {
  rate: number;
  pitch: number;
  gender: 'female' | 'male';
}

const CHARACTER_STYLES: Record<CharacterKey, CharacterStyle> = {
  // Sister — elegant, natural, slightly playful, a touch faster/higher.
  anjali: { rate: 1.0, pitch: 1.1, gender: 'female' },
  // Aunty — mature, slightly deeper, curious/gossip-like delivery -> slower.
  latha: { rate: 0.88, pitch: 0.86, gender: 'female' },
  // Uncle/Mama — mature, slower, serious.
  soman: { rate: 0.85, pitch: 0.78, gender: 'male' },
  // Amma — warm, motherly, medium/slower pace, natural pitch.
  sheela: { rate: 0.92, pitch: 0.98, gender: 'female' },
};

function detectCharacter(speakerName: string): CharacterKey {
  const name = speakerName.toLowerCase();

  if (name.includes('anjali') || name.includes('sister')) return 'anjali';
  if (name.includes('latha') || name.includes('aunty')) return 'latha';
  if (name.includes('soman') || name.includes('mama') || name.includes('uncle')) return 'soman';
  // Default / Sheela / Amma.
  return 'sheela';
}

// Only warn once per page load, and only if a Malayalam voice truly isn't
// available — we don't want to spam the console on every voice note click.
let hasWarnedNoMalayalamVoice = false;

function pickVoice(voices: SpeechSynthesisVoice[], character: CharacterKey): {
  voice: SpeechSynthesisVoice | null;
  usedFallback: boolean;
} {
  const malayalamVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('ml'));

  const genderHint = CHARACTER_STYLES[character].gender;
  const genderPattern =
    genderHint === 'female'
      ? /female|woman|lekha|veena|sangeetha|ananya/i
      : /male|man|hari|ravi|arun|mohan/i;

  if (malayalamVoices.length > 0) {
    const genderMatch = malayalamVoices.find((voice) => genderPattern.test(voice.name));
    return { voice: genderMatch || malayalamVoices[0], usedFallback: false };
  }

  // No Malayalam voice installed at all — fall back to the best available
  // Indian-English (or any) voice rather than crashing or going silent.
  if (!hasWarnedNoMalayalamVoice) {
    // eslint-disable-next-line no-console
    console.warn('No Malayalam browser voice available; using fallback voice.');
    hasWarnedNoMalayalamVoice = true;
  }

  const indianEnglish = voices.find((voice) => voice.lang.toLowerCase() === 'en-in');
  const anyEnglish = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));

  return { voice: indianEnglish || anyEnglish || voices[0] || null, usedFallback: true };
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  voiceNote,
  speakerName,
  speakerAvatar,
  content,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Guards against double-starts if the user clicks rapidly, and against a
  // stale async voice-load callback resurrecting an already-cancelled play.
  const playRequestIdRef = useRef(0);
  const isStartingRef = useRef(false);

  useEffect(() => {
    // Stop any in-flight speech for this bubble when it unmounts.
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        playRequestIdRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakWithVoices = useCallback(
    (voices: SpeechSynthesisVoice[], requestId: number) => {
      // If a newer play/stop request has come in since this async voice
      // load kicked off, don't start speaking — we'd be out of sync with
      // the UI's isPlaying state.
      if (requestId !== playRequestIdRef.current) {
        isStartingRef.current = false;
        return;
      }

      const character = detectCharacter(speakerName);
      const style = CHARACTER_STYLES[character];
      const rawText = voiceNote.malayalamText || content;
      const speechText = buildSpeechText(rawText);

      const utterance = new SpeechSynthesisUtterance(speechText);
      const { voice } = pickVoice(voices, character);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // No voices available at all (rare) — still hint the browser.
        utterance.lang = 'ml-IN';
      }

      utterance.rate = style.rate;
      utterance.pitch = style.pitch;

      utterance.onstart = () => {
        if (requestId === playRequestIdRef.current) {
          isStartingRef.current = false;
          setIsPlaying(true);
        }
      };

      utterance.onend = () => {
        if (requestId === playRequestIdRef.current) {
          setIsPlaying(false);
        }
      };

      utterance.onerror = () => {
        if (requestId === playRequestIdRef.current) {
          isStartingRef.current = false;
          setIsPlaying(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [content, speakerName, voiceNote.malayalamText],
  );

  const toggleVoiceNote = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Currently playing -> stop.
    if (isPlaying) {
      playRequestIdRef.current += 1;
      window.speechSynthesis.cancel();
      isStartingRef.current = false;
      setIsPlaying(false);
      return;
    }

    // Already mid-start from a very recent click -> ignore this extra click.
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    // Always cancel anything else that might be speaking (e.g. a different
    // voice note bubble) before starting this one.
    window.speechSynthesis.cancel();

    const requestId = playRequestIdRef.current + 1;
    playRequestIdRef.current = requestId;

    const existingVoices = window.speechSynthesis.getVoices();

    if (existingVoices.length > 0) {
      speakWithVoices(existingVoices, requestId);
      return;
    }

    // Voices aren't loaded yet (common on first use in Chrome) — wait for
    // the async voiceschanged event, then speak.
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      speakWithVoices(window.speechSynthesis.getVoices(), requestId);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Safety net: some browsers never fire voiceschanged if voices were
    // already cached internally. Re-check shortly after in case of a race.
    window.setTimeout(() => {
      if (requestId !== playRequestIdRef.current) return;
      const laterVoices = window.speechSynthesis.getVoices();
      if (laterVoices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        speakWithVoices(laterVoices, requestId);
      }
    }, 300);
  }, [isPlaying, speakWithVoices]);

  const waveformBars = [
    40, 70, 30, 90, 50, 100, 60, 80,
    40, 70, 90, 50, 60, 80, 45, 75
  ];

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-ku-bgLight/50 border border-ku-border">

      {/* Play / Pause */}
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
            0
            {voiceNote.durationSeconds < 10
              ? `0${voiceNote.durationSeconds}`
              : voiceNote.durationSeconds}
          </span>
        </div>
      </div>
    </div>
  );
};