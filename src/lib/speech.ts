export type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type RecognitionAlternative = { transcript?: string; confidence?: number };
type RecognitionResult = { isFinal?: boolean; 0?: RecognitionAlternative; length?: number };
export type RecognitionEvent = { resultIndex?: number; results: ArrayLike<RecognitionResult> };

type RecognitionCtor = new () => Recognition;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function createRecognition(lang = "en-US"): Recognition | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

export function readTranscript(event: RecognitionEvent): { text: string; final: boolean } {
  let text = "";
  let final = false;
  for (let index = 0; index < event.results.length; index += 1) {
    const result = event.results[index];
    const alternative = result?.[0];
    if (alternative?.transcript) text += `${alternative.transcript} `;
    if (result?.isFinal) final = true;
  }
  return { text: text.trim(), final };
}

/* ------------------------------------------------------------------ */
/* Text to speech tuned for mobile browsers                            */
/* ------------------------------------------------------------------ */

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function synth(): SpeechSynthesis | null {
  if (!isSpeechSupported()) return null;
  return window.speechSynthesis;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const instance = synth();
  if (!instance) return Promise.resolve([]);
  if (cachedVoices.length > 0) return Promise.resolve(cachedVoices);

  if (!voicesPromise) {
    voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        const voices = instance.getVoices();
        if (voices.length > 0) {
          cachedVoices = voices;
          settled = true;
          resolve(voices);
        }
      };
      const timer = window.setInterval(() => {
        finish();
        if (settled) window.clearInterval(timer);
      }, 120);
      instance.addEventListener?.("voiceschanged", finish);
      window.setTimeout(() => {
        window.clearInterval(timer);
        if (!settled) {
          cachedVoices = instance.getVoices();
          settled = true;
          resolve(cachedVoices);
        }
      }, 2500);
    });
  }
  return voicesPromise;
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const normalized = lang.replace("_", "-").toLowerCase();
  const exact = voices.filter((voice) => voice.lang.replace("_", "-").toLowerCase() === normalized);
  if (exact.length) return exact.find((voice) => voice.localService) ?? exact[0];
  const family = normalized.slice(0, 2);
  const fallback = voices.filter((voice) => voice.lang.toLowerCase().startsWith(family));
  if (fallback.length) return fallback.find((voice) => voice.localService) ?? fallback[0];
  return null;
}

export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: string) => void;
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Reliable speech on Android/iOS: waits for the voice list, retries once if the
 * engine silently drops the utterance and falls back to a default-voice call.
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<boolean> {
  const instance = synth();
  if (!instance || !text.trim()) {
    options.onError?.("unsupported");
    return false;
  }

  const lang = options.lang ?? "en-GB";
  const rate = Math.min(1.3, Math.max(0.4, options.rate ?? 0.94));
  const voices = await loadVoices();
  const voice = pickVoice(voices, lang);

  try {
    instance.cancel();
    // Android needs a beat between cancel() and speak(), otherwise audio is silent.
    await wait(70);
  } catch {
    /* ignore */
  }

  const attempt = (useVoice: boolean) =>
    new Promise<boolean>((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voice?.lang ?? lang;
        utterance.rate = rate;
        utterance.pitch = options.pitch ?? 1;
        utterance.volume = 1;
        if (useVoice && voice) utterance.voice = voice;

        let done = false;
        const settle = (value: boolean) => {
          if (done) return;
          done = true;
          resolve(value);
        };

        utterance.onstart = () => options.onStart?.();
        utterance.onend = () => {
          options.onEnd?.();
          settle(true);
        };
        utterance.onerror = (event) => {
          const reason = (event as SpeechSynthesisErrorEvent).error ?? "error";
          if (reason === "interrupted" || reason === "canceled") {
            settle(false);
            return;
          }
          settle(false);
        };

        instance.speak(utterance);
        // Some engines never fire onstart; resolve optimistically so the UI can continue.
        window.setTimeout(() => settle(true), 700);
      } catch {
        resolve(false);
      }
    });

  const ok = await attempt(true);
  if (ok) return true;

  // Retry without an explicit voice (some Android WebViews only honour the default voice).
  if (voice) {
    await wait(60);
    return attempt(false);
  }
  options.onError?.("unsupported");
  return false;
}

export function stopSpeaking(): void {
  const instance = synth();
  if (instance) instance.cancel();
}

const splitIntoChunks = (text: string, max = 140): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > max && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

/** Speaks longer replies reliably on mobile by splitting them sentence by sentence. */
export async function speakLong(text: string, options: SpeakOptions = {}): Promise<boolean> {
  const chunks = splitIntoChunks(text);
  let started = false;
  for (const chunk of chunks) {
    const ok = await speak(chunk, options);
    if (ok) started = true;
    await wait(140);
  }
  if (!started) options.onError?.("unsupported");
  return started;
}

const VOWELS = "aeiouyAEIOUY";

/** Rough but useful English syllable split used for slow, syllable-by-syllable drills. */
export function splitSyllables(word: string): string[] {
  const clean = word.replace(/[^A-Za-z'-]/g, "");
  if (!clean) return [];
  const lower = clean.toLowerCase();
  const exception: Record<string, string[]> = {
    comfortable: ["com", "fort", "a", "ble"],
    comfortabley: ["com", "fort", "a", "bly"],
    information: ["in", "for", "ma", "tion"],
    definitely: ["def", "i", "nite", "ly"],
    vegetable: ["veg", "e", "ta", "ble"],
    chocolate: ["choc", "o", "late"],
    wednesday: ["wens", "day"],
    necessary: ["nec", "es", "sar", "y"],
    development: ["de", "vel", "op", "ment"],
    photography: ["pho", "tog", "ra", "phy"],
    restaurant: ["res", "tau", "rant"],
    interesting: ["in", "ter", "est", "ing"],
  };
  if (exception[lower]) return exception[lower];

  const parts: string[] = [];
  let current = "";
  for (let i = 0; i < clean.length; i += 1) {
    current += clean[i];
    const char = clean[i];
    const next = clean[i + 1] ?? "";
    const after = clean[i + 2] ?? "";
    const isVowel = VOWELS.includes(char);
    const nextIsVowel = VOWELS.includes(next);
    const nextIsConsonant = next && !nextIsVowel;
    const afterIsVowel = VOWELS.includes(after);
    if (isVowel && (nextIsConsonant && afterIsVowel || (nextIsConsonant && !after && current.length > 1))) {
      parts.push(current);
      current = "";
    }
  }
  if (current) {
    if (parts.length && current.length <= 2) parts[parts.length - 1] += current;
    else parts.push(current);
  }
  return parts.length > 1 && parts[parts.length - 1].length <= 0 ? parts.filter(Boolean) : parts;
}

export function syllableGuide(word: string): string {
  const parts = splitSyllables(word);
  return parts.length > 1 ? parts.join(" · ") : word;
}

/** Speaks a word slowly, one syllable at a time: "com · fort · a · ble". */
export async function speakSyllables(word: string, options: SpeakOptions = {}): Promise<boolean> {
  const parts = splitSyllables(word);
  if (parts.length <= 1) return speak(word, { ...options, rate: 0.62 });
  let started = false;
  for (const part of parts) {
    const ok = await speak(part, { ...options, rate: 0.55 });
    if (ok) started = true;
    await wait(230);
  }
  return started;
}
