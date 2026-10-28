import Link from "next/link";
import AudioCheck from "@/components/AudioCheck";
import CopyBlock from "@/components/CopyBlock";
import InstallPanel from "@/components/InstallPanel";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import { getOrCreateProfile } from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

const ANDROID_COMMANDS = `# 1. Dependências do Capacitor
npm i @capacitor/core @capacitor/cli @capacitor/android

# 2. Criar o projeto Android
npx cap add android

# 3. Empacotar a app web e sincronizar
npm run build
npx cap sync android

# 4. Gerar o APK/AAB no Android Studio
npx cap open android
# Build > Build Bundle(s) / APK(s) > Build APK(s)`;

const DESKTOP_COMMANDS = `# 1. Dependências do Electron
npm i -D electron electron-builder

# 2. Correr em janela de aplicação (com o Next em execução)
npm run build && npm run start &
ELECTRON_START_URL=http://localhost:3000 npx electron electron/main.cjs

# 3. Gerar instalador Windows / macOS / Linux
npx electron-builder --dir
npx electron-builder --win --mac --linux`;

const STORE_COMMANDS = `# Publicar na Play Store (AAB assinado)
cd android && ./gradlew bundleRelease
# android/app/build/outputs/bundle/release/app-release.aab

# Verificar o service worker e o manifesto
curl -s /manifest.webmanifest | head
# Chrome DevTools > Application > Manifest / Service Workers`;

export default async function InstallPage() {
  const [learnerId, langCookie] = await Promise.all([getLearnerId(), getUiLangCookie()]);
  const lang = normalizeLang(langCookie);
  const dict = getDictionary(lang);
  const profile = await getOrCreateProfile(learnerId).catch(() => null);
  const app = dict.app;

  const features = [app.feature1, app.feature2, app.feature3, app.feature4, app.feature5];

  const cards = [
    {
      key: "android",
      emoji: "🤖",
      title: app.androidTitle,
      body: app.androidBody,
      steps: app.androidSteps,
      accent: "from-[#0E4A3C] to-[#2E7D5B]",
    },
    {
      key: "desktop",
      emoji: "🖥️",
      title: app.desktopTitle,
      body: app.desktopBody,
      steps: app.desktopSteps,
      accent: "from-[#123C63] to-[#2B6CA3]",
    },
    {
      key: "ios",
      emoji: "📱",
      title: app.iosTitle,
      body: app.iosBody,
      steps: [],
      accent: "from-[#6C2E5B] to-[#B05B84]",
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss">{dict.nav.app}</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{app.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{app.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/diagnostico" className="btn-primary">
            🩺 Diagnóstico
          </Link>
          <Link href="/" className="btn-ghost">
            {app.backHome}
          </Link>
        </div>
      </header>

      <InstallPanel dict={dict} />

      <AudioCheck dict={dict} voice={profile?.voice ?? "en-GB"} />

      <section className="grid gap-3 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.key} className="card overflow-hidden">
            <div className={`flex items-center gap-2 bg-gradient-to-r ${card.accent} px-4 py-3 text-white`}>
              <span aria-hidden className="text-lg">
                {card.emoji}
              </span>
              <h2 className="text-sm font-semibold">{card.title}</h2>
            </div>
            <div className="p-4">
              <p className="text-[12px] leading-relaxed text-ink-soft">{card.body}</p>
              {card.steps.length > 0 ? (
                <ol className="mt-3 space-y-2">
                  {card.steps.map((step, index) => (
                    <li key={step} className="flex gap-2 text-[12px] text-ink-soft">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-deep text-[10px] font-bold text-forest">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ink">{app.nativeTitle}</h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-soft">{app.nativeBody}</p>
          </div>
          <span className="chip border-forest/20 bg-paper text-forest">{app.nativeCommands}</span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <CopyBlock code={ANDROID_COMMANDS} title="Capacitor · Android" dict={dict} />
          <CopyBlock code={DESKTOP_COMMANDS} title="Electron · Windows / macOS / Linux" dict={dict} />
        </div>
        <div className="mt-3">
          <CopyBlock code={STORE_COMMANDS} title="Distribuição" dict={dict} />
        </div>
        <p className="mt-3 rounded-xl bg-paper-deep/60 px-3 py-2 text-[11px] leading-snug text-ink-soft">
          {app.technicalBody}
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink">{app.featuresTitle}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2 rounded-xl border border-sand/70 bg-white px-3 py-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/60 text-[10px] font-bold text-forest">
                ✓
              </span>
              <p className="text-[12px] leading-snug text-ink-soft">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-forest/25 bg-forest p-5 text-[#e7efe1]">
        <h2 className="font-display text-xl text-lime">{app.technicalTitle}</h2>
        <div className="mt-3 grid gap-3 text-[11px] leading-relaxed text-[#c8d8c4] sm:grid-cols-3">
          <p>
            <span className="block font-semibold text-lime/90">manifest.webmanifest</span>
            display: standalone · theme: #103E33 · icons 192/512 + maskable · shortcuts
          </p>
          <p>
            <span className="block font-semibold text-lime/90">sw.js</span>
            cache-first para /_next/static e ícones · network-first com fallback para navegação · /api
            sempre em rede
          </p>
          <p>
            <span className="block font-semibold text-lime/90">Acesso</span>
            HTTPS obrigatório para instalar · microfone com permissão do utilizador · progresso ligado ao
            dispositivo
          </p>
        </div>
      </section>
    </div>
  );
}
