-- =====================================================================
-- Fluentia · schema completo para o SQL Editor do Neon
-- Copia TUDO deste ficheiro e cola em: Neon Console → SQL Editor → Run
-- Pode ser executado várias vezes sem destruir dados (IF NOT EXISTS).
-- =====================================================================

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text DEFAULT 'Aprendiz' NOT NULL,
  "ui_language" text DEFAULT 'pt-PT' NOT NULL,
  "level" text DEFAULT 'B1' NOT NULL,
  "goal" text DEFAULT 'daily' NOT NULL,
  "voice" text DEFAULT 'en-GB' NOT NULL,
  "xp" integer DEFAULT 0 NOT NULL,
  "streak" integer DEFAULT 0 NOT NULL,
  "last_active_date" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "profile_id" text NOT NULL,
  "mode" text DEFAULT 'daily' NOT NULL,
  "level" text DEFAULT 'B1' NOT NULL,
  "title" text DEFAULT 'Nova conversa' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "translation_pt" text,
  "translation_es" text,
  "corrections" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "meta" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pronunciation_attempts" (
  "id" serial PRIMARY KEY NOT NULL,
  "profile_id" text NOT NULL,
  "challenge_id" text NOT NULL,
  "mode" text NOT NULL,
  "difficulty" text NOT NULL,
  "target_text" text NOT NULL,
  "transcript" text DEFAULT '' NOT NULL,
  "score" integer DEFAULT 0 NOT NULL,
  "breakdown" jsonb,
  "xp_earned" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---------------------------------------------------------------------
-- Se a base JÁ existia antes desta versão (só falta a coluna "meta" em
-- messages, usada pelas correções e pela fluência no chat):
-- ---------------------------------------------------------------------
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "meta" jsonb;

-- Conferir o resultado (devem aparecer 4 linhas):
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
