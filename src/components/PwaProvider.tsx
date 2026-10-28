"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import {
  getDeferredPrompt,
  isStandalone,
  promptInstall,
  registerServiceWorker,
  setDeferredPrompt,
  subscribeInstallAvailability,
  type InstallPromptEvent,
} from "@/lib/pwa";

export default function PwaProvider({ dict }: { dict: Dictionary }) {
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [offline, setOffline] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDismissed(window.sessionStorage.getItem("fluentia-install-dismissed") === "1");
    setInstalled(isStandalone());
    setOffline(!navigator.onLine);

    const unsubscribe = subscribeInstallAvailability(setAvailable);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
      setAvailable(false);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    let registration: ServiceWorkerRegistration | null = null;
    void registerServiceWorker().then((value) => {
      registration = value;
      if (value?.waiting) setUpdateReady(true);
      value?.addEventListener("updatefound", () => {
        const worker = value?.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    });

    return () => {
      unsubscribe();
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      registration = null;
    };
  }, []);

  const install = async () => {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "unavailable" && !getDeferredPrompt()) {
        window.location.href = "/instalar";
        return;
      }
      if (outcome === "dismissed") {
        window.sessionStorage.setItem("fluentia-install-dismissed", "1");
        setDismissed(true);
      }
      if (outcome === "accepted") setInstalled(true);
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    window.sessionStorage.setItem("fluentia-install-dismissed", "1");
    setDismissed(true);
  };

  const reload = async () => {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage("SKIP_WAITING");
      window.location.reload();
      return;
    }
    window.location.reload();
  };

  const showInstall = available && !dismissed && !installed;

  return (
    <>
      {offline ? (
        <div className="fixed inset-x-0 top-0 z-50 bg-[#8b5e34] px-4 py-1.5 text-center text-[11px] font-semibold text-white">
          {dict.pwa.offline}
        </div>
      ) : null}

      {updateReady ? (
        <div className="fixed bottom-20 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-sand bg-card px-4 py-3 shadow-xl lg:bottom-6">
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden>
              ✨
            </span>
            <p className="flex-1 text-xs font-medium text-ink">{dict.pwa.updateTitle}</p>
            <button type="button" onClick={() => void reload()} className="btn-primary px-3 py-1.5 text-xs">
              {dict.pwa.updateCta}
            </button>
          </div>
        </div>
      ) : null}

      {showInstall ? (
        <div className="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-forest/20 bg-forest px-4 py-3 text-[#eaf1e5] shadow-2xl lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-80">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime font-display text-lg font-bold text-forest-deep">
              F
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{dict.pwa.installTitle}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#c8d8c4]">{dict.pwa.installBody}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void install()}
                  disabled={busy}
                  className="rounded-full bg-lime px-3 py-1.5 text-[11px] font-bold text-forest-deep disabled:opacity-60"
                >
                  {dict.pwa.installCta}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-full border border-white/25 px-3 py-1.5 text-[11px] font-semibold text-[#dfe9d9]"
                >
                  {dict.pwa.later}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
