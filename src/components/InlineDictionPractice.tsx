"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UiLang, Mode } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";
import { wordFocus, type WordFocus } from "@/lib/coaching";
import { speak, speakSyllables } from "@/lib/speech";
import type { PronunciationScore } from "@/lib/scoring";
import { useDictation } from "@/hooks/useDictation";
import ScoreRing from "@/components/ScoreRing";

const langKey = (lang: UiLang) => (lang === "pt-PT" ? "pt" : lang);

export default function InlineDictionPractice({
  dict,
  lang,
  voice,
  text,
  mode,
  defaultOpen = false,
}: {
  dict: Dictionary;
  lang: UiLang;
  voice: string;
  text: string;
  mode: Mode;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const ui = langKey(lang);
  const [open, setOpen] = useState(defaultOpen);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [focusWords, setFocusWords] = useState<WordFocus[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const dictation = useDictation({ lang: "en-US", maxSeconds: 45 });

  useEffect(() => {
    if (!open) dictation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const evaluate = async () => {
    if (!dictation.transcript.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, transcript: dictation.transcript, mode }),
      });
      const data = (await response.json()) as {
        result?: PronunciationScore;
        focusWords?: WordFocus[];
        xpEarned?: number;
        error?: string;
      };
      if (!response.ok || !data.result) throw new Error(data.error ?? dict.common.error);
      setScore(data.result);
      setXp(data.xpEarned ?? 0);
      setFocusWords(
        data.focusWords?.length
          ? data.focusWords
          : data.result.words.filter((word) => !word.match).map((word) => wordFocus(word.target, ui)),
      );
      router.refresh();
    } catch {
      setError(dict.common.error);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-forest/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-forest hover:border-forest"
      >
        🎙 {dict.practice.practisePhrase}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-forest/25 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
          {dict.practice.phraseScore}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft hover:text-forest"
        >
          {dict.practice.practiseClose} ✕
        </button>
      </div>

      <p className="mt-1.5 rounded-lg bg-paper-deep/60 px-2.5 py-2 text-sm text-ink">“{text}”</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => void speak(text, { lang: voice, rate: 0.92 })}
          className="rounded-full border border-sand px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-moss hover:text-forest"
        >
          🔊 {dict.coach.listenNormal}
        </button>
        <button
          type="button"
          onClick={() => void speak(text, { lang: voice, rate: 0.58 })}
          className="rounded-full border border-sand px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-moss hover:text-forest"
        >
          🐢 {dict.practice.slow}
        </button>
        <button
          type="button"
          onClick={() => {
            if (dictation.recording) dictation.stop();
            else dictation.start();
          }}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            dictation.recording ? "animate-recording bg-coral text-white" : "bg-forest text-white"
          }`}
        >
          {dictation.recording
            ? `${dict.coach.stop} · ${dictation.secondsLeft}s`
            : `🎙 ${dict.coach.record}`}
        </button>
        <span className="text-[10px] uppercase tracking-[0.1em] text-ink-soft/70">{dict.practice.recordLong}</span>
      </div>

      <textarea
        value={dictation.transcript}
        onChange={(event) => dictation.setTranscript(event.target.value)}
        rows={2}
        placeholder={dict.coach.writeTranscript}
        className="field mt-2 resize-y text-xs"
      />
      {dictation.interim ? (
        <p className="mt-1 text-[10px] italic text-ink-soft">
          {dict.coach.interimLabel} {dictation.interim}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void evaluate()}
          disabled={busy || !dictation.transcript.trim()}
          className="btn-primary px-3 py-1.5 text-xs"
        >
          {busy ? dict.coach.evaluating : dict.coach.evaluate}
        </button>
        {score ? (
          <span className="text-[11px] font-semibold text-forest">
            +{xp} XP · {score.score}/100
          </span>
        ) : null}
        {error ? <span className="text-[11px] text-coral">{error}</span> : null}
      </div>

      {score ? (
        <div className="mt-2 rounded-xl border border-sand bg-paper/60 p-2.5">
          <div className="flex items-center gap-3">
            <ScoreRing
              score={score.score}
              size={72}
              tone={score.score >= 85 ? "forest" : score.score >= 60 ? "lime" : "coral"}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-ink">
                {score.score >= 85 ? dict.practice.goodDiction : dict.practice.keepPractising}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {score.words.map((word, index) => (
                  <button
                    key={`${word.target}-${index}`}
                    type="button"
                    onClick={() => void speakSyllables(word.target, { lang: voice })}
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${
                      word.match
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {word.target}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {focusWords.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {focusWords.slice(0, 3).map((word) => (
                <li key={word.word} className="text-[10px] leading-snug text-ink-soft">
                  <span className="font-semibold text-ink">{word.word}</span> · {word.syllables} — {word.hardSound}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
