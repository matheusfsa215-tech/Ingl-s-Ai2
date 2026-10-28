import type { Level, Mode } from "@/lib/content";

export type CorrectionDTO = {
  id: string;
  original: string;
  correction: string;
  pt: string;
  es: string;
  category: string;
};

export type TutorNoteDTO = { word: string; pt: string; es: string };

export type MessageMeta = {
  corrected?: string;
  notes?: TutorNoteDTO[];
  fluency?: number;
  praise?: "clean" | "few" | "several";
  engine?: "engine" | "ai";
};

export type MessageDTO = {
  id: number;
  role: "user" | "assistant";
  content: string;
  translationPt: string | null;
  translationEs: string | null;
  corrections: CorrectionDTO[];
  meta: MessageMeta | null;
  createdAt: string;
};

export type ConversationDTO = {
  id: number;
  mode: Mode;
  level: Level;
  title: string;
  updatedAt: string;
};

export type ProfileDTO = {
  name: string;
  level: Level;
  goal: Mode;
  voice: string;
  xp: number;
  streak: number;
  uiLanguage: string;
};

export type AttemptDTO = {
  id: number;
  mode: Mode;
  difficulty: string;
  targetText: string;
  transcript: string;
  score: number;
  createdAt: string;
};
