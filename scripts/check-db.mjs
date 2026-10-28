#!/usr/bin/env node
/**
 * Verifica a base Neon/PostgreSQL antes e depois de aplicar o schema.
 * Uso: DATABASE_URL="postgresql://..." node scripts/check-db.mjs
 */
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✕ DATABASE_URL não está definida.\n  export DATABASE_URL=\"postgresql://...\"  (string direta do Neon)");
  process.exit(1);
}

const host = (() => {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
})();
const pooled = host.includes("-pooler");
const local = /localhost|127\.0\.0\.1/.test(host);
const tables = ["profiles", "conversations", "messages", "pronunciation_attempts"];

console.log(`→ Host: ${host}`);
if (pooled) console.log("  ⚠ string pooled: serve para a Vercel. Para criar tabelas usa a direta (sem -pooler).");
if (!local && !/sslmode=require/.test(url)) console.log("  ⚠ falta ?sslmode=require na string.");

const client = new Client({
  connectionString: url,
  ssl: local ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 12_000,
});

try {
  await client.connect();
  console.log("✓ Ligação OK");

  const result = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public'",
  );
  const existing = new Set(result.rows.map((row) => row.table_name));
  const missing = tables.filter((table) => !existing.has(table));

  if (missing.length === 0) {
    console.log("✓ Tabelas presentes:", tables.join(", "));
  } else {
    console.log("✕ Faltam tabelas:", missing.join(", "));
    console.log("  Corre: npx drizzle-kit push --config drizzle.config.prod.ts");
    console.log("  (ou cola drizzle/init-neon.sql no SQL Editor do Neon)");
  }

  const meta = await client
    .query(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'messages'",
    )
    .catch(() => ({ rows: [] }));
  const hasMeta = meta.rows.some((row) => row.column_name === "meta");
  console.log(hasMeta ? "✓ Coluna messages.meta presente" : "✕ messages.meta em falta (necessária às correções)");

  const counts = existing.has("profiles")
    ? await client.query("select count(*)::int as total from profiles").catch(() => ({ rows: [{ total: 0 }] }))
    : { rows: [{ total: 0 }] };
  console.log(`ℹ Perfis na base: ${counts.rows[0]?.total ?? 0}`);

  await client.end();
  process.exit(missing.length === 0 && hasMeta ? 0 : 1);
} catch (error) {
  console.error("✕ Falha de ligação:", error instanceof Error ? error.message : error);
  try {
    await client.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
}
