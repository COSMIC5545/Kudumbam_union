'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Message, ChatStatus, PersonaId, FamilySessionRecord, FamilyVerdictData, VisualContext } from '@/types/chat';

const STORAGE_KEY = 'kudumbam-union-history-v1';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });

const getTimeStamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const buildSessionDescription = (caption?: string, messageCount = 0) => {
  const trimmed = caption?.trim();
  if (trimmed) return trimmed;
  if (messageCount > 0) return `Family drama • ${messageCount} messages`;
  return 'Fresh family session';
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<FamilySessionRecord[]>([]);
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [userUploadedPhoto, setUserUploadedPhoto] = useState<string | null>(null);
  const [typingPersonaId, setTypingPersonaId] = useState<PersonaId | null>(null);
  const [voiceNotesEnabled, setVoiceNotesEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visualContext, setVisualContext] = useState<VisualContext | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const activeSessionIdRef = useRef<string | null>(null);
  const visualContextRef = useRef<VisualContext | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    visualContextRef.current = visualContext;
  }, [visualContext]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FamilySessionRecord[];
        if (Array.isArray(parsed)) {
          setChatHistory(parsed);
        }
      } catch {
        setChatHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingPersonaId]);

  const clearActiveConversation = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setUserUploadedPhoto(null);
    setTypingPersonaId(null);
    setChatStatus('idle');
    setErrorMessage(null);
    setVisualContext(null);
    setActiveSessionId(null);
    activeSessionIdRef.current = null;
  }, []);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const appendMessages = useCallback((items: Message[]) => {
    if (!items.length) return;
    setMessages((prev) => {
      const next = [...prev, ...items];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const ensureSessionId = useCallback((fallbackCaption?: string) => {
    const existing = activeSessionIdRef.current;
    if (existing) return existing;

    const nextSessionId = `session-${Date.now()}`;
    setActiveSessionId(nextSessionId);
    activeSessionIdRef.current = nextSessionId;
    return nextSessionId;
  }, []);

  const saveSessionToHistory = useCallback(
    (sessionId: string, caption: string, imageUrl?: string | null, finalVerdict?: FamilyVerdictData | null) => {
      const completedMessages = messagesRef.current;
      const record: FamilySessionRecord = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        caption: caption || undefined,
        imageUrl: imageUrl || undefined,
        visualContext: visualContextRef.current,
        messages: completedMessages,
        members: ['sheela', 'anjali', 'soman', 'latha'],
        finalVerdict: finalVerdict || null,
        description: buildSessionDescription(caption, completedMessages.length),
      };

      setChatHistory((prev) => [record, ...prev.filter((entry) => entry.id !== sessionId)]);
    },
    [],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      try {
        const userMessageText = text.trim();
        const sessionId = ensureSessionId(userMessageText);
        const userMsg: Message = {
          id: `user-${Date.now()}`,
          senderId: 'user',
          senderName: 'You',
          content: userMessageText,
          timestamp: getTimeStamp(),
          status: 'sent',
        };

        setChatStatus('responding');
        setErrorMessage(null);
        appendMessage(userMsg);
        saveSessionToHistory(sessionId, userMessageText, userUploadedPhoto || undefined, null);

        let previousSpeaker: PersonaId | null = null;
        const conversationMessages = [...messagesRef.current];

        for (let turn = 0; turn < 4; turn += 1) {
          const response = await fetch('/api/family', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'next-turn',
              userMessage: userMessageText,
              caption: userMessageText,
              visualContext: visualContextRef.current,
              conversationHistory: conversationMessages,
              previousSpeaker,
            }),
          });

          const resultPayload = await response.json();
          if (!response.ok || resultPayload?.error) {
            throw new Error(resultPayload?.error || 'The family could not respond.');
          }

          const result = resultPayload;
          const speaker = result.speaker as PersonaId;
          const responseText = result.message as string;
          const continueConversation = result.continueConversation !== false;

          if (!speaker || !responseText) break;

          setTypingPersonaId(speaker);
          await sleep(500 + (speaker === 'soman' ? 600 : speaker === 'latha' ? 400 : 300));
          setTypingPersonaId(null);

          const familyMessage: Message = {
            id: `family-${speaker}-${Date.now()}-${turn}`,
            senderId: speaker,
            senderName: speaker === 'sheela' ? 'Meera Amma' : speaker === 'anjali' ? 'Anjali' : speaker === 'soman' ? 'Rajeevan Mama' : 'Latha Aunty',
            content: responseText,
            timestamp: getTimeStamp(),
            status: 'read',
            isVoiceNote: voiceNotesEnabled && (speaker === 'soman' || speaker === 'latha' || speaker === 'sheela') && turn % 2 === 0,
            voiceNoteData: voiceNotesEnabled && (speaker === 'soman' || speaker === 'latha' || speaker === 'sheela') && turn % 2 === 0
              ? {
                  durationSeconds: 18,
                  transcription: responseText,
                  malayalamText: responseText,
                }
              : undefined,
          };

          conversationMessages.push(familyMessage);
          appendMessage(familyMessage);
          saveSessionToHistory(sessionId, userMessageText, userUploadedPhoto || undefined, null);
          previousSpeaker = speaker;

          if (!continueConversation) break;
        }

        setChatStatus('ready');
        setTypingPersonaId(null);
      } catch (error) {
        console.error(error);
        setChatStatus('error');
        setTypingPersonaId(null);
        setErrorMessage('Family network is having some issues 😭 Please retry.');
      }
    },
    [appendMessage, ensureSessionId, saveSessionToHistory, userUploadedPhoto, voiceNotesEnabled],
  );

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handlePhotoSelected = useCallback(
    async (fileOrUrl: File | string, caption: string) => {
      const nextSessionId = `session-${Date.now()}`;
      setActiveSessionId(nextSessionId);
      activeSessionIdRef.current = nextSessionId;
      setErrorMessage(null);
      setChatStatus('analyzing');
      setTypingPersonaId(null);
      setVisualContext(null);

      const previewUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
      setUserUploadedPhoto(previewUrl);
      setShowPhotoModal(false);

      const photoMessage: Message = {
        id: `user-photo-${Date.now()}`,
        senderId: 'user',
        senderName: 'You',
        content: caption || 'Shared a photo for family review.',
        imageUrl: previewUrl,
        imageCaption: caption || undefined,
        timestamp: getTimeStamp(),
        status: 'read',
      };

      appendMessage(photoMessage);

      try {
        const imagePayload = typeof fileOrUrl === 'string' ? fileOrUrl : await readFileAsDataUrl(fileOrUrl);

        const analysisResponse = await fetch('/api/family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze',
            imageUrl: imagePayload,
            caption,
          }),
        });

        const analysisPayload = await analysisResponse.json();
        if (!analysisResponse.ok || analysisPayload?.error) {
          throw new Error(analysisPayload?.error || 'Unable to analyze the uploaded image.');
        }

        const context = analysisPayload.visualContext as VisualContext;
        setVisualContext(context);
        visualContextRef.current = context;

        const conversationMessages: Message[] = [...messagesRef.current];
        let previousSpeaker: PersonaId | null = null;

        for (let turn = 0; turn < 6; turn += 1) {
          setChatStatus('responding');
          const response = await fetch('/api/family', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'next-turn',
              imageUrl: imagePayload,
              caption,
              visualContext: context,
              conversationHistory: conversationMessages,
              previousSpeaker,
            }),
          });

          const resultPayload = await response.json();
          if (!response.ok || resultPayload?.error) {
            throw new Error(resultPayload?.error || 'The family could not respond.');
          }

          const result = resultPayload;
          const speaker = result.speaker as PersonaId;
          const text = result.message as string;
          const continueConversation = result.continueConversation !== false;

          if (!speaker || !text) break;

          setTypingPersonaId(speaker);
          await sleep(700 + (speaker === 'soman' ? 500 : 250));
          setTypingPersonaId(null);

          const familyMessage: Message = {
            id: `family-${speaker}-${Date.now()}-${turn}`,
            senderId: speaker,
            senderName: speaker === 'sheela' ? 'Meera Amma' : speaker === 'anjali' ? 'Anjali' : speaker === 'soman' ? 'Rajeevan Mama' : 'Latha Aunty',
            content: text,
            timestamp: getTimeStamp(),
            status: 'read',
            isVoiceNote: voiceNotesEnabled && (speaker === 'soman' || speaker === 'latha' || speaker === 'sheela') && turn % 2 === 0,
            voiceNoteData: voiceNotesEnabled && (speaker === 'soman' || speaker === 'latha' || speaker === 'sheela') && turn % 2 === 0
              ? {
                  durationSeconds: 18,
                  transcription: text,
                  malayalamText: text,
                }
              : undefined,
          };

          conversationMessages.push(familyMessage);
          appendMessage(familyMessage);
          previousSpeaker = speaker;

          if (!continueConversation) break;
        }

        const verdictResponse = await fetch('/api/family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'finalize-verdict',
            imageUrl: imagePayload,
            caption,
            visualContext: context,
            conversationHistory: conversationMessages,
          }),
        });

        const verdictPayload = await verdictResponse.json();
        if (!verdictResponse.ok || verdictPayload?.error) {
          throw new Error(verdictPayload?.error || 'The family verdict could not be generated.');
        }

        const verdictData = verdictPayload.verdict as FamilyVerdictData;
        const verdictMessage: Message = {
          id: `verdict-${Date.now()}`,
          senderId: 'system',
          senderName: 'Family Verdict',
          content: verdictData?.summary || 'The family has spoken.',
          timestamp: getTimeStamp(),
          status: 'read',
          isVerdict: true,
          verdictData,
          isSystem: true,
        };

        appendMessage(verdictMessage);
        setTypingPersonaId(null);
        setChatStatus('ready');
        setVisualContext(context);
        visualContextRef.current = context;
        saveSessionToHistory(nextSessionId, caption, previewUrl, verdictData);
      } catch (error) {
        console.error(error);
        setChatStatus('error');
        setTypingPersonaId(null);
        setErrorMessage('The family hit a glitch. Please try another photo or retry.');
      }
    },
    [appendMessage, saveSessionToHistory, voiceNotesEnabled],
  );

  const handleHistoryLoad = useCallback((session: FamilySessionRecord) => {
    setMessages(session.messages);
    messagesRef.current = session.messages;
    setUserUploadedPhoto(session.imageUrl || null);
    setChatStatus('ready');
    setTypingPersonaId(null);
    setErrorMessage(null);
    setVisualContext(session.visualContext || null);
    visualContextRef.current = session.visualContext || null;
    setActiveSessionId(session.id);
    activeSessionIdRef.current = session.id;
    setIsHistoryOpen(false);
  }, []);

  const handleDemoMode = useCallback(() => {
    void handleSendMessage('hi everyone');
  }, [handleSendMessage]);

  const handleDeleteHistoryItem = useCallback((sessionId: string) => {
    setChatHistory((prev) => prev.filter((session) => session.id !== sessionId));
  }, []);

  const handleClearHistory = useCallback(() => {
    const confirmed = window.confirm('Clear all saved family chat history?');
    if (confirmed) {
      setChatHistory([]);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <main className="h-screen w-screen bg-slate-950 flex flex-col justify-center items-center overflow-hidden font-sans p-0 sm:p-4">
        <div className="absolute top-0 left-1/4 w-[34rem] h-[34rem] bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[34rem] h-[34rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full max-w-6xl sm:h-[92vh] sm:rounded-3xl shadow-2xl shadow-teal-950/40 flex flex-col bg-family-cream dark:bg-family-creamDark overflow-hidden border border-slate-800/80 relative z-10"
        >
          <FamilyHeader
            onOpenInfo={() => setIsMemberDrawerOpen(true)}
            onNewCase={clearActiveConversation}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onClearHistory={handleClearHistory}
            onToggleVoiceNotes={() => setVoiceNotesEnabled((prev) => !prev)}
            onDemoMode={handleDemoMode}
            voiceNotesEnabled={voiceNotesEnabled}
            isAnalyzing={chatStatus === 'analyzing' || chatStatus === 'responding'}
            typingPersonaId={typingPersonaId}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 family-wallpaper-light dark:family-wallpaper-dark flex flex-col space-y-3 relative">
            {errorMessage && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            {messages.length === 0 && !userUploadedPhoto && (
              <EmptyState />
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            <AnimatePresence>
              {typingPersonaId && <TypingIndicator typingPersonaId={typingPersonaId} />}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          <ChatInputBar
            onSendMessage={handleSendMessage}
            onOpenPhotoPicker={() => setShowPhotoModal(true)}
            disabled={chatStatus === 'analyzing' || chatStatus === 'responding' || typingPersonaId !== null}
          />

          <MemberDrawer
            isOpen={isMemberDrawerOpen}
            onClose={() => setIsMemberDrawerOpen(false)}
          />

          <FamilyRulesModal
            isOpen={isRulesModalOpen}
            onClose={() => setIsRulesModalOpen(false)}
          />

          <AboutModal
            isOpen={isAboutModalOpen}
            onClose={() => setIsAboutModalOpen(true)}
          />

          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
              >
                <motion.aside
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  className="relative w-full max-w-md h-full bg-ku-surface border-l border-ku-border shadow-glass overflow-y-auto p-4"
                >
                  <div className="flex items-center justify-between border-b border-ku-border pb-3 mb-4">
                    <h2 className="font-display text-base font-bold text-ku-text">Chat History</h2>
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(false)}
                      className="text-ku-textMuted hover:text-ku-text text-xs"
                    >
                      Close
                    </button>
                  </div>

                  {chatHistory.length === 0 ? (
                    <div className="rounded-2xl border border-ku-border bg-ku-bgLight p-4 text-sm text-ku-textMuted">
                      No saved family drama yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((session) => (
                        <div
                          key={session.id}
                          className="rounded-2xl border border-ku-border bg-ku-bgLight p-3"
                        >
                          <div className="flex gap-3">
                            {session.imageUrl && (
                              <img
                                src={session.imageUrl}
                                alt={session.description || 'Session preview'}
                                className="h-16 w-16 object-cover rounded-xl border border-ku-border"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleHistoryLoad(session)}
                                className="text-left w-full"
                              >
                                <div className="text-[10px] uppercase tracking-wide text-ku-tealLight mb-1">
                                  {new Date(session.createdAt).toLocaleString()}
                                </div>
                                <div className="text-sm font-semibold text-ku-text line-clamp-2">
                                  {session.description || 'Family chat session'}
                                </div>
                                <div className="text-[11px] text-ku-textMuted mt-1">
                                  {session.messages.length} messages
                                </div>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryItem(session.id)}
                              className="text-[10px] text-red-300 hover:text-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="mt-5 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
                  >
                    Clear Chat History
                  </button>
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>

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
                    isProcessing={chatStatus === 'analyzing' || chatStatus === 'responding'}
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
