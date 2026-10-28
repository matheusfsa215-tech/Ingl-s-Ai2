"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

export default function CopyBlock({
  code,
  title,
  dict,
}: {
  code: string;
  title: string;
  dict: Dictionary;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-black/20 bg-[#0d2b24]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lime/80">{title}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-[#dfe9d9] hover:border-lime hover:text-lime"
        >
          {copied ? dict.pwa.copied : dict.pwa.copy}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 text-[11px] leading-relaxed text-[#d8e6d0]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
