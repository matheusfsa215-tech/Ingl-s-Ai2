"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, MODES, MODE_META, type Level, type Mode, type UiLang } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n";

type ProfileInput = {
  name: string;
  level: string;
  goal: string;
  voice: string;
};

const languageKey = (lang: UiLang) => (lang === "pt-PT" ? "pt" : lang);

function useProfileForm(profile: ProfileInput) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState(profile.level);
  const [goal, setGoal] = useState(profile.goal);
  const [voice, setVoice] = useState(profile.voice);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, level, goal, voice }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return { name, setName, level, setLevel, goal, setGoal, voice, setVoice, saving, saved, submit };
}

export function ProfileSetup({
  dict,
  lang,
  profile,
}: {
  dict: Dictionary;
  lang: UiLang;
  profile: ProfileInput;
}) {
  const form = useProfileForm(profile);

  return (
    <form onSubmit={form.submit} className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime/50 blur-2xl" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">
          {dict.home.today}
        </p>
        <h2 className="mt-1 font-display text-2xl text-ink">{dict.home.nameTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-ink-soft">
            {dict.home.nameLabel}
            <input
              value={form.name}
              onChange={(event) => form.setName(event.target.value)}
              placeholder={dict.home.namePlaceholder}
              maxLength={40}
              className="field mt-1"
              required
            />
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            {dict.home.levelLabel}
            <select
              value={form.level}
              onChange={(event) => form.setLevel(event.target.value)}
              className="field mt-1"
            >
              {LEVELS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-ink-soft">
            {dict.home.goalLabel}
            <select
              value={form.goal}
              onChange={(event) => form.setGoal(event.target.value)}
              className="field mt-1"
            >
              {MODES.map((option) => (
                <option key={option} value={option}>
                  {MODE_META[option].name[languageKey(lang)]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={form.saving} className="btn-primary w-full">
              {form.saving ? dict.common.saving : dict.home.saveProfile}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function ProfileSettings({
  dict,
  lang,
  profile,
}: {
  dict: Dictionary;
  lang: UiLang;
  profile: ProfileInput;
}) {
  const form = useProfileForm(profile);

  return (
    <form onSubmit={form.submit} className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {dict.progress.settingsTitle}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink-soft">
          {dict.progress.name}
          <input
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            maxLength={40}
            className="field mt-1"
          />
        </label>
        <label className="text-xs font-semibold text-ink-soft">
          {dict.progress.level}
          <select
            value={form.level}
            onChange={(event) => form.setLevel(event.target.value)}
            className="field mt-1"
          >
            {LEVELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-soft">
          {dict.progress.goal}
          <select
            value={form.goal}
            onChange={(event) => form.setGoal(event.target.value)}
            className="field mt-1"
          >
            {MODES.map((option) => (
              <option key={option} value={option}>
                {MODE_META[option].name[languageKey(lang)]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-ink-soft">
          {dict.progress.voice}
          <select
            value={form.voice}
            onChange={(event) => form.setVoice(event.target.value)}
            className="field mt-1"
          >
            <option value="en-GB">{dict.progress.voiceUK}</option>
            <option value="en-US">{dict.progress.voiceUS}</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={form.saving} className="btn-primary">
          {form.saving ? dict.common.saving : dict.common.save}
        </button>
        {form.saved ? <span className="text-xs font-medium text-moss">{dict.progress.saved}</span> : null}
      </div>
    </form>
  );
}
