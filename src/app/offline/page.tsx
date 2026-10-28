import Link from "next/link";

export const dynamic = "force-dynamic";

const COPY = {
  "pt-PT": {
    title: "Sem ligação à internet",
    body: "O Fluentia guardou as páginas que já visitaste. Assim que voltares a ter rede, as conversas e a pontuação de pronúncia ficam disponíveis outra vez.",
    back: "Tentar novamente",
    dashboard: "Ir para o painel",
    tip: "Dica: pode instalar a app e abrir a partir do ícone — a moldura carrega mais depressa.",
  },
  es: {
    title: "Sin conexión a internet",
    body: "Fluentia ha guardado las páginas que ya visitaste. Cuando vuelvas a tener red, las conversaciones y la puntuación de pronunciación estarán disponibles otra vez.",
    back: "Reintentar",
    dashboard: "Ir al panel",
    tip: "Consejo: puedes instalar la app y abrirla desde el icono; la interfaz carga más rápido.",
  },
  en: {
    title: "You're offline",
    body: "Fluentia saved the pages you already visited. As soon as you're back online, conversations and pronunciation scoring will work again.",
    back: "Retry",
    dashboard: "Go to dashboard",
    tip: "Tip: install the app and open it from its icon — the shell loads faster.",
  },
} as const;

export default function OfflinePage() {
  const copy = COPY["pt-PT"];
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-2xl text-lime" aria-hidden>
        ⚡
      </span>
      <h1 className="mt-4 font-display text-3xl text-ink">{copy.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{copy.body}</p>
      <div className="mt-2 grid w-full gap-2 sm:grid-cols-2">
        <p className="rounded-xl bg-white/70 px-3 py-2 text-[11px] text-ink-soft">{COPY.es.title} · {COPY.en.title}</p>
        <p className="rounded-xl bg-white/70 px-3 py-2 text-[11px] text-ink-soft">{copy.tip}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link href="/offline" className="btn-primary" prefetch={false}>
          {copy.back}
        </Link>
        <Link href="/" className="btn-ghost" prefetch={false}>
          {copy.dashboard}
        </Link>
      </div>
    </div>
  );
}
