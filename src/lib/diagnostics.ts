import { sql } from "drizzle-orm";
import { db } from "@/db";

export type CheckStatus = "ok" | "warn" | "fail";

export type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

const TABLES = ["profiles", "conversations", "messages", "pronunciation_attempts"];

export async function runServerChecks(): Promise<Check[]> {
  const checks: Check[] = [];

  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    checks.push({
      id: "env",
      label: "Variável DATABASE_URL",
      status: "fail",
      detail: "Não está definida. Vercel → Settings → Environment Variables e faz Redeploy.",
    });
    return checks;
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "(formato inválido)";
    }
  })();
  const pooled = host.includes("-pooler");
  checks.push({
    id: "env",
    label: "Variável DATABASE_URL",
    status: "ok",
    detail: `Host: ${host}${pooled ? " (pooled ✓)" : " (sem -pooler: recomendado usar a string pooled na Vercel)"}`,
  });

  checks.push({
    id: "ssl",
    label: "SSL obrigatório",
    status: /sslmode=require/.test(url) || !/localhost|127\.0\.0\.1/.test(host) ? "ok" : "warn",
    detail: /sslmode=require/.test(url)
      ? "A string inclui sslmode=require."
      : "Sem sslmode=require: a app força SSL em hosts remotos, mas convém acrescentar.",
  });

  try {
    await db.execute(sql`select 1`);
    checks.push({
      id: "connection",
      label: "Ligação ao PostgreSQL",
      status: "ok",
      detail: "select 1 respondeu. Base acessível.",
    });
  } catch (error) {
    checks.push({
      id: "connection",
      label: "Ligação ao PostgreSQL",
      status: "fail",
      detail:
        error instanceof Error
          ? `${error.message} — confirma a connection string (pooled) e o estado do projeto Neon.`
          : "Falhou. Confirma a DATABASE_URL.",
    });
    return checks;
  }

  try {
    const result = await db.execute(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    );
    const rows = (result as unknown as { rows?: { table_name?: string }[] }).rows ?? [];
    const existing = new Set(rows.map((row) => row.table_name));
    const missing = TABLES.filter((table) => !existing.has(table));
    checks.push({
      id: "tables",
      label: "Tabelas do Fluentia",
      status: missing.length === 0 ? "ok" : "fail",
      detail:
        missing.length === 0
          ? "profiles, conversations, messages, pronunciation_attempts presentes."
          : `Faltam: ${missing.join(", ")}. Corre drizzle/init-neon.sql no SQL Editor do Neon.`,
    });
  } catch (error) {
    checks.push({
      id: "tables",
      label: "Tabelas do Fluentia",
      status: "fail",
      detail: error instanceof Error ? error.message : "Não foi possível listar as tabelas.",
    });
  }

  try {
    const result = await db.execute(
      sql`select column_name from information_schema.columns
          where table_schema = 'public' and table_name = 'messages'`,
    );
    const rows = (result as unknown as { rows?: { column_name?: string }[] }).rows ?? [];
    const hasMeta = rows.some((row) => row.column_name === "meta");
    checks.push({
      id: "meta",
      label: "Coluna messages.meta (correções)",
      status: hasMeta ? "ok" : "fail",
      detail: hasMeta
        ? "Presente. O chat guarda correções, fluência e falsos amigos."
        : "Em falta. Corre drizzle/init-neon.sql (inclui ALTER TABLE ... ADD COLUMN meta).",
    });
  } catch (error) {
    checks.push({
      id: "meta",
      label: "Coluna messages.meta (correções)",
      status: "fail",
      detail: error instanceof Error ? error.message : "Não foi possível inspecionar a tabela.",
    });
  }

  checks.push({
    id: "ai",
    label: "Tutor com IA (opcional)",
    status: process.env.OPENAI_API_KEY ? "ok" : "warn",
    detail: process.env.OPENAI_API_KEY
      ? "OPENAI_API_KEY presente: respostas geradas por IA ativas."
      : "Sem OPENAI_API_KEY: o tutor local (regras em PT/ES) e a dicção funcionam na mesma.",
  });

  return checks;
}

export function summarize(checks: Check[]): { ok: boolean; failing: number } {
  const failing = checks.filter((check) => check.status === "fail").length;
  return { ok: failing === 0, failing };
}
