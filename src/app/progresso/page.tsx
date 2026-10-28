import Link from "next/link";
import { ProfileSettings } from "@/components/ProfileForms";
import { MODES, MODE_META, type Mode, type UiLang } from "@/lib/content";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import { formatDay } from "@/lib/format";
import { getStats } from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

const languageKey = (lang: UiLang) => (lang === "pt-PT" ? "pt" : lang);

function SkillBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-ink-soft">
        <span>{label}</span>
        <span className="font-semibold text-ink">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(3, value)}%`, backgroundColor: tone }} />
      </div>
    </div>
  );
}

export default async function ProgressPage() {
  const learnerId = await getLearnerId();
  const lang = normalizeLang(await getUiLangCookie());
  const dict = getDictionary(lang);
  const stats = await getStats(learnerId);

  const goal = (MODES as readonly string[]).includes(stats.profile.goal)
    ? (stats.profile.goal as Mode)
    : "daily";
  const remaining = stats.level.nextAt ? Math.max(0, stats.level.nextAt - stats.xp) : 0;
  const vocabularyScore = Math.max(0, Math.min(100, Math.round((stats.vocabulary / 80) * 100)));

  const tiles = [
    { label: dict.progress.xpTotal, value: stats.xp },
    { label: dict.progress.conversations, value: stats.conversations },
    { label: dict.progress.messages, value: stats.messages },
    { label: dict.progress.corrections, value: stats.corrections },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">{dict.nav.progress}</p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{dict.progress.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">{dict.progress.subtitle}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{tile.label}</p>
            <p className="mt-1 font-display text-3xl text-ink">{tile.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-3xl border border-forest/25 bg-forest p-6 text-[#e9f0e4]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(240px_150px_at_80%_0%,rgba(216,240,126,0.25),transparent)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lime/80">
                {dict.progress.estimatedLevel}
              </p>
              <p className="mt-1 font-display text-6xl leading-none text-lime">{stats.level.level}</p>
              <p className="mt-2 text-xs text-[#c8d8c4]">
                {stats.level.nextLevel
                  ? dict.progress.nextLevel
                      .replace("{xp}", String(remaining))
                      .replace("{level}", stats.level.nextLevel)
                  : dict.progress.maxLevel}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#b9cdb9]">{dict.common.xp}</p>
              <p className="font-display text-2xl">{stats.xp}</p>
            </div>
          </div>
          <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-lime" style={{ width: `${Math.max(4, stats.level.progress)}%` }} />
          </div>
          <div className="relative mt-3 flex items-center justify-between text-[11px] text-[#b9cdb9]">
            <span>
              🔥 {stats.streak} {dict.common.days}
            </span>
            <span>
              {dict.progress.attempts}: {stats.attempts}
            </span>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-xl text-ink">{dict.progress.skillsTitle}</h2>
          <div className="mt-4 space-y-3.5">
            <SkillBar label={dict.progress.grammar} value={stats.grammar} tone="#1C6B54" />
            <SkillBar label={dict.progress.pronunciation} value={stats.avgScore} tone="#D9553A" />
            <SkillBar label={dict.progress.fluency} value={stats.fluency} tone="#7BA13F" />
            <SkillBar label={dict.progress.vocabulary} value={vocabularyScore} tone="#3A6E9E" />
            <SkillBar label={dict.progress.consistency} value={stats.consistency} tone="#8B5E34" />
          </div>
          <p className="mt-4 rounded-xl bg-paper-deep/60 px-3 py-2 text-[11px] leading-snug text-ink-soft">
            {dict.home.coachBody}
          </p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl text-ink">{dict.progress.modeTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((mode) => {
            const entry = stats.perMode.find((item) => item.mode === mode);
            return (
              <div key={mode} className="rounded-xl border border-sand/70 bg-white p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span aria-hidden>{MODE_META[mode].emoji}</span>
                  {MODE_META[mode].name[languageKey(lang)]}
                </p>
                <p className="mt-2 font-display text-2xl text-forest">
                  {entry?.avgScore ? `${entry.avgScore}%` : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                  {entry?.attempts ?? 0} {dict.progress.attempts}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-xl text-ink">{dict.progress.recentCorrections}</h2>
          {stats.recentCorrections.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{dict.progress.emptyCorrections}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.recentCorrections.map((correction, index) => (
                <li key={`${correction.id}-${index}`} className="rounded-xl border border-sand/70 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700 line-through decoration-rose-400">
                      {correction.original.trim()}
                    </span>
                    <span className="text-ink-soft">→</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-800">
                      {correction.correction.trim()}
                    </span>
                    <span className="ml-auto rounded-full border border-sand px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                      {MODE_META[correction.mode].emoji} {MODE_META[correction.mode].name[languageKey(lang)]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">
                    {lang === "es" ? correction.es : correction.pt}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-xl text-ink">{dict.progress.recentAttempts}</h2>
            {stats.recentAttempts.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">{dict.progress.emptyAttempts}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {stats.recentAttempts.map((attempt) => (
                  <li key={attempt.id} className="flex items-center gap-2 rounded-xl bg-paper-deep/50 px-3 py-2">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        attempt.score >= 75
                          ? "bg-lime/60 text-forest"
                          : attempt.score >= 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {attempt.score}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-ink">{attempt.targetText}</span>
                      <span className="text-[10px] text-ink-soft">
                        {MODE_META[attempt.mode].name[languageKey(lang)]} ·{" "}
                        {attempt.difficulty === "easy"
                          ? dict.common.easy
                          : attempt.difficulty === "medium"
                            ? dict.common.medium
                            : dict.common.hard}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/treino" className="text-[11px] font-semibold text-forest hover:underline">
                🎙 {dict.nav.coach} →
              </Link>
              <Link href="/pronuncia" className="text-[11px] font-semibold text-forest hover:underline">
                {dict.home.startPronunciation} →
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-xl text-ink">{dict.progress.historyTitle}</h2>
            {stats.recentConversations.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">{dict.progress.emptyHistory}</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {stats.recentConversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/praticar?c=${conversation.id}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-paper-deep/60"
                    >
                      <span aria-hidden>{MODE_META[conversation.mode].emoji}</span>
                      <span className="min-w-0 flex-1 truncate text-ink">{conversation.title}</span>
                      <span className="text-[10px] text-ink-soft">
                        {formatDay(conversation.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ProfileSettings
        dict={dict}
        lang={lang}
        profile={{ name: stats.profile.name, level: stats.profile.level, goal, voice: stats.profile.voice }}
      />
    </div>
  );
}
