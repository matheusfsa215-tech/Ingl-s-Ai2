import Link from "next/link";
import AccessHelp from "@/components/AccessHelp";
import BrowserDiagnostics from "@/components/BrowserDiagnostics";
import { runServerChecks, summarize, type Check } from "@/lib/diagnostics";
import { getOrCreateProfile } from "@/lib/repo";
import { getLearnerId } from "@/lib/session";

export const dynamic = "force-dynamic";

const tone: Record<Check["status"], string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  fail: "border-rose-200 bg-rose-50 text-rose-700",
};

export default async function DiagnosticsPage() {
  let checks: Check[] = [];
  let failedToRun = false;
  try {
    checks = await runServerChecks();
  } catch {
    failedToRun = true;
  }
  const summary = summarize(checks);

  let profile: { name: string; voice: string; xp: number } | null = null;
  try {
    const learnerId = await getLearnerId();
    const row = await getOrCreateProfile(learnerId);
    profile = { name: row.name, voice: row.voice, xp: row.xp };
  } catch {
    profile = null;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">Diagnóstico</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">O que está a funcionar?</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Esta página verifica servidor (Neon), variáveis da Vercel e o teu dispositivo. Guarda o link e
            usa o botão “Copiar relatório” se precisares de ajuda.
          </p>
        </div>
        <Link href="/" className="btn-ghost">
          ← Painel
        </Link>
      </header>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Servidor e base de dados</h2>
          <span
            className={`chip ${
              failedToRun
                ? tone.fail
                : summary.ok
                  ? tone.ok
                  : tone.fail
            }`}
          >
            {failedToRun ? "Erro ao verificar" : summary.ok ? "Tudo certo" : `${summary.failing} problema(s)`}
          </span>
        </div>

        {failedToRun ? (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            Não foi possível correr as verificações. Confirma `DATABASE_URL` na Vercel e faz Redeploy.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {checks.map((check) => (
              <li key={check.id} className={`rounded-xl border px-3 py-2 ${tone[check.status]}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {check.status === "ok" ? "✓" : check.status === "warn" ? "!" : "✕"} {check.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug opacity-90">{check.detail}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-paper-deep/60 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">Perfil (cookie)</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{profile?.name ?? "—"}</p>
            <p className="text-[10px] text-ink-soft">{profile ? `${profile.xp} XP` : "sem ligação à base"}</p>
          </div>
          <div className="rounded-xl bg-paper-deep/60 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">Endpoint de saúde</p>
            <Link href="/api/health" className="text-xs font-semibold text-forest underline">
              /api/health
            </Link>
          </div>
          <div className="rounded-xl bg-paper-deep/60 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">Schema SQL</p>
            <p className="text-xs font-medium text-ink">drizzle/init-neon.sql</p>
          </div>
        </div>
      </section>

      <AccessHelp productionUrl={process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null} />

      <BrowserDiagnostics voice={profile?.voice ?? "en-GB"} />

      <section className="rounded-2xl border border-forest/25 bg-forest p-5 text-[#e7efe1]">
        <h2 className="font-display text-xl text-lime">Se algo falhar, a ordem é esta</h2>
        <ol className="mt-2 space-y-1.5 text-[12px] leading-snug text-[#c8d8c4]">
          <li>1. `DATABASE_URL` na Vercel (string <strong>pooled</strong>, com `?sslmode=require`) → Redeploy.</li>
          <li>2. Tabelas no Neon: colar `drizzle/init-neon.sql` no SQL Editor → Run.</li>
          <li>3. Telefone: atualizar/reinstalar a app para limpar o cache antigo.</li>
          <li>4. Áudio: página App → “Testar áudio” e confirmar voz inglesa instalada.</li>
          <li>5. Microfone: permitir no cadeado do Chrome e recarregar.</li>
        </ol>
      </section>
    </div>
  );
}
