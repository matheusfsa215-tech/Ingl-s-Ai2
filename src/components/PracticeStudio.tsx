"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, MODES, MODE_META, type Level, type Mode, type UiLang } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";
import { speak } from "@/lib/speech";
import { formatDay } from "@/lib/format";
import { useDictation } from "@/hooks/useDictation";
import InlineDictionPractice from "@/components/InlineDictionPractice";
import type { ConversationDTO, MessageDTO } from "@/lib/types";

type Props = {
  dict: Dictionary;
  lang: UiLang;
  profile: { name: string; level: string; voice: string };
  initialConversations: ConversationDTO[];
  initialConversation: ConversationDTO | null;
  initialMessages: MessageDTO[];
  initialMode: Mode;
};

const isLevel = (value: string): value is Level => (LEVELS as readonly string[]).includes(value);

const categoryTone: Record<string, string> = {
  grammar: "bg-sky-50 text-sky-800 border-sky-200",
  vocabulary: "bg-emerald-50 text-emerald-800 border-emerald-200",
  spelling: "bg-amber-50 text-amber-800 border-amber-200",
  "word-order": "bg-orange-50 text-orange-800 border-orange-200",
  "false-friend": "bg-rose-50 text-rose-800 border-rose-200",
  register: "bg-violet-50 text-violet-800 border-violet-200",
};

