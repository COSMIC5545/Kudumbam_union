export type PersonaId = 'sheela' | 'anjali' | 'soman' | 'latha';

export interface Persona {
  id: PersonaId;
  name: string; // Real Name (e.g. Sheela)
  realName: string;
  roleTag: string; // Secondary Role (e.g. Amma • Group Admin)
  relation: string;
  malayalamTitle: string;
  avatar: string;
  avatarBg: string;
  avatarEmoji: string; // Fallback emoji for avatar
  badgeColor: string;
  roleDescription: string;
  personality: string; // Short personality description
  statusQuote: string;
  typingSpeedMs: number;
}

export interface VoiceNote {
  durationSeconds: number;
  audioUrl?: string;
  transcription: string;
  malayalamText: string;
}

export interface Reaction {
  emoji: string;
  fromId: PersonaId | 'user';
}

export interface FamilyVerdictData {
  approvalRating: number; // 0 to 100
  title: string;
  summary: string;
  sheelaComment: string;
  anjaliComment: string;
  somanComment: string;
  lathaComment: string;
}

export interface Message {
  id: string;
  senderId: PersonaId | 'user';
  senderName: string;
  senderAvatar?: string;
  roleBadge?: string;
  content: string;
  malayalamTranslation?: string;
  timestamp: string;
  imageUrl?: string;
  imageCaption?: string;
  isVoiceNote?: boolean;
  voiceNoteData?: VoiceNote;
  isVerdict?: boolean;
  verdictData?: FamilyVerdictData;
  reactions?: Reaction[];
  status?: 'sent' | 'delivered' | 'read';
  isSystem?: boolean;
}

export type ChatStatus = 'idle' | 'uploading' | 'analyzing' | 'chatted' | 'verdict_ready';
