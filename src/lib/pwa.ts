"use client";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

export type Platform = "android" | "ios" | "windows" | "macos" | "linux" | "other";

let deferredPrompt: InstallPromptEvent | null = null;
const availableListeners = new Set<(available: boolean) => void>();

export function setDeferredPrompt(event: InstallPromptEvent | null) {
  deferredPrompt = event;
  availableListeners.forEach((listener) => listener(Boolean(event)));
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function subscribeInstallAvailability(listener: (available: boolean) => void) {
  availableListeners.add(listener);
  listener(Boolean(deferredPrompt));
  return () => {
    availableListeners.delete(listener);
  };
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  const prompt = deferredPrompt;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  setDeferredPrompt(null);
  return choice.outcome;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayMode = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayMode || iosStandalone;
}

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/windows/.test(ua)) return "windows";
  if (/mac os|macintosh/.test(ua)) return "macos";
  if (/linux|x11/.test(ua)) return "linux";
  return "other";
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return registration;
  } catch {
    return null;
  }
}