export default function PracticeStudio({
  dict,
  lang,
  profile,
  initialConversations,
  initialConversation,
  initialMessages,
  initialMode,
}: Props) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [active, setActive] = useState<ConversationDTO | null>(initialConversation);
  const [messages, setMessages] = useState<MessageDTO[]>(initialMessages);
  const [mode, setMode] = useState<Mode>(initialConversation?.mode ?? initialMode);
  const [level, setLevel] = useState<Level>(
    isLevel(profile.level) ? profile.level : initialConversation?.level ?? "B1",
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [showTranslation, setShowTranslation] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const dictation = useDictation({ lang: "en-US", maxSeconds: 60 });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const meta = MODE_META[mode];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  useEffect(() => {
    if (dictation.transcript) setInput(dictation.transcript);
  }, [dictation.transcript]);

  const toggleTranslation = (id: number) => {
    setShowTranslation((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startConversation = async (nextMode: Mode = mode, nextLevel: Level = level) => {
    setStarting(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode, level: nextLevel }),
      });
      const data = (await response.json()) as {
        conversation?: ConversationDTO;
        message?: MessageDTO;
        error?: string;
      };
      if (!response.ok || !data.conversation || !data.message) {
        throw new Error(data.error ?? dict.common.error);
      }
      setActive(data.conversation);
      setMessages([data.message]);
      setConversations((current) => [data.conversation as ConversationDTO, ...current]);
      setMode(nextMode);
      setLevel(nextLevel);
      setInput("");
      router.refresh();
    } catch {
      setError(dict.common.error);
    } finally {
      setStarting(false);
    }
  };

  const openConversation = async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${id}`);
      const data = (await response.json()) as {
        conversation?: ConversationDTO;
        messages?: MessageDTO[];
      };
      if (!response.ok || !data.conversation || !data.messages) throw new Error("failed");
      setActive(data.conversation);
      setMessages(data.messages);
      setMode(data.conversation.mode);
      setLevel(data.conversation.level);
      setShowTranslation(new Set());
    } catch {
      setError(dict.common.error);
    }
  };

  const sendMessage = async (override?: string) => {
    if (!active) return;
    const text = (override ?? input).trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    setInput("");
    try {
      const response = await fetch(`/api/conversations/${active.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await response.json()) as {
        userMessage?: MessageDTO;
        assistantMessage?: MessageDTO;
        error?: string;
      };
      if (!response.ok || !data.userMessage || !data.assistantMessage) {
        throw new Error(data.error ?? dict.practice.errorSend);
      }
      setMessages((current) => [...current, data.userMessage as MessageDTO, data.assistantMessage as MessageDTO]);
      router.refresh();
    } catch {
      setInput(text);
      setError(dict.practice.errorSend);
    } finally {
      setSending(false);
    }
  };

  const correctionsFor = (message: MessageDTO) =>
    message.role === "user" ? message.corrections ?? [] : [];

  const hints = useMemo(() => meta.hints, [meta]);
  const starters = useMemo(() => meta.starters, [meta]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">
            {dict.nav.practice}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{dict.practice.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{dict.practice.subtitle}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => void startConversation(mode, level)}
          disabled={starting}
        >
          <span className="text-lg leading-none">＋</span>
          {starting ? dict.common.loading : dict.practice.newChat}
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[286px_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.practice.scenarios}
            </p>
            <div className="mt-3 space-y-2">
              {MODES.map((item) => {
                const info = MODE_META[item];
                const selected = item === mode;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-forest/40 bg-paper-deep/70 shadow-sm"
                        : "border-sand/70 bg-white hover:border-moss/40"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span aria-hidden>{info.emoji}</span>
                      {info.name[lang === "pt-PT" ? "pt" : lang]}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-ink-soft">
                      {info.description[lang === "pt-PT" ? "pt" : lang]}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.practice.level}
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as Level)}
                className="field mt-1.5"
              >
                {LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void startConversation(mode, level)}
              disabled={starting}
              className="btn-ghost mt-3 w-full justify-center border-forest/30 text-forest"
            >
              {starting ? dict.common.loading : dict.practice.newChat}
            </button>
          </div>

          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.practice.history}
            </p>
            <div className="mt-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-ink-soft">{dict.practice.emptyHistory}</p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => void openConversation(conversation.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${
                      active?.id === conversation.id
                        ? "bg-forest text-white"
                        : "text-ink-soft hover:bg-paper-deep/70"
                    }`}
                  >
                    <span aria-hidden>{MODE_META[conversation.mode].emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-inherit">{conversation.title}</span>
                      <span className="block text-[10px] opacity-70">
                        {formatDay(conversation.updatedAt)} ·{" "}
                        {conversation.level}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {dict.practice.usefulPhrases}
            </p>
            <ul className="mt-2 space-y-2">
              {hints.map((hint) => (
                <li key={hint.en} className="rounded-lg bg-paper-deep/50 p-2">
                  <button
                    type="button"
                    onClick={() => setInput(hint.en)}
                    className="block w-full text-left text-xs font-medium text-ink hover:text-forest"
                  >
                    {hint.en}
                  </button>
                  <span className="mt-0.5 block text-[11px] text-ink-soft">
                    {lang === "es" ? hint.es : hint.pt}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="order-1 flex min-h-[560px] flex-col overflow-hidden rounded-3xl border border-sand bg-card shadow-[0_20px_50px_-40px_rgba(8,37,31,0.6)] lg:order-2 lg:min-h-[660px]">
          <div className={`flex items-center justify-between gap-3 bg-gradient-to-r ${meta.gradient} px-4 py-3 text-white sm:px-5`}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg" aria-hidden>
                {meta.emoji}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {meta.name[lang === "pt-PT" ? "pt" : lang]}
                </p>
                <p className="truncate text-[11px] text-white/70">
                  {profile.name} · {dict.common.level} {active?.level ?? level} ·{" "}
                  {MODE_META[active?.mode ?? mode].name[lang === "pt-PT" ? "pt" : lang]}
                </p>
              </div>
            </div>
            <span className="chip border-white/25 text-white/85">{messages.length} msg</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 hide-scrollbar sm:px-5">
            {!active ? (
              <div className="rounded-2xl border border-dashed border-sand bg-paper/60 p-5">
                <h2 className="font-display text-2xl text-ink">{dict.home.modesTitle}</h2>
                <p className="mt-1 text-sm text-ink-soft">{dict.home.modesSubtitle}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {MODES.map((item) => {
                    const info = MODE_META[item];
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => void startConversation(item, level)}
                        className="rounded-xl border border-sand bg-white p-3 text-left transition hover:border-moss"
                      >
                        <span className="text-lg" aria-hidden>
                          {info.emoji}
                        </span>
                        <span className="mt-1 block text-sm font-semibold">
                          {info.name[lang === "pt-PT" ? "pt" : lang]}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-soft">
                          {info.description[lang === "pt-PT" ? "pt" : lang]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((message) =>
                message.role === "assistant" ? (
                  <div key={message.id} className="animate-rise flex gap-2.5">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest font-display text-sm text-lime">
                      F
                    </span>
                    <div className="max-w-[86%] rounded-2xl rounded-tl-sm border border-sand bg-white px-3.5 py-3 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-moss">
                        {dict.practice.tutor} · English
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed text-ink">{message.content}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAudioError(null);
                            setSpeakingId(message.id);
                            void speak(message.content, {
                              lang: profile.voice,
                              rate: 0.94,
                              onEnd: () => setSpeakingId(null),
                            }).then((ok) => {
                              if (!ok) setAudioError(dict.coach.speechBlocked);
                              if (!ok) setSpeakingId(null);
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-sand px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-moss hover:text-forest"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                            <path d="M4 9v6h3l5 4V5L7 9z" strokeLinejoin="round" />
                            <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
                          </svg>
                          {speakingId === message.id ? dict.common.stop : dict.common.listen}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAudioError(null);
                            setSpeakingId(message.id);
                            void speak(message.content, {
                              lang: profile.voice,
                              rate: 0.58,
                              onEnd: () => setSpeakingId(null),
                            }).then((ok) => {
                              if (!ok) setAudioError(dict.coach.speechBlocked);
                              setSpeakingId(null);
                            });
                          }}
                          className="rounded-full border border-sand px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-moss hover:text-forest"
                        >
                          🐢 {dict.practice.slow}
                        </button>
                        {message.translationPt || message.translationEs ? (
                          <button
                            type="button"
                            onClick={() => toggleTranslation(message.id)}
                            className="rounded-full border border-sand px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-moss hover:text-forest"
                          >
                            {showTranslation.has(message.id)
                              ? dict.practice.hideTranslation
                              : dict.practice.showTranslation}
                          </button>
                        ) : null}
                        {message.meta?.engine === "engine" ? (
                          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-soft/60">
                            local tutor
                          </span>
                        ) : null}
                        <InlineDictionPractice
                          dict={dict}
                          lang={lang}
                          voice={profile.voice}
                          text={message.content.split(/(?<=[.!?])\s/)[0] ?? message.content}
                          mode={active?.mode ?? mode}
                        />
                      </div>
                      {showTranslation.has(message.id) ? (
                        <div className="mt-2 space-y-1.5 rounded-xl bg-paper-deep/60 p-2.5 text-xs">
                          {message.translationPt ? (
                            <p className="text-ink-soft">
                              <span className="mr-1 font-semibold text-forest">PT</span>
                              {message.translationPt}
                            </p>
                          ) : null}
                          {message.translationEs ? (
                            <p className="text-ink-soft">
                              <span className="mr-1 font-semibold text-coral">ES</span>
                              {message.translationEs}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="animate-rise flex flex-col items-end gap-2">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-forest px-3.5 py-3 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lime/80">
                        {dict.practice.you}
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed">{message.content}</p>
                    </div>

                    <div className="w-full max-w-[92%] space-y-2">
                      {correctionsFor(message).length === 0 ? (
                        <div className="flex items-center gap-2 rounded-xl border border-lime/60 bg-lime/25 px-3 py-2 text-xs font-medium text-forest">
                          <span aria-hidden>✓</span>
                          {dict.practice.noErrors}
                          {message.meta?.fluency ? (
                            <span className="ml-auto shrink-0 text-[10px] uppercase tracking-[0.12em] text-forest/70">
                              {dict.practice.fluency} {message.meta.fluency}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-coral/25 bg-[#fdf2ee] p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coral">
                              {dict.practice.correctionsTitle} · {correctionsFor(message).length}
                            </p>
                            {message.meta?.fluency ? (
                              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                                {dict.practice.fluency} {message.meta.fluency}
                              </span>
                            ) : null}
                          </div>

                          {message.meta?.corrected && message.meta.corrected !== message.content ? (
                            <div className="mt-2 rounded-lg bg-white/70 px-2.5 py-2">
                              <p className="text-xs text-ink">
                                <span className="mr-1 font-semibold text-forest">
                                  {dict.practice.corrected}:
                                </span>
                                {message.meta.corrected}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void speak(message.meta?.corrected ?? message.content, {
                                      lang: profile.voice,
                                      rate: 0.9,
                                    })
                                  }
                                  className="rounded-full border border-forest/25 bg-white px-2 py-0.5 text-[10px] font-semibold text-forest"
                                >
                                  🔊 {dict.common.listen}
                                </button>
                                <InlineDictionPractice
                                  dict={dict}
                                  lang={lang}
                                  voice={profile.voice}
                                  text={message.meta.corrected}
                                  mode={active?.mode ?? mode}
                                />
                              </div>
                            </div>
                          ) : null}

                          <ul className="mt-2 space-y-2">
                            {correctionsFor(message).map((correction) => (
                              <li key={correction.id} className="rounded-lg bg-white/80 p-2">
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                  <span className="rounded bg-rose-50 px-1.5 py-0.5 font-medium text-rose-700 line-through decoration-rose-400">
                                    {correction.original.trim()}
                                  </span>
                                  <span className="text-ink-soft">→</span>
                                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-800">
                                    {correction.correction.trim()}
                                  </span>
                                  <span
                                    className={`ml-auto rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] ${
                                      categoryTone[correction.category] ?? "border-sand bg-paper text-ink-soft"
                                    }`}
                                  >
                                    {correction.category}
                                  </span>
                                </div>
                                <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">
                                  <span className="font-semibold text-forest">PT </span>
                                  {correction.pt}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">
                                  <span className="font-semibold text-coral">ES </span>
                                  {correction.es}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.meta?.notes && message.meta.notes.length > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                            {dict.practice.notesTitle}
                          </p>
                          <ul className="mt-1.5 space-y-1">
                            {message.meta.notes.map((note) => (
                              <li key={note.word} className="text-[11px] leading-snug text-amber-900">
                                <span className="font-semibold">{note.word}</span> —{" "}
                                {lang === "es" ? note.es : note.pt}
                                {lang !== "en" ? (
                                  <span className="text-amber-900/70"> · {lang === "es" ? note.pt : note.es}</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ),
              )
            )}

            {sending ? (
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="h-2 w-2 animate-recording rounded-full bg-moss" />
                {dict.practice.thinking}
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {error ? (
            <p className="mx-4 mb-2 rounded-xl border border-coral/30 bg-[#fdf2ee] px-3 py-2 text-xs text-coral">
              {error}
            </p>
          ) : null}
          {dictation.error ? (
            <p className="mx-4 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {dictation.error === "denied" ? dict.coach.micDenied : dict.coach.micUnsupported}
            </p>
          ) : null}
          {audioError ? (
            <p className="mx-4 mb-2 rounded-xl border border-coral/30 bg-[#fdf2ee] px-3 py-2 text-xs text-coral">
              {audioError}
            </p>
          ) : null}

          {active && messages.length <= 1 ? (
            <div className="mx-4 mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                {dict.practice.starters}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {starters.slice(0, 3).map((starter) => (
                  <button
                    key={starter.en}
                    type="button"
                    onClick={() => void sendMessage(starter.en)}
                    className="rounded-full border border-sand bg-white px-2.5 py-1 text-[11px] text-ink-soft hover:border-moss hover:text-forest"
                  >
                    {starter.en.length > 46 ? `${starter.en.slice(0, 46)}…` : starter.en}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-sand bg-paper/50 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (dictation.recording) {
                    dictation.stop();
                    if (dictation.transcript) setInput(dictation.transcript);
                    return;
                  }
                  dictation.reset();
                  dictation.start();
                }}
                title={dictation.recording ? dict.practice.recording : dict.practice.mic}
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                  dictation.recording
                    ? "animate-recording border-coral bg-coral text-white"
                    : "border-sand bg-white text-forest hover:border-moss"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" strokeLinecap="round" />
                </svg>
              </button>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={2}
                placeholder={
                  dictation.recording
                    ? `${dict.practice.recording} · ${dictation.secondsLeft}s`
                    : dict.practice.placeholder
                }
                className="field max-h-32 min-h-[52px] resize-y"
                disabled={!active || sending}
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!active || sending || !input.trim()}
                className="btn-primary h-11 shrink-0"
              >
                {dict.practice.send}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] text-ink-soft/80">
              <span>{dict.practice.engineNote}</span>
              <span className="font-semibold">🎙 {dict.practice.recordLong}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
