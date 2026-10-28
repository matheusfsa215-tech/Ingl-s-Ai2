"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { loadVoices, speak, stopSpeaking } from "@/lib/speech";

export default function AudioCheck({ dict, voice }: { dict: Dictionary; voice: string }) {
  const [voices, setVoices] = useState<number | null>(null);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadVoices().then((list) => {
      setVoices(list.length);
      const match =
        list.find((item) => item.lang.replace("_", "-") === voice) ??
        list.find((item) => item.lang.toLowerCase().startsWith("en"));
      setVoiceName(match ? `${match.name} (${match.lang})` : null);
    });
  }, [voice]);

  const play = async (rate: number) => {
    setError(null);
    setSpeaking(true);
    const ok = await speak(dict.pwa.audioTestPhrase, {
      lang: voice,
      rate,
      onEnd: () => setSpeaking(false),
    });
    if (!ok) setError(dict.coach.speechBlocked);
    setSpeaking(false);
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">{dict.pwa.audioTitle}</h2>
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-ink-soft">{dict.pwa.audioBody}</p>
        </div>
        <span
          className={`chip ${
            voices && voices > 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : voices === 0
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-sand bg-paper text-ink-soft"
          }`}
        >
          {voices === null ? dict.common.loading : voices > 0 ? dict.pwa.audioOk : dict.pwa.audioNoVoices}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-ink-soft">
        <span className="font-semibold text-forest">Voice:</span> {voiceName ?? "—"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void play(0.94)} className="btn-primary">
          🔊 {dict.coach.listenNormal}
        </button>
        <button type="button" onClick={() => void play(0.58)} className="btn-ghost">
          🐢 {dict.coach.listenSlow}
        </button>
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setSpeaking(false);
          }}
          className="btn-ghost"
        >
          ⏹ {dict.common.stop}
        </button>
        {speaking ? <span className="text-[11px] font-semibold text-moss">▶ …</span> : null}
      </div>

      <p className="mt-2 rounded-xl bg-paper-deep/60 px-3 py-2 text-[11px] leading-snug text-ink-soft">
        {dict.pwa.audioTestPhrase}
      </p>
      {error ? <p className="mt-2 text-[11px] font-medium text-coral">{error}</p> : null}
    </div>
  );
}
