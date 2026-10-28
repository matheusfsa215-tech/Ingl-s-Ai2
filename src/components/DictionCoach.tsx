"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DIFFICULTIES,
  MODES,
  MODE_META,
  PRONUNCIATION_CHALLENGES,
  type Difficulty,
  type Mode,
  type UiLang,
} from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";
import { buildCoachPlan, SPEECH_HINT, type CoachPlan, type WordFocus } from "@/lib/coaching";
import { speak, speakSyllables, stopSpeaking } from "@/lib/speech";
import type { PronunciationScore } from "@/lib/scoring";
import { useDictation } from "@/hooks/useDictation";
import ScoreRing from "@/components/ScoreRing";
import type { AttemptDTO } from "@/lib/types";

type CoachResponse = {
  result?: PronunciationScore;
  xpEarned?: number;
  focusWords?: WordFocus[];
  attemptId?: number;
  targetText?: string;
  error?: string;
};

type Props = {
  dict: Dictionary;
  lang: UiLang;
  voice: string;
  initialAttempts: AttemptDTO[];
  initialMode: Mode;
};

const langKey = (lang: UiLang) => (lang === "pt-PT" ? "pt" : lang);

export default function DictionCoach({ dict, lang, voice, initialAttempts, initialMode }: Props) {
  const router = useRouter();
  const ui = langKey(lang);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [customText, setCustomText] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [focusWords, setFocusWords] = useState<WordFocus[]>([]);
  const [xp, setXp] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [recent, setRecent] = useState<AttemptDTO[]>(initialAttempts);
  const [approved, setApproved] = useState<string[]>([]);
  const dictation = useDictation({ lang: "en-US", maxSeconds: 60 });

  const pool = useMemo(
    () =>
      PRONUNCIATION_CHALLENGES.filter(
        (challenge) => challenge.mode === mode && challenge.difficulty === difficulty,
      ),
    [mode, difficulty],
  );

  const challenge = pool[index % Math.max(pool.length, 1)];
  const targetText = activeText ?? challenge?.text ?? "";
  const translation = activeText ? null : challenge?.translation;

  useEffect(() => {
    setResult(null);
    setPlan(null);
    setFocusWords([]);
    setAttemptNumber(0);
    setActiveText(null);
    dictation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty, index]);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  const play = async (text: string, rate: number) => {
    if (!text) return;
    setError(null);
    setSpeaking(true);
    const ok = await speak(text, {
      lang: voice,
      rate,
      onEnd: () => setSpeaking(false),
    });
    if (!ok) {
      setError(SPEECH_HINT[ui].blocked);
      setSpeaking(false);
    }
  };

  const playSyllables = async (word: string) => {
    setSpeaking(true);
    const ok = await speakSyllables(word, { lang: voice, onEnd: () => setSpeaking(false) });
    if (!ok) setError(SPEECH_HINT[ui].blocked);
    setSpeaking(false);
  };

  const evaluate = async () => {
    const transcript = dictation.transcript.trim();
    if (!transcript || !targetText || busy) return;
    setBusy(true);
    setError(null);
    try {
      const challengeMatch = PRONUNCIATION_CHALLENGES.find((item) => item.text === targetText);
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: challengeMatch ? undefined : targetText,
          challengeId: challengeMatch?.id,
          transcript,
          mode,
        }),
      });
      const data = (await response.json()) as CoachResponse;
      if (!response.ok || !data.result) throw new Error(data.error ?? dict.common.error);

      const nextAttempt = attemptNumber + 1;
      const nextPlan = buildCoachPlan(data.result, ui, nextAttempt);
      setResult(data.result);
      setPlan(nextPlan);
      setFocusWords(data.focusWords ?? nextPlan.focusWords);
      setXp(data.xpEarned ?? 0);
      setAttemptNumber(nextAttempt);
      if (nextPlan.mastered) {
        setApproved((current) => (current.includes(targetText) ? current : [...current, targetText]));
      }
      setRecent((current) =>
        [
          {
            id: data.attemptId ?? Date.now(),
            mode,
            difficulty: challengeMatch?.difficulty ?? "medium",
            targetText,
            transcript,
            score: data.result?.score ?? 0,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ].slice(0, 10),
      );
      router.refresh();
    } catch {
      setError(dict.common.error);
    } finally {
      setBusy(false);
    }
  };

  const nextPhrase = () => {
    stop();
    setIndex((value) => (pool.length ? (value + 1) % pool.length : 0));
  };

  const retry = () => {
    dictation.reset();
    setResult(null);
    setPlan(null);
    setFocusWords([]);
  };

  const startCustom = () => {
    if (!customText.trim()) return;
    setActiveText(customText.trim());
    setAttemptNumber(0);
    setResult(null);
    setPlan(null);
    setFocusWords([]);
    dictation.reset();
    setCustomOpen(false);
  };

  const bestScore = recent.length ? Math.max(...recent.map((item) => item.score)) : 0;
  const dictationMessage =
    dictation.error === "denied"
      ? dict.coach.micDenied
      : dictation.error === "unsupported"
        ? dict.coach.micUnsupported
        : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">{dict.nav.coach}</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{dict.coach.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{dict.coach.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip border-forest/20 bg-white text-forest">
            {dict.coach.masteredCount}: {approved.length}
          </span>
          <span className="chip border-forest/20 bg-white text-forest">
            {dict.coach.bestScore}: {bestScore}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-sand bg-white/70 p-1">
          {MODES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setIndex(0);
              }}
              className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition ${
                mode === option ? "bg-forest text-white" : "text-ink-soft hover:text-forest"
              }`}
            >
              <span aria-hidden className="mr-1">
                {MODE_META[option].emoji}
              </span>
              {MODE_META[option].name[ui]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-sand bg-white/70 p-1">
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setDifficulty(option);
                setIndex(0);
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                difficulty === option ? "bg-forest text-white" : "text-ink-soft hover:text-forest"
              }`}
            >
              {option === "easy" ? dict.common.easy : option === "medium" ? dict.common.medium : dict.common.hard}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCustomOpen((value) => !value)}
          className="btn-ghost border-forest/30 text-forest"
        >
          {dict.coach.freePhrase}
        </button>
      </div>

      {customOpen ? (
        <div className="card flex flex-wrap items-end gap-2 p-3">
          <input
            value={customText}
            onChange={(event) => setCustomText(event.target.value)}
            placeholder={dict.coach.freePhrasePlaceholder}
            className="field flex-1"
          />
          <button type="button" onClick={startCustom} className="btn-primary">
            {dict.coach.useMyPhrase}
          </button>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden">
          <div className={`flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r ${MODE_META[mode].gradient} px-5 py-3 text-white`}>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span aria-hidden>{MODE_META[mode].emoji}</span>
              {MODE_META[mode].name[ui]}
            </span>
            <div className="flex items-center gap-1.5">
              {[dict.coach.stepListen, dict.coach.stepRepeat, dict.coach.stepScore, dict.coach.stepImprove].map(
                (step, stepIndex) => {
                  const active =
                    (stepIndex === 0 && !dictation.recording && !result) ||
                    (stepIndex === 1 && dictation.recording) ||
                    (stepIndex === 2 && Boolean(result)) ||
                    (stepIndex === 3 && Boolean(plan) && !plan?.mastered);
                  return (
                    <span
                      key={step}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        active ? "bg-white text-forest" : "bg-white/15 text-white/80"
                      }`}
                    >
                      {stepIndex + 1}. {step}
                    </span>
                  );
                },
              )}
            </div>
          </div>

          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.coach.repeatAfter}
            </p>
            <p className="mt-2 font-display text-2xl leading-snug text-ink sm:text-[28px]">“{targetText}”</p>
            {translation ? (
              <p className="mt-1 text-[12px] text-ink-soft">
                <span className="font-semibold text-forest">PT</span> {translation.pt}{" "}
                <span className="ml-2 font-semibold text-coral">ES</span> {translation.es}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (speaking) {
                    stop();
                    return;
                  }
                  void play(targetText, 0.92);
                }}
                className="btn-ghost"
              >
                <span aria-hidden>{speaking ? "⏹" : "🔊"}</span>
                {speaking ? dict.common.stop : dict.coach.listenNormal}
              </button>
              <button type="button" onClick={() => void play(targetText, 0.6)} className="btn-ghost">
                🐢 {dict.coach.listenSlow}
              </button>
              <button
                type="button"
                onClick={() => void playSyllables(targetText.split(" ").slice(0, 4).join(" "))}
                className="btn-ghost"
              >
                🎧 {dict.coach.listenSyllables}
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stop();
                  if (dictation.recording) dictation.stop();
                  else dictation.start();
                }}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
                  dictation.recording ? "animate-recording bg-coral" : "bg-forest hover:bg-forest-deep"
                }`}
                aria-label={dictation.recording ? dict.coach.stop : dict.coach.record}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-8 w-8">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" strokeLinecap="round" />
                </svg>
              </button>
              <p className="text-xs font-medium text-ink-soft">
                {dictation.recording ? dict.coach.recording : dict.coach.record}
              </p>
              {dictation.recording ? (
                <p className="text-[11px] font-semibold text-coral">
                  {dict.coach.secondsLeft.replace("{s}", String(dictation.secondsLeft))}
                </p>
              ) : (
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft/70">{dict.practice.recordLong}</p>
              )}
            </div>

            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {dict.coach.transcriptLabel}
              <textarea
                value={dictation.transcript}
                onChange={(event) => dictation.setTranscript(event.target.value)}
                rows={2}
                placeholder={dict.coach.writeTranscript}
                className="field mt-1.5 resize-y text-sm"
              />
            </label>
            {dictation.interim ? (
              <p className="mt-1 text-[11px] italic text-ink-soft">
                {dict.coach.interimLabel} {dictation.interim}
              </p>
            ) : null}

            {dictationMessage ? (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                {dictationMessage}
              </p>
            ) : null}
            {error ? (
              <p className="mt-2 rounded-xl border border-coral/30 bg-[#fdf2ee] px-3 py-2 text-[11px] text-coral">{error}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void evaluate()}
                disabled={busy || !dictation.transcript.trim()}
                className="btn-primary"
              >
                {busy ? dict.coach.evaluating : dict.coach.evaluate}
              </button>
              <button type="button" onClick={retry} className="btn-ghost">
                {dict.coach.retryPhrase}
              </button>
              <button type="button" onClick={nextPhrase} className="btn-ghost ml-auto">
                {dict.coach.nextPhrase} →
              </button>
            </div>

            {result && plan ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-sand bg-paper/60 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <ScoreRing
                      score={result.score}
                      tone={plan.tier === "great" ? "forest" : plan.tier === "work" ? "coral" : "lime"}
                      label={dict.coach.yourScore}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-snug text-ink">{plan.headline[ui]}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
                        <span className="rounded-full bg-white px-2 py-0.5">
                          {attemptNumber} {dict.coach.attempts}
                        </span>
                        <span className="rounded-full bg-lime/40 px-2 py-0.5 font-semibold text-forest">
                          +{xp} XP
                        </span>
                        {plan.mastered ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                            ✓ {dict.coach.mastered}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {result.words.map((word, wordIndex) => (
                      <button
                        key={`${word.target}-${wordIndex}`}
                        type="button"
                        onClick={() => void playSyllables(word.target)}
                        title={word.spoken ?? word.target}
                        className={`rounded-lg border px-2 py-1 text-xs transition hover:brightness-95 ${
                          word.match
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {word.target}
                        {!word.match ? <span className="ml-1 text-[10px] opacity-70">🔊</span> : null}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-forest/20 bg-forest p-4 text-[#e9f0e4]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime/80">
                    {dict.coach.planTitle}
                  </p>
                  <ol className="mt-2 space-y-1.5">
                    {plan.steps.map((step, stepIndex) => (
                      <li key={step.en} className="flex gap-2 text-[12px] leading-snug text-[#d3e0cd]">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime text-[9px] font-bold text-forest-deep">
                          {stepIndex + 1}
                        </span>
                        {step[ui]}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void play(targetText, 0.6)}
                      className="rounded-full bg-lime px-3 py-1.5 text-[11px] font-bold text-forest-deep"
                    >
                      🐢 {dict.coach.listenSlow}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        retry();
                        dictation.start();
                      }}
                      className="rounded-full border border-white/30 px-3 py-1.5 text-[11px] font-semibold"
                    >
                      🎙 {dict.coach.retryPhrase}
                    </button>
                    <button
                      type="button"
                      onClick={nextPhrase}
                      className="rounded-full border border-white/30 px-3 py-1.5 text-[11px] font-semibold"
                    >
                      {dict.coach.nextPhrase} →
                    </button>
                  </div>
                </div>

                {focusWords.length > 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                      {dict.coach.focusWords}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {focusWords.map((word) => (
                        <li key={word.word} className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-ink">
                            {word.word}
                          </span>
                          <span className="text-[11px] text-ink-soft">{word.syllables}</span>
                          <button
                            type="button"
                            onClick={() => void playSyllables(word.word)}
                            className="rounded-full border border-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-900"
                          >
                            🎧
                          </button>
                          <span className="w-full text-[11px] leading-snug text-amber-900">{word.hardSound}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.coach.sessionTitle}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-paper-deep/60 p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">{dict.coach.masteredCount}</p>
                <p className="font-display text-2xl text-forest">{approved.length}</p>
              </div>
              <div className="rounded-xl bg-paper-deep/60 p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">{dict.coach.bestScore}</p>
                <p className="font-display text-2xl text-coral">{bestScore}</p>
              </div>
            </div>
            {recent.length === 0 ? (
              <p className="mt-2 text-xs text-ink-soft">{dict.coach.sessionEmpty}</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {recent.slice(0, 6).map((attempt) => (
                  <li key={`${attempt.id}-${attempt.createdAt}`} className="flex items-center gap-2 rounded-lg bg-paper-deep/50 px-2 py-1.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        attempt.score >= 85
                          ? "bg-lime/60 text-forest"
                          : attempt.score >= 60
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {attempt.score}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-ink">{attempt.targetText}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.coach.tutorTips}
            </p>
            <ul className="mt-2 space-y-2 text-[11px] leading-snug text-ink-soft">
              <li>😮‍💨 {SPEECH_HINT[ui].blocked}</li>
              <li>🎙 {SPEECH_HINT[ui].unsupported}</li>
              <li>🐢 {dict.coach.slowMode}: 0,6× mostra o ritmo correto antes de tentares.</li>
              <li>📈 {dict.coach.mastered}: 85 pontos ou mais.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => void play(targetText, 0.92)}
            className="btn-ghost w-full justify-center"
          >
            🔁 {dict.coach.listenNormal}
          </button>
        </aside>
      </div>
    </div>
  );
}
