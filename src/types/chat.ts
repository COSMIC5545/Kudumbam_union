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

export interface VisualContext {
  people: number;
  visible_people_description: string[];
  setting: string;
  objects: string[];
  activities: string[];
  food_or_drink: string[];
  notable_details: string[];
  relationship_unknown: boolean;
  social_context: string;
  gossip_potential: number;
}

export interface FamilyConversationTurn {
  speaker: PersonaId;
  message: string;
  messageType?: 'text' | 'voice_note' | 'reaction';
  replyTo?: string | null;
  emotion?: string;
  continueConversation: boolean;
  isVerdict?: boolean;
  verdict?: FamilyVerdictData;
}

export interface FamilySessionRecord {
  id: string;
  createdAt: string;
  caption?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  visualContext?: VisualContext | null;
  messages: Message[];
  members: PersonaId[];
  finalVerdict?: FamilyVerdictData | null;
  description?: string;
}

export interface Message {
  id: string;
  senderId: PersonaId | 'user' | 'system';
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

export type ChatStatus = 'idle' | 'uploading' | 'analyzing' | 'responding' | 'ready' | 'error';
