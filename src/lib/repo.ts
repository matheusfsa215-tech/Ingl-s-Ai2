import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, profiles, pronunciationAttempts } from "@/db/schema";
import { MODE_META, type Level, type Mode } from "@/lib/content";
import { openingMessage, type Correction } from "@/lib/tutor";
import type { ConversationDTO, CorrectionDTO, MessageDTO, MessageMeta } from "@/lib/types";

export type Profile = typeof profiles.$inferSelect;
export type ConversationRow = typeof conversations.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
export type AttemptRow = typeof pronunciationAttempts.$inferSelect;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const LEVEL_TRACK: { level: Level; at: number }[] = [
  { level: "A2", at: 0 },
  { level: "B1", at: 150 },
  { level: "B2", at: 400 },
  { level: "C1", at: 800 },
];

export function levelTrack(xp: number) {
  let current = LEVEL_TRACK[0];
  for (const entry of LEVEL_TRACK) {
    if (xp >= entry.at) current = entry;
  }
  const next = LEVEL_TRACK.find((entry) => entry.at > xp) ?? null;
  const span = next ? next.at - current.at : 1;
  const progress = next ? Math.min(100, Math.round(((xp - current.at) / span) * 100)) : 100;
  return { level: current.level, nextLevel: next?.level ?? null, progress, nextAt: next?.at ?? null };
}

export async function getOrCreateProfile(id: string): Promise<Profile> {
  const found = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  if (found[0]) return found[0];
  const inserted = await db.insert(profiles).values({ id }).onConflictDoNothing().returning();
  if (inserted[0]) return inserted[0];
  const retry = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  if (!retry[0]) throw new Error("Não foi possível criar o perfil de aprendiz.");
  return retry[0];
}

export async function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, "name" | "level" | "goal" | "voice" | "uiLanguage">>,
): Promise<Profile> {
  const [updated] = await db
    .update(profiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return updated;
}

export async function recordActivity(profileId: string, xpDelta = 0): Promise<Profile | null> {
  const profile = await getOrCreateProfile(profileId);
  const today = isoDate(new Date());
  if (profile.lastActiveDate === today && xpDelta === 0) return profile;
  const yesterday = isoDate(new Date(Date.now() - 86_400_000));
  const streak =
    profile.lastActiveDate === today
      ? profile.streak
      : profile.lastActiveDate === yesterday
        ? profile.streak + 1
        : 1;
  const [updated] = await db
    .update(profiles)
    .set({
      xp: Math.max(0, profile.xp + xpDelta),
      streak,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
    .returning();
  return updated ?? null;
}

export async function listConversations(profileId: string, limit = 12) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.profileId, profileId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
}

export async function createConversation(profileId: string, mode: Mode, level: Level) {
  const title = `${MODE_META[mode].emoji} ${MODE_META[mode].name.pt}`;
  const [conversation] = await db
    .insert(conversations)
    .values({ profileId, mode, level, title })
    .returning();
  const opening = openingMessage(mode, level);
  const [first] = await db
    .insert(messages)
    .values({
      conversationId: conversation.id,
      role: "assistant",
      content: opening.content,
      translationPt: opening.translationPt,
      translationEs: opening.translationEs,
      corrections: [],
    })
    .returning();
  return { conversation, firstMessage: first };
}

export async function getConversation(profileId: string, conversationId: number) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.profileId, profileId)))
    .limit(1);
  if (!conversation) return null;
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.id);
  return { conversation, messages: rows };
}

export async function appendMessage(values: {
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  translationPt?: string | null;
  translationEs?: string | null;
  corrections?: Correction[];
  meta?: MessageMeta | null;
}): Promise<MessageRow> {
  const [row] = await db
    .insert(messages)
    .values({
      conversationId: values.conversationId,
      role: values.role,
      content: values.content,
      translationPt: values.translationPt ?? null,
      translationEs: values.translationEs ?? null,
      corrections: values.corrections ?? [],
      meta: values.meta ?? null,
    })
    .returning();
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, values.conversationId));
  return row;
}

