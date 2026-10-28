import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Aprendiz"),
  uiLanguage: text("ui_language").notNull().default("pt-PT"),
  level: text("level").notNull().default("B1"),
  goal: text("goal").notNull().default("daily"),
  voice: text("voice").notNull().default("en-GB"),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull(),
  mode: text("mode").notNull().default("daily"),
  level: text("level").notNull().default("B1"),
  title: text("title").notNull().default("Nova conversa"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  translationPt: text("translation_pt"),
  translationEs: text("translation_es"),
  corrections: jsonb("corrections").$type<unknown[]>().notNull().default([]),
  meta: jsonb("meta").$type<unknown>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pronunciationAttempts = pgTable("pronunciation_attempts", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull(),
  challengeId: text("challenge_id").notNull(),
  mode: text("mode").notNull(),
  difficulty: text("difficulty").notNull(),
  targetText: text("target_text").notNull(),
  transcript: text("transcript").notNull().default(""),
  score: integer("score").notNull().default(0),
  breakdown: jsonb("breakdown").$type<unknown>(),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
