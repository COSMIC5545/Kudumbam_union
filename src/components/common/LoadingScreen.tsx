'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  { text: 'Connecting to family gossip...', emoji: '📡' },
  { text: 'Checking who is already judging...', emoji: '👀' },
  { text: 'Latha Aunty is already suspicious...', emoji: '🤔' },
  { text: "You're in.", emoji: '✅' },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let completed = false;

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= LOADING_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 600);

    const timer = setTimeout(() => {
      if (cancelled || completed) return;
      completed = true;
      onCompleteRef.current();
    }, 2800);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-ku-bg font-sans select-none overflow-hidden"
    >
      {/* Background ambience */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-ku-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-ku-gold/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm mx-auto px-6"
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-ku-teal via-emerald-500 to-ku-gold p-[2px] shadow-glow-teal"
        >
          <div className="w-full h-full bg-ku-bg rounded-[14px] flex items-center justify-center text-3xl">
            🌴
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="font-display font-black text-2xl sm:text-3xl text-ku-text tracking-tight mb-1">
          Kudumbam Union
        </h1>
        <p className="text-[11px] font-semibold text-ku-teal uppercase tracking-[0.2em] mb-8">
          Kerala Family Group Chat
        </p>

        {/* Loading Message */}
        <div className="h-8 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-sm text-ku-textMuted"
            >
              <span>{LOADING_STEPS[stepIndex].emoji}</span>
              <span className="font-medium">{LOADING_STEPS[stepIndex].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-ku-surface rounded-full mx-auto overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.6, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-ku-teal to-ku-gold rounded-full"
          />
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={onComplete}
          className="mt-6 text-[11px] text-ku-textDim hover:text-ku-textMuted transition-colors font-medium"
        >
          Skip →
        </button>
      </motion.div>
    </motion.div>
  );
};