export function toMessageDTO(row: MessageRow): MessageDTO {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    translationPt: row.translationPt,
    translationEs: row.translationEs,
    corrections: ((row.corrections as unknown[]) ?? []) as CorrectionDTO[],
    meta: (row.meta as MessageMeta | null) ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export function toConversationDTO(row: ConversationRow): ConversationDTO {
  return {
    id: row.id,
    mode: row.mode as Mode,
    level: row.level as Level,
    title: row.title,
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function deleteConversation(profileId: string, conversationId: number) {
  const owned = await getConversation(profileId, conversationId);
  if (!owned) return false;
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
  await db
    .delete(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.profileId, profileId)));
  return true;
}

export async function saveAttempt(values: {
  profileId: string;
  challengeId: string;
  mode: Mode;
  difficulty: string;
  targetText: string;
  transcript: string;
  score: number;
  breakdown: unknown;
  xpEarned: number;
}) {
  const [row] = await db.insert(pronunciationAttempts).values(values).returning();
  await recordActivity(values.profileId, values.xpEarned);
  return row;
}

export type RecentCorrection = Correction & { messageCreatedAt: string; mode: Mode };

export async function getStats(profileId: string) {
  const profile = await getOrCreateProfile(profileId);
  const conversationRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.profileId, profileId))
    .orderBy(desc(conversations.updatedAt));

  const conversationIds = conversationRows.map((row) => row.id);
  const messageRows = conversationIds.length
    ? await db
        .select()
        .from(messages)
        .where(inArray(messages.conversationId, conversationIds))
        .orderBy(desc(messages.id))
        .limit(400)
    : [];

  const attempts = await db
    .select()
    .from(pronunciationAttempts)
    .where(eq(pronunciationAttempts.profileId, profileId))
    .orderBy(desc(pronunciationAttempts.id))
    .limit(60);

  const userMessages = messageRows.filter((row) => row.role === "user");
  const correctionTotal = userMessages.reduce(
    (sum, row) => sum + ((row.corrections as unknown[])?.length ?? 0),
    0,
  );
  const words = new Set<string>();
  for (const row of userMessages) {
    for (const token of row.content.toLowerCase().split(/[^a-z']+/)) {
      if (token.length > 2) words.add(token);
    }
  }

  const activeDays = new Set<string>();
  for (const row of [...messageRows, ...attempts]) {
    activeDays.add(isoDate(new Date(row.createdAt)));
  }
  const lastSeven = [...Array(7)].map((_, index) =>
    isoDate(new Date(Date.now() - index * 86_400_000)),
  );
  const consistency = Math.round((lastSeven.filter((day) => activeDays.has(day)).length / 7) * 100);

  const scores = attempts.map((row) => row.score);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const grammar =
    userMessages.length > 0
      ? Math.max(20, Math.min(100, Math.round(100 - (correctionTotal / userMessages.length) * 18)))
      : 0;
  const fluency = userMessages.length
    ? Math.max(
        20,
        Math.min(
          100,
          Math.round(
            (userMessages.reduce((sum, row) => sum + row.content.split(/\s+/).length, 0) /
              userMessages.length) *
              5,
          ),
        ),
      )
    : 0;

  const recentCorrections: RecentCorrection[] = [];
  for (const row of userMessages) {
    const list = (row.corrections as unknown[]) ?? [];
    const conversation = conversationRows.find((item) => item.id === row.conversationId);
    for (const item of list) {
      const correction = item as Correction;
      if (!correction?.original) continue;
      recentCorrections.push({
        ...correction,
        messageCreatedAt: new Date(row.createdAt).toISOString(),
        mode: (conversation?.mode ?? "daily") as Mode,
      });
      if (recentCorrections.length >= 8) break;
    }
    if (recentCorrections.length >= 8) break;
  }

  const perMode = (["daily", "work", "social", "technical"] as Mode[]).map((mode) => {
    const modeAttempts = attempts.filter((row) => row.mode === mode);
    return {
      mode,
      attempts: modeAttempts.length,
      avgScore: modeAttempts.length
        ? Math.round(modeAttempts.reduce((sum, row) => sum + row.score, 0) / modeAttempts.length)
        : 0,
    };
  });

  return {
    profile,
    xp: profile.xp,
    streak: profile.streak,
    level: levelTrack(profile.xp),
    conversations: conversationRows.length,
    messages: messageRows.length,
    userMessages: userMessages.length,
    corrections: correctionTotal,
    vocabulary: words.size,
    consistency,
    attempts: attempts.length,
    avgScore,
    bestScore: scores.length ? Math.max(...scores) : 0,
    grammar,
    fluency,
    perMode,
    recentCorrections,
    recentAttempts: attempts.slice(0, 6).map((row) => ({
      id: row.id,
      mode: row.mode as Mode,
      difficulty: row.difficulty,
      targetText: row.targetText,
      transcript: row.transcript,
      score: row.score,
      createdAt: new Date(row.createdAt).toISOString(),
    })),
    recentConversations: conversationRows.slice(0, 5).map((row) => ({
      id: row.id,
      mode: row.mode as Mode,
      level: row.level,
      title: row.title,
      updatedAt: new Date(row.updatedAt).toISOString(),
    })),
  };
}
