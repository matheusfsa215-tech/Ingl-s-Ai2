"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRecognition, type Recognition } from "@/lib/speech";

type Options = {
  lang?: string;
  maxSeconds?: number;
};

export type Dictation = {
  supported: boolean;
  recording: boolean;
  transcript: string;
  interim: string;
  secondsLeft: number;
  error: "unsupported" | "denied" | "failed" | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTranscript: (value: string) => void;
};

/**
 * Long-running dictation: keeps the recogniser alive for up to `maxSeconds`
 * (auto-restarts when Android/iOS end the session early) and exposes a countdown.
 */
export function useDictation({ lang = "en-US", maxSeconds = 60 }: Options = {}): Dictation {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(maxSeconds);
  const [error, setError] = useState<Dictation["error"]>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false);
  const finalsRef = useRef("");
  const deadlineRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const maxRef = useRef(maxSeconds);

  useEffect(() => {
    maxRef.current = maxSeconds;
    if (!activeRef.current) setSecondsLeft(maxSeconds);
  }, [maxSeconds]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        activeRef.current = false;
        try {
          recognitionRef.current?.stop();
        } catch {
          /* ignore */
        }
        clearTimer();
        setRecording(false);
        setInterim("");
      }
    }, 250);
  };

  const buildRecognition = (): Recognition | null => {
    const recognition = createRecognition(lang);
    if (!recognition) return null;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finalText += `${text} `;
        else interimText += `${text} `;
      }
      if (finalText.trim()) {
        finalsRef.current = `${finalsRef.current} ${finalText}`.replace(/\s+/g, " ").trim();
        setTranscript(finalsRef.current);
      }
      setInterim(interimText.trim());
    };

    recognition.onerror = (event) => {
      const code = event.error ?? "";
      if (code === "not-allowed" || code === "service-not-allowed") {
        activeRef.current = false;
        setError("denied");
        setRecording(false);
        clearTimer();
        return;
      }
      if (code === "no-speech" || code === "aborted" || code === "network") return;
      setError("failed");
    };

    recognition.onend = () => {
      if (!activeRef.current) {
        setRecording(false);
        setInterim("");
        return;
      }
      if (Date.now() >= deadlineRef.current) {
        activeRef.current = false;
        setRecording(false);
        setInterim("");
        clearTimer();
        return;
      }
      window.setTimeout(() => {
        if (!activeRef.current) return;
        try {
          recognition.start();
        } catch {
          /* already running */
        }
      }, 220);
    };

    return recognition;
  };

  const start = () => {
    setError(null);
    const recognition = buildRecognition();
    if (!recognition) {
      setSupported(false);
      setError("unsupported");
      return;
    }
    finalsRef.current = "";
    setTranscript("");
    setInterim("");
    deadlineRef.current = Date.now() + maxRef.current * 1000;
    setSecondsLeft(maxRef.current);
    activeRef.current = true;
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setRecording(true);
      startTimer();
    } catch {
      setError("failed");
      setRecording(false);
    }
  };

  const stop = () => {
    activeRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    clearTimer();
    setRecording(false);
    setInterim("");
    setSecondsLeft(maxRef.current);
  };

  const reset = () => {
    stop();
    finalsRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  };

  return {
    supported,
    recording,
    transcript,
    interim,
    secondsLeft,
    error,
    start,
    stop,
    reset,
    setTranscript: (value: string) => {
      finalsRef.current = value;
      setTranscript(value);
    },
  };
}
