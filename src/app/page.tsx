'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Eye, Flame, ShieldAlert } from 'lucide-react';
import { WhatsAppHeader as FamilyHeader } from '@/components/chat/WhatsAppHeader';
import { PhotoUploadZone } from '@/components/chat/PhotoUploadZone';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { GroupInfoDrawer as MemberDrawer } from '@/components/chat/GroupInfoDrawer';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EmptyState } from '@/components/chat/EmptyState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { FamilyRulesModal } from '@/components/chat/FamilyRulesModal';
import { AboutModal } from '@/components/chat/AboutModal';
import { Message, ChatStatus, PersonaId } from '@/types/chat';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]); // 100% EMPTY CHAT START
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [userUploadedPhoto, setUserUploadedPhoto] = useState<string | null>(null);
  const [typingPersonaId, setTypingPersonaId] = useState<PersonaId | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingPersonaId]);

  // Handle local text message from user input
  const handleSendMessage = (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      senderId: 'user',
      senderName: 'You',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMsg]);
  };

  // Handle Photo selection from dropzone (No AI generated in this step)
  const handlePhotoSelected = (fileOrUrl: File | string, caption: string) => {
    const photoUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    setUserUploadedPhoto(photoUrl);

    const photoMsg: Message = {
      id: `user-photo-${Date.now()}`,
      senderId: 'user',
      senderName: 'You',
      content: caption || '',
      imageUrl: photoUrl,
      imageCaption: caption || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setMessages((prev) => [...prev, photoMsg]);
    setShowPhotoModal(false);
    setChatStatus('analyzing');
  };

  // Reset conversation to clean new case
  const handleResetChat = () => {
    setMessages([]);
    setUserUploadedPhoto(null);
    setChatStatus('idle');
    setTypingPersonaId(null);
  };

  return (
    <>
      {/* Full-Screen Polished Loading Screen */}
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <main className="h-screen w-screen bg-slate-950 flex flex-col justify-center items-center overflow-hidden font-sans p-0 sm:p-4">
        {/* Ambient Glow Lighting */}
        <div className="absolute top-0 left-1/4 w-[34rem] h-[34rem] bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[34rem] h-[34rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Wide Desktop Web Application Shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full max-w-6xl sm:h-[92vh] sm:rounded-3xl shadow-2xl shadow-teal-950/40 flex flex-col bg-family-cream dark:bg-family-creamDark overflow-hidden border border-slate-800/80 relative z-10"
        >
          {/* Wide Desktop Header */}
          <FamilyHeader
            onOpenInfo={() => setIsMemberDrawerOpen(true)}
            onNewCase={handleResetChat}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            isAnalyzing={chatStatus === 'analyzing'}
            typingPersonaId={typingPersonaId}
          />

          {/* Humorous Status Bar */}
          <div className="bg-amber-100/90 dark:bg-slate-800/90 px-6 py-2 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-amber-200/60 dark:border-slate-700/60 select-none">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Judgement Level: <strong className="text-rose-600 dark:text-rose-400">HIGH (100%)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Family Privacy: <strong className="text-amber-600 dark:text-amber-400">0% 😂</strong></span>
            </div>
          </div>

          {/* Scrollable Conversation Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 family-wallpaper-light dark:family-wallpaper-dark flex flex-col space-y-3 relative">
            {/* Empty Initial Chat State */}
            {messages.length === 0 && !userUploadedPhoto && (
              <EmptyState onOpenUpload={() => setShowPhotoModal(true)} />
            )}

            {/* Conversation Feed */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Dynamic Typing Indicator */}
            <AnimatePresence>
              {typingPersonaId && <TypingIndicator typingPersonaId={typingPersonaId} />}
            </AnimatePresence>

            {/* Hero Upload Dropzone when evidence not yet submitted */}
            {messages.length > 0 && !userUploadedPhoto && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-4"
              >
                <PhotoUploadZone
                  onPhotoSelected={handlePhotoSelected}
                  isProcessing={chatStatus === 'analyzing'}
                />
              </motion.div>
            )}

            {/* Reset Case FAB Button */}
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-4"
              >
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-extrabold shadow-lg border border-amber-500/40 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Clean Family Case (Reset)
                </button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <ChatInputBar
            onSendMessage={handleSendMessage}
            onOpenPhotoPicker={() => setShowPhotoModal(true)}
            disabled={chatStatus === 'analyzing' || typingPersonaId !== null}
          />

          {/* Member Side Drawer */}
          <MemberDrawer
            isOpen={isMemberDrawerOpen}
            onClose={() => setIsMemberDrawerOpen(false)}
          />

          {/* Family Rules Modal */}
          <FamilyRulesModal
            isOpen={isRulesModalOpen}
            onClose={() => setIsRulesModalOpen(false)}
          />

          {/* About Kudumbam Union Modal */}
          <AboutModal
            isOpen={isAboutModalOpen}
            onClose={() => setIsAboutModalOpen(false)}
          />

          {/* Photo Upload Modal */}
          <AnimatePresence>
            {showPhotoModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-lg relative"
                >
                  <PhotoUploadZone
                    onPhotoSelected={handlePhotoSelected}
                    isProcessing={chatStatus === 'analyzing'}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
}
