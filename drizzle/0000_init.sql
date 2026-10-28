CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"mode" text DEFAULT 'daily' NOT NULL,
	"level" text DEFAULT 'B1' NOT NULL,
	"title" text DEFAULT 'Nova conversa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
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
--> statement-breakpoint
CREATE TABLE "profiles" (
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
--> statement-breakpoint
CREATE TABLE "pronunciation_attempts" (
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
