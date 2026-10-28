"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DIFFICULTIES,
  FOCUS_LABELS,
  MODES,
  MODE_META,
  type Difficulty,
  type Mode,
  type PronunciationChallenge,
  type UiLang,
} from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";
import { speak, speakSyllables } from "@/lib/speech";
import { formatDay } from "@/lib/format";
import { useDictation } from "@/hooks/useDictation";
import type { PronunciationScore } from "@/lib/scoring";
import type { AttemptDTO } from "@/lib/types";
import ScoreRing from "@/components/ScoreRing";

type Props = {
  dict: Dictionary;
  lang: UiLang;
  challenges: PronunciationChallenge[];
  initialAttempts: AttemptDTO[];
  profile: { level: string; voice: string };
};

type FilterMode = Mode | "all";
type FilterDifficulty = Difficulty | "all";

const languageKey = (lang: UiLang) => (lang === "pt-PT" ? "pt" : lang);

export default function PronunciationStudio({ dict, lang, challenges, initialAttempts, profile }: Props) {
  const router = useRouter();
  const [modeFilter, setModeFilter] = useState<FilterMode>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<FilterDifficulty>("easy");
  const [selectedId, setSelectedId] = useState(challenges[0]?.id ?? "");
  const dictation = useDictation({ lang: "en-US", maxSeconds: 30 });
  const transcript = dictation.transcript;
  const recording = dictation.recording;
  const setTranscript = dictation.setTranscript;
  const [result, setResult] = useState<PronunciationScore | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [recent, setRecent] = useState<AttemptDTO[]>(initialAttempts);
  const micAvailable = dictation.supported && dictation.error !== "denied";

  const filtered = useMemo(() => {
    const list = challenges.filter(
      (challenge) =>
        (modeFilter === "all" || challenge.mode === modeFilter) &&
        (difficultyFilter === "all" || challenge.difficulty === difficultyFilter),
    );
    return list.length ? list : challenges;
  }, [challenges, modeFilter, difficultyFilter]);

  useEffect(() => {
    if (!filtered.some((challenge) => challenge.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? "");
      setResult(null);
      setTranscript("");
    }
  }, [filtered, selectedId]);

  const challenge = challenges.find((item) => item.id === selectedId) ?? filtered[0];
  const index = filtered.findIndex((item) => item.id === challenge?.id);

  const reset = () => {
    setResult(null);
    setTranscript("");
    setXpEarned(0);
    setError(null);
    setShowTranslation(false);
  };

  const selectChallenge = (id: string) => {
    setSelectedId(id);
    reset();
  };

  const nextChallenge = () => {
    if (!filtered.length) return;
    const next = filtered[(index + 1) % filtered.length];
    setSelectedId(next.id);
    reset();
  };

  const startRecording = () => {
    if (!challenge) return;
    if (dictation.recording) {
      dictation.stop();
      return;
    }
    setResult(null);
    setTranscript("");
    dictation.start();
  };

  const evaluate = async () => {
    if (!challenge || !transcript.trim() || evaluating) return;
    setEvaluating(true);
    setError(null);
    try {
      const response = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, transcript }),
      });
      const data = (await response.json()) as {
        result?: PronunciationScore;
        xpEarned?: number;
        attempt?: AttemptDTO;
        error?: string;
      };
      if (!response.ok || !data.result) throw new Error(data.error ?? dict.common.error);
      setResult(data.result);
      setXpEarned(data.xpEarned ?? 0);
      if (data.attempt) setRecent((current) => [data.attempt as AttemptDTO, ...current].slice(0, 8));
      router.refresh();
    } catch {
      setError(dict.common.error);
    } finally {
      setEvaluating(false);
    }
  };

  const bandText = result
    ? result.band === "excellent"
      ? dict.pronunciation.bandExcellent
      : result.band === "good"
        ? dict.pronunciation.bandGood
        : result.band === "almost"
          ? dict.pronunciation.bandAlmost
          : dict.pronunciation.bandRetry
    : "";

  const difficultyLabel = (value: string) =>
    value === "easy" ? dict.common.easy : value === "medium" ? dict.common.medium : dict.common.hard;

  if (!challenge) {
    return <p className="text-sm text-ink-soft">{dict.pronunciation.filterEmpty}</p>;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">
            {dict.nav.pronunciation}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{dict.pronunciation.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{dict.pronunciation.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/treino" className="btn-primary">
            🎙 {dict.nav.coach}
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-sand bg-white/70 px-3 py-1.5 text-xs text-ink-soft">
            <span className="font-semibold text-forest">
              {index + 1}/{filtered.length}
            </span>
            {MODE_META[challenge.mode].name[languageKey(lang)]}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-sand bg-white/70 p-1">
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDifficultyFilter(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                difficultyFilter === option ? "bg-forest text-white" : "text-ink-soft hover:text-forest"
              }`}
            >
              {difficultyLabel(option)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-sand bg-white/70 p-1">
          <button
            type="button"
            onClick={() => setModeFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              modeFilter === "all" ? "bg-forest text-white" : "text-ink-soft hover:text-forest"
            }`}
          >
            {dict.common.all}
          </button>
          {MODES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setModeFilter(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                modeFilter === option ? "bg-forest text-white" : "text-ink-soft hover:text-forest"
              }`}
            >
              <span aria-hidden className="mr-1">
                {MODE_META[option].emoji}
              </span>
              {MODE_META[option].name[languageKey(lang)]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="card overflow-hidden">
          <div className={`flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r ${MODE_META[challenge.mode].gradient} px-5 py-3 text-white`}>
            <span className="flex items-center gap-2 text-sm font-medium">
              <span aria-hidden>{MODE_META[challenge.mode].emoji}</span>
              {MODE_META[challenge.mode].name[languageKey(lang)]}
            </span>
            <span className="chip border-white/30 text-white/90">{difficultyLabel(challenge.difficulty)}</span>
          </div>

          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.pronunciation.phrase}
            </p>
            <p className="mt-2 font-display text-2xl leading-snug text-ink sm:text-[28px]">
              “{challenge.text}”
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void speak(challenge.text, { lang: profile.voice, rate: 0.82 })
                }
                className="btn-ghost"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M4 9v6h3l5 4V5L7 9z" strokeLinejoin="round" />
                  <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
                </svg>
                {dict.pronunciation.listen}
              </button>
              <button
                type="button"
                onClick={() => void speak(challenge.text, { lang: profile.voice, rate: 0.55 })}
                className="btn-ghost"
              >
                🐢 {dict.practice.slow}
              </button>
              <button
                type="button"
                onClick={() => setShowTranslation((value) => !value)}
                className="btn-ghost"
              >
                {showTranslation ? dict.pronunciation.hideTranslation : dict.pronunciation.showTranslation}
              </button>
              <button type="button" onClick={nextChallenge} className="btn-ghost ml-auto">
                {dict.pronunciation.nextPhrase} →
              </button>
            </div>

            {showTranslation ? (
              <div className="mt-2 space-y-1 rounded-xl bg-paper-deep/60 p-3 text-xs text-ink-soft">
                <p>
                  <span className="mr-1 font-semibold text-forest">PT</span>
                  {challenge.translation.pt}
                </p>
                <p>
                  <span className="mr-1 font-semibold text-coral">ES</span>
                  {challenge.translation.es}
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={startRecording}
                className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
                  recording ? "animate-recording bg-coral" : "bg-forest hover:bg-forest-deep"
                }`}
                aria-label={recording ? dict.pronunciation.stopRecording : dict.pronunciation.speak}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-8 w-8">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" strokeLinecap="round" />
                </svg>
              </button>
              <p className="text-xs font-medium text-ink-soft">
                {recording ? dict.pronunciation.stopRecording : dict.pronunciation.speak}
              </p>
              {recording ? (
                <p className="text-[11px] font-semibold text-coral">
                  {dict.coach.secondsLeft.replace("{s}", String(dictation.secondsLeft))}
                </p>
              ) : null}
              {!micAvailable ? (
                <p className="max-w-md rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-800">
                  <strong className="block">{dict.pronunciation.unsupportedTitle}</strong>
                  {dict.pronunciation.unsupportedBody}
                </p>
              ) : null}
            </div>

            <label className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {dict.pronunciation.yourWords}
              <textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                rows={2}
                placeholder={dict.pronunciation.typeManually}
                className="field mt-1.5 resize-y text-sm"
              />
            </label>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void evaluate()}
                disabled={evaluating || !transcript.trim()}
                className="btn-primary"
              >
                {evaluating ? dict.pronunciation.scoring : dict.pronunciation.submit}
              </button>
              <button
                type="button"
                onClick={reset}
                className="btn-ghost"
              >
                {dict.common.retry}
              </button>
              {error ? <span className="text-xs text-coral">{error}</span> : null}
            </div>

            {result ? (
              <div className="mt-5 rounded-2xl border border-sand bg-paper/60 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <ScoreRing
                    score={result.score}
                    tone={result.band === "excellent" ? "forest" : result.band === "retry" ? "coral" : "lime"}
                    label={dict.common.score}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl text-ink">{bandText}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {result.words.filter((word) => word.match).length}/{result.words.length} ·{" "}
                      {dict.pronunciation.missing}: {result.missing.length}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-lime/40 px-2.5 py-1 text-[11px] font-semibold text-forest">
                      +{xpEarned} {dict.pronunciation.xpEarned}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {result.words.map((word, wordIndex) => (
                    <button
                      type="button"
                      onClick={() => void speakSyllables(word.target, { lang: profile.voice })}
                      key={`${word.target}-${wordIndex}`}
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        word.match
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                      title={word.spoken ? `${word.target} → ${word.spoken}` : word.target}
                    >
                      {word.target}
                      {!word.match && word.spoken ? (
                        <span className="ml-1 text-[10px] opacity-70">({word.spoken})</span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {result.extra.length > 0 ? (
                  <p className="mt-3 text-[11px] text-ink-soft">
                    <span className="font-semibold">{dict.pronunciation.extra}:</span>{" "}
                    {result.extra.join(", ")}
                  </p>
                ) : null}

                <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-[11px] text-ink-soft">
                  <span className="font-semibold text-forest">{dict.pronunciation.listen}: </span>
                  {challenge.focus
                    .map((focus) => FOCUS_LABELS[focus].tip[languageKey(lang)])
                    .join(" ")}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.pronunciation.focusTitle}
            </p>
            <ul className="mt-2 space-y-2">
              {challenge.focus.map((focus) => (
                <li key={focus} className="rounded-xl border border-sand/70 bg-paper/50 p-2.5">
                  <p className="text-xs font-semibold text-forest">{FOCUS_LABELS[focus].label[languageKey(lang)]}</p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-soft">
                    {FOCUS_LABELS[focus].tip[languageKey(lang)]}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.pronunciation.attemptsTitle}
            </p>
            {recent.length === 0 ? (
              <p className="mt-2 text-xs text-ink-soft">{dict.pronunciation.noAttempts}</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {recent.map((attempt) => (
                  <li key={attempt.id} className="flex items-center gap-2 rounded-lg bg-paper-deep/50 px-2 py-1.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
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
                      <button
                        type="button"
                        onClick={() => {
                          const target = challenges.find((item) => item.text === attempt.targetText);
                          if (target) {
                            setModeFilter(target.mode);
                            setDifficultyFilter(target.difficulty);
                            selectChallenge(target.id);
                          }
                        }}
                        className="block w-full truncate text-left text-[11px] font-medium text-ink hover:text-forest"
                      >
                        {attempt.targetText}
                      </button>
                      <span className="text-[10px] text-ink-soft">
                        {difficultyLabel(attempt.difficulty)} · {formatDay(attempt.createdAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-forest/20 bg-forest p-4 text-[#e7efe1]">
            <p className="font-display text-lg text-lime">{dict.pronunciation.tipsTitle}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#c8d8c4]">
              {FOCUS_LABELS.th.tip[languageKey(lang)]}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
