import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Configuração para aplicar o schema numa base Neon/remota.
 * Uso:
 *   DATABASE_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require" \
 *     npx drizzle-kit push --config drizzle.config.prod.ts
 */
const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL em falta: exporta a connection string direta (sem -pooler) do Neon.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: false,
});
