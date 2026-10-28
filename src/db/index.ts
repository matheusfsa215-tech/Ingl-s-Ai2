import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __fluentiaPool?: Pool;
};

const isLocal = /(?:localhost|127\.0\.0\.1|::1)/.test(databaseUrl ?? "");
const requiresSsl =
  /sslmode=(?:require|verify-ca|verify-full)/i.test(databaseUrl ?? "") ||
  process.env.PGSSLMODE === "require" ||
  (Boolean(databaseUrl) && !isLocal);

function createPool(): Pool {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing. Add the Neon pooled connection string in Vercel → Settings → Environment Variables (Production, Preview and Development) and redeploy.",
    );
  }
  const pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
    ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  });
  pool.on("error", (error) => {
    console.error("[db] unexpected idle client error", error.message);
  });
  return pool;
}

function getPool(): Pool {
  if (!globalForDb.__fluentiaPool) {
    globalForDb.__fluentiaPool = createPool();
  }
  return globalForDb.__fluentiaPool;
}

/**
 * Lazy pool: the connection is only created on the first query, so `next build`
 * never fails when DATABASE_URL is absent (it fails at runtime with a clear
 * message instead). The pool is cached on globalThis so warm serverless
 * invocations reuse connections instead of opening new ones.
 */
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, property) {
    const instance = getPool();
    const value = Reflect.get(instance as object, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const db = drizzle(pool);

export function databaseConfigured(): boolean {
  return Boolean(databaseUrl);
}
