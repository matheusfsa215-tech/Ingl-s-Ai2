import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppShell from "@/components/AppShell";
import PwaProvider from "@/components/PwaProvider";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import { getOrCreateProfile, levelTrack } from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";

export const metadata: Metadata = {
  title: "Fluentia — Inglês com tutor",
  description:
    "Conversa em inglês com um tutor que te corrige em português de Portugal e espanhol. Desafios de pronúncia e modos para o dia a dia, trabalho, contexto social e técnico.",
  applicationName: "Fluentia",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Fluentia",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#103E33",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [learnerId, langCookie] = await Promise.all([getLearnerId(), getUiLangCookie()]);
  const lang = normalizeLang(langCookie);
  const dict = getDictionary(lang);

  let profile = { name: "Aprendiz", xp: 0, streak: 0, level: "A2" };
  try {
    const row = await getOrCreateProfile(learnerId);
    profile = {
      name: row.name,
      xp: row.xp,
      streak: row.streak,
      level: levelTrack(row.xp).level,
    };
  } catch {
    // Keep the shell usable even if the database is momentarily unavailable.
  }

  return (
    <html lang={lang === "pt-PT" ? "pt-PT" : lang}>
      <body className="antialiased">
        <PwaProvider dict={dict} />
        <AppShell dict={dict} lang={lang} profile={profile}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
