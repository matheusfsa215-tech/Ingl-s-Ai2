"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import {
  detectPlatform,
  isStandalone,
  promptInstall,
  subscribeInstallAvailability,
  type Platform,
} from "@/lib/pwa";

const PLATFORM_LABEL: Record<Platform, string> = {
  android: "Android",
  ios: "iOS / iPadOS",
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  other: "—",
};

export default function InstallPanel({ dict }: { dict: Dictionary }) {
  const [platform, setPlatform] = useState<Platform>("other");
  const [installed, setInstalled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    return subscribeInstallAvailability(setAvailable);
  }, []);

  const install = async () => {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "unavailable") setMessage(dict.pwa.unavailable);
      if (outcome === "accepted") {
        setInstalled(true);
        setMessage(dict.pwa.installed);
      }
      if (outcome === "dismissed") setMessage(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-lime/40 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest font-display text-2xl font-bold text-lime">
            F
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-moss">
              {dict.pwa.detected}: {PLATFORM_LABEL[platform]}
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink">{dict.pwa.installTitle}</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">{dict.pwa.installBody}</p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          <span
            className={`chip justify-center ${
              installed
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : available
                  ? "border-lime bg-lime/30 text-forest"
                  : "border-sand bg-paper text-ink-soft"
            }`}
          >
            {installed
              ? dict.app.installedBadge
              : available
                ? dict.app.availableBadge
                : dict.app.manualBadge}
          </span>
          <button
            type="button"
            onClick={() => void install()}
            disabled={busy || installed}
            className="btn-primary"
          >
            {installed ? dict.pwa.installed.split(".")[0] : dict.pwa.installCta}
          </button>
        </div>
      </div>
      {message ? (
        <p className="relative mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}
