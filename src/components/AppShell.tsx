"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { UI_LANGS } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { UiLang } from "@/lib/content";

type ShellProfile = {
  name: string;
  xp: number;
  streak: number;
  level: string;
};

const ICONS: Record<string, ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 8h6V4h-6z" strokeLinejoin="round" />
    </svg>
  ),
  practice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M20 14a3 3 0 0 1-3 3H9l-4 3v-3.5A3 3 0 0 1 4 14V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" strokeLinejoin="round" />
      <path d="M8 9h8M8 12.5h5" strokeLinecap="round" />
    </svg>
  ),
  pronunciation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" strokeLinecap="round" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M4 19V5M4 19h16" strokeLinecap="round" />
      <path d="M8 16v-4M12.5 16V8M17 16v-6" strokeLinecap="round" />
    </svg>
  ),
  coach: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 21l1.4-4.3A7.5 7.5 0 1 1 20 12.5z" strokeLinejoin="round" />
      <path d="M9 11.5v2M12 9.5v5M15 11v3" strokeLinecap="round" />
    </svg>
  ),
  app: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" strokeLinecap="round" />
    </svg>
  ),
};

export default function AppShell({
  children,
  dict,
  lang,
  profile,
}: {
  children: ReactNode;
  dict: Dictionary;
  lang: UiLang;
  profile: ShellProfile;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const navItems = [
    { href: "/", key: "dashboard", label: dict.nav.dashboard },
    { href: "/praticar", key: "practice", label: dict.nav.practice },
    { href: "/treino", key: "coach", label: dict.nav.coach },
    { href: "/pronuncia", key: "pronunciation", label: dict.nav.pronunciation },
    { href: "/progresso", key: "progress", label: dict.nav.progress },
  ];
  const appItem = { href: "/instalar", key: "app", label: dict.nav.app };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const changeLang = (next: UiLang) => {
    setSwitching(true);
    document.cookie = `fluentia_lang=${next}; path=/; max-age=31536000; samesite=lax`;
    void fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uiLanguage: next }),
    }).finally(() => {
      router.refresh();
      setSwitching(false);
    });
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="relative hidden bg-forest text-[#eef3e9] lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(280px_180px_at_20%_0%,rgba(216,240,126,0.22),transparent)]" />
        <div className="relative px-6 pt-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime font-display text-xl font-bold text-forest-deep">
              F
            </span>
            <span>
              <span className="block font-display text-2xl leading-none tracking-tight">
                {dict.brand.name}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.22em] text-[#b9cdb9]">
                {dict.brand.tagline}
              </span>
            </span>
          </Link>

          <nav className="mt-9 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-[#f8f6ee] text-forest-deep shadow-sm"
                      : "text-[#c6d7c6] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-forest" : "text-[#9fb89f]"}>{ICONS[item.key]}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#a9c3a9]">{dict.common.xp}</p>
            <p className="mt-1 font-display text-3xl text-lime">{profile.xp}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#c6d7c6]">
              <span>
                {profile.streak} {dict.common.days}
              </span>
              <span className="chip border-white/25 text-[#dcebcd]">{profile.level}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-lime"
                style={{ width: `${Math.min(100, (profile.xp % 150) / 1.5 + 4)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative px-6 pb-7">
          <Link
            href={appItem.href}
            className={`mb-1.5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              isActive(appItem.href) ? "bg-[#f8f6ee] text-forest-deep" : "bg-white/5 text-[#c6d7c6] hover:text-white"
            }`}
          >
            <span className={isActive(appItem.href) ? "text-forest" : "text-[#9fb89f]"}>{ICONS.app}</span>
            {appItem.label}
          </Link>
          <Link
            href="/diagnostico"
            className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              isActive("/diagnostico") ? "bg-[#f8f6ee] text-forest-deep" : "bg-white/5 text-[#c6d7c6] hover:text-white"
            }`}
          >
            <span className={isActive("/diagnostico") ? "text-forest" : "text-[#9fb89f]"}>🩺</span>
            Diagnóstico
          </Link>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1">
            {UI_LANGS.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={switching}
                onClick={() => changeLang(option.id)}
                title={option.label}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                  lang === option.id
                    ? "bg-[#f8f6ee] text-forest-deep"
                    : "text-[#c6d7c6] hover:text-white"
                }`}
              >
                {option.short}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#9fb89f]">
            {profile.name} · {dict.common.level} {profile.level}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-sand/70 bg-paper/85 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest font-display text-base font-bold text-lime">
                F
              </span>
              <span className="font-display text-xl">{dict.brand.name}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={appItem.href}
                aria-label={appItem.label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-forest ring-1 ring-sand"
              >
                {ICONS.app}
              </Link>
              <div className="flex items-center gap-1 rounded-full bg-white/70 p-0.5 ring-1 ring-sand">
                {UI_LANGS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => changeLang(option.id)}
                    className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                      lang === option.id ? "bg-forest text-white" : "text-ink-soft"
                    }`}
                  >
                    {option.short}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-card/95 backdrop-blur lg:hidden">
          <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[9px] font-semibold leading-none sm:text-[10px] ${
                    active ? "text-forest" : "text-ink-soft"
                  }`}
                >
                  <span className={active ? "text-forest" : "text-ink-soft/70"}>{ICONS[item.key]}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
