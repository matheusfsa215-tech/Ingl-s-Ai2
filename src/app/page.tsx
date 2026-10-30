import Link from "next/link";
import { ProfileSetup } from "@/components/ProfileForms";
import { MODES, MODE_META, type Mode, type UiLang } from "@/lib/content";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import { formatDay } from "@/lib/format";
import { getStats } from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

const languageKey = (lang: UiLang) => (lang === "pt-PT" ? "pt" : lang);

const SAMPLE = {
  pt: {
    student: "Tenho 30 anos e estou de acordo.",
    before: "I have 30 years and I am agree.",
    after: "I'm 30 years old and I agree.",
    note: "Idade com «to be» e «agree» é verbo — dois erros típicos de quem fala português.",
  },
  es: {
    student: "Tengo 30 años y estoy de acuerdo.",
    before: "I have 30 years and I am agree.",
    after: "I'm 30 years old and I agree.",
    note: "La edad con «to be» y «agree» es verbo: dos errores típicos de hispanohablantes.",
  },
  en: {
    student: "I am 30 years old and I agree.",
    before: "I have 30 years and I am agree.",
    after: "I'm 30 years old and I agree.",
    note: "Age uses «to be» and «agree» is a verb — two classic Romance-language mistakes.",
  },
};

export default async function DashboardPage() {
  const learnerId = await getLearnerId();
  const lang = normalizeLang(await getUiLangCookie());
  const dict = getDictionary(lang);
  const stats = await getStats(learnerId);
  const sample = SAMPLE[lang === "pt-PT" ? "pt" : lang === "es" ? "es" : "en"];
  const isNew = stats.profile.name === "Aprendiz" && stats.conversations === 0;
  const goal = (MODES as readonly string[]).includes(stats.profile.goal)
    ? (stats.profile.goal as Mode)
    : "daily";

  const tiles = [
    { label: dict.common.xp, value: stats.xp, hint: dict.progress.xpTotal },
    { label: dict.common.streak, value: `${stats.streak}`, hint: dict.common.days },
    { label: dict.home.statLevel, value: stats.level.level, hint: dict.progress.estimatedLevel },
    {
      label: dict.progress.pronunciation,
      value: stats.avgScore ? `${stats.avgScore}%` : "—",
      hint: dict.progress.averageScore,
    },
  ];

  return (
    <div className="space-y-5">
      {isNew ? (
        <ProfileSetup
          dict={dict}
          lang={lang}
          profile={{
            name: "",
            level: stats.profile.level,
            goal,
            voice: stats.profile.voice,
          }}
        />
      ) : null}

      <section className="card overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">
              {dict.home.greeting.replace("{name}", stats.profile.name)}
            </p>
            <h1 className="mt-2 font-display text-[30px] leading-[1.1] text-ink sm:text-[38px]">
              {dict.home.headline}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{dict.home.subline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link href={`/praticar?mode=${goal}`} className="btn-primary">
                {dict.home.startChat}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/treino" className="btn-ghost">
                {dict.nav.coach}
                <span aria-hidden>🎙</span>
              </Link>
              <Link href="/pronuncia" className="btn-ghost">
                {dict.home.startPronunciation}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-moss" />
                {dict.home.dailyGoal}: {dict.home.dailyGoalValue}
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden>🎙</span>
                {dict.coach.mastered.replace(/[¡!]/g, "")} ≥ 85
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden>🔥</span>
                {stats.streak} {dict.common.days}
              </span>
            </div>
          </div>

          <div className="relative bg-forest p-6 text-[#e9f0e4] sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(260px_160px_at_70%_0%,rgba(216,240,126,0.25),transparent)]" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-lime/80">
              {dict.home.coachTitle}
            </p>
            <div className="relative mt-4 space-y-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white/10 px-3 py-2 text-sm">
                {sample.before}
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-[#fffdf8] px-3 py-2.5 text-ink shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coral">
                  {dict.practice.corrected}
                </p>
                <p className="mt-1 text-sm font-medium">{sample.after}</p>
                <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">{sample.note}</p>
              </div>
              <p className="text-[11px] leading-relaxed text-[#b9cdb9]">{sample.student}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {tile.label}
            </p>
            <p className="mt-1 font-display text-3xl text-ink">{tile.value}</p>
            <p className="mt-1 text-[11px] text-ink-soft">{tile.hint}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl text-ink">{dict.home.modesTitle}</h2>
            <p className="mt-1 text-sm text-ink-soft">{dict.home.modesSubtitle}</p>
          </div>
          <Link href="/praticar" className="text-xs font-semibold text-forest hover:underline">
            {dict.practice.newChat} →
          </Link>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MODES.map((mode) => {
            const info = MODE_META[mode];
            return (
              <Link
                key={mode}
                href={`/praticar?mode=${mode}`}
                className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-moss/40"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${info.gradient}`} />
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-2xl" aria-hidden>
                    {info.emoji}
                  </span>
                  <h3 className="mt-2 font-display text-xl text-ink">{info.name[languageKey(lang)]}</h3>
                  <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-soft">
                    {info.description[languageKey(lang)]}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-forest">
                    {dict.home.startChat}
                    <span className="transition group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">{dict.home.continueTitle}</h2>
            <Link href="/progresso" className="text-[11px] font-semibold text-forest hover:underline">
              {dict.nav.progress} →
            </Link>
          </div>
          {stats.recentConversations.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{dict.home.continueEmpty}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.recentConversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/praticar?c=${conversation.id}`}
                    className="flex items-center gap-3 rounded-xl border border-sand/70 bg-white px-3 py-2.5 transition hover:border-moss/50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper-deep text-lg" aria-hidden>
                      {MODE_META[conversation.mode].emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{conversation.title}</span>
                      <span className="block text-[11px] text-ink-soft">
                        {MODE_META[conversation.mode].name[languageKey(lang)]} · {conversation.level} ·{" "}
                        {formatDay(conversation.updatedAt)}
                      </span>
                    </span>
                    <span className="text-forest">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-xl text-ink">{dict.home.planTitle}</h2>
            <ul className="mt-3 space-y-2">
              {[dict.home.plan1, dict.home.plan2, dict.home.plan3].map((item, index) => (
                <li key={item} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/60 text-[10px] font-bold text-forest">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-forest/25 bg-forest p-5 text-[#e7efe1]">
            <p className="font-display text-xl text-lime">{dict.home.coachTitle}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#c8d8c4]">{dict.home.coachBody}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
