"use client";

import { useEffect, useState } from "react";
import { loadVoices, speak, stopSpeaking } from "@/lib/speech";

type Row = { id: string; label: string; status: "ok" | "warn" | "fail"; detail: string };

const tone = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  fail: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function BrowserDiagnostics({ voice }: { voice: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = () => {
    const next: Row[] = [];
    const https = window.location.protocol === "https:" || window.location.hostname === "localhost";
    next.push({
      id: "https",
      label: "HTTPS",
      status: https ? "ok" : "fail",
      detail: https
        ? "Ligação segura: PWA, microfone e service worker permitidos."
        : "Sem HTTPS o telemóvel bloqueia microfone e instalação.",
    });

    next.push({
      id: "online",
      label: "Ligação à internet",
      status: navigator.onLine ? "ok" : "warn",
      detail: navigator.onLine ? "Online." : "Offline: só as páginas em cache abrem; /api precisa de rede.",
    });

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    next.push({
      id: "standalone",
      label: "Modo aplicação",
      status: standalone ? "ok" : "warn",
      detail: standalone
        ? "A correr instalada (ecrã inteiro)."
        : "A correr no navegador. Instala pela página App para ecrã inteiro.",
    });

    const scope = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const recognition = Boolean(scope.SpeechRecognition ?? scope.webkitSpeechRecognition);
    next.push({
      id: "recognition",
      label: "Ditado (reconhecimento de voz)",
      status: recognition ? "ok" : "fail",
      detail: recognition
        ? "Disponível: podes gravar no chat e em Dicção."
        : "Indisponível neste navegador. Usa Chrome/Edge no Android ou escreve a transcrição.",
    });

    setRows(next);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistration().then((registration) => {
        setRows((current) => [
          ...current,
          {
            id: "sw",
            label: "Service worker",
            status: registration ? "ok" : "warn",
            detail: registration
              ? `Registado (${registration.active?.state ?? registration.installing?.state ?? "a instalar"}).`
              : "Sem registo. Recarrega com Ctrl+F5 / limpa dados do site.",
          },
        ]);
      });
      void caches?.keys?.().then((keys) => {
        const hasV4 = keys.some((key) => key.includes("v4-audio"));
        setRows((current) => [
          ...current,
          {
            id: "cache",
            label: "Cache da app",
            status: hasV4 ? "ok" : "warn",
            detail: hasV4
              ? keys.join(", ")
              : `Caches: ${keys.join(", ") || "nenhum"}. Se vês áudio antigo, atualiza a app ou limpa os dados do site.`,
          },
        ]);
      });
    } else {
      setRows((current) => [
        ...current,
        {
          id: "sw",
          label: "Service worker",
          status: "fail",
          detail: "Navegador sem suporte: a app não fica disponível offline.",
        },
      ]);
    }

    void loadVoices().then((voices) => {
      const english = voices.filter((item) => item.lang.toLowerCase().startsWith("en"));
      setRows((current) => [
        ...current,
        {
          id: "voices",
          label: "Vozes de inglês (áudio)",
          status: english.length > 0 ? "ok" : "fail",
          detail:
            english.length > 0
              ? `${english.length} voz(es): ${english
                  .slice(0, 3)
                  .map((item) => `${item.name} (${item.lang})`)
                  .join(" · ")} — alvo: ${voice}`
              : "Nenhuma voz inglesa. Android: Definições → Acessibilidade → Texto para voz → instalar motor/voz.",
        },
      ]);
    });
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const test = async () => {
    setSpeaking(true);
    stopSpeaking();
    await speak("Good morning! This is the Fluentia audio test. Can you hear me clearly?", {
      lang: voice,
      rate: 0.94,
      onEnd: () => setSpeaking(false),
    });
    setSpeaking(false);
  };

  const copyReport = async () => {
    const text = rows
      .map((row) => `${row.status.toUpperCase()} · ${row.label}: ${row.detail}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(`Fluentia diagnostics\n${window.location.origin}\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Diagnóstico deste dispositivo</h2>
          <p className="mt-1 text-[12px] text-ink-soft">
            Corre no navegador: HTTPS, vozes, microfone, service worker e cache.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={run} className="btn-ghost">
            ↻ Repetir
          </button>
          <button type="button" onClick={test} className="btn-primary" disabled={speaking}>
            {speaking ? "A falar…" : "🔊 Testar áudio"}
          </button>
          <button type="button" onClick={() => void copyReport()} className="btn-ghost">
            {copied ? "Copiado!" : "Copiar relatório"}
          </button>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {rows.map((row) => (
          <li key={row.id} className={`rounded-xl border px-3 py-2 ${tone[row.status]}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
              {row.status === "ok" ? "✓" : row.status === "warn" ? "!" : "✕"} {row.label}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug opacity-90">{row.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
