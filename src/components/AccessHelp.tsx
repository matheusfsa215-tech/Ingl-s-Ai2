"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "1. Partilha só o domínio de produção",
    detail:
      "Na Vercel → Settings → Domains aparece o teu domínio público (ex.: iawerewf12.vercel.app, «Valid Configuration · Production»). É ESSE o link a abrir noutros telemóveis. Links compridos como iawerewf12-4vczje32k-utilizador.vercel.app são URLs internos de cada deployment e pedem sempre login.",
  },
  {
    title: "2. Onde NÃO copiar o link",
    detail:
      "Não copies o link do botão «Visit» de um deployment nem da barra de endereço depois de abrires um deployment da lista. No painel do projeto, usa o link em «Domains» (no topo do Overview).",
  },
  {
    title: "3. Vercel → Settings → Deployment Protection",
    detail:
      "Em «Vercel Authentication» deixa «Standard Protection» (o domínio de produção fica público; só os URLs internos e Preview pedem login) ou «Disabled» (tudo público). Se estiver em «All Deployments», muda. «Password Protection» deve estar desligado. Save.",
  },
  {
    title: "4. Se o projeto for de uma equipa",
    detail: "Team Settings → Deployment Protection: a regra da equipa sobrepõe-se à do projeto.",
  },
  {
    title: "5. Testa em janela privada",
    detail:
      "Abre o domínio de produção numa janela anónima ou noutro telemóvel. Deve aparecer o painel do Fluentia sem pedir email.",
  },
  {
    title: "6. O progresso fica ligado ao domínio",
    detail:
      "O perfil é guardado num cookie do domínio. Ao mudares do URL comprido para o domínio de produção, começa um perfil novo — usa sempre o mesmo domínio a partir de agora.",
  },
];

export default function AccessHelp({ productionUrl }: { productionUrl: string | null }) {
  const [origin, setOrigin] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [copied, setCopied] = useState<"link" | "steps" | null>(null);

  const publicLink = productionUrl ? `https://${productionUrl.replace(/^https?:\/\//, "")}` : null;

  useEffect(() => {
    const host = window.location.hostname;
    setOrigin(window.location.origin);
    const internal =
      host.endsWith(".vercel.app") &&
      (productionUrl ? host !== productionUrl.replace(/^https?:\/\//, "") : /-[a-z0-9]{6,}-/.test(host) || /-git-/.test(host));
    setIsInternal(internal);
  }, [productionUrl]);

  const copy = async (text: string, kind: "link" | "steps") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const stepsText = [
    "Fluentia — abrir sem pedir email da Vercel",
    `Link público: ${publicLink ?? "Vercel → Settings → Domains (domínio de produção)"}`,
    "Não partilhar links com hash (ex.: projeto-4vczje32k-utilizador.vercel.app)",
    "Settings → Deployment Protection → Vercel Authentication: Standard Protection ou Disabled",
    "Password Protection: desligado · Team Settings também (se for equipa)",
  ].join("\n");

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">“A Vercel pede o meu email” → link certo</h2>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
            O pedido de login vem da <strong>Deployment Protection</strong> da Vercel quando se abre o URL
            interno de um deployment. O domínio de produção fica público.
          </p>
        </div>
        <button type="button" onClick={() => void copy(stepsText, "steps")} className="btn-ghost">
          {copied === "steps" ? "Copiado!" : "Copiar passos"}
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-forest/25 bg-forest p-4 text-[#e9f0e4]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lime/80">
          Link para partilhar (público)
        </p>
        {publicLink ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <a href={publicLink} className="break-all font-display text-xl text-lime underline-offset-4 hover:underline">
              {publicLink}
            </a>
            <button
              type="button"
              onClick={() => void copy(publicLink, "link")}
              className="rounded-full bg-lime px-3 py-1 text-[11px] font-bold text-forest-deep"
            >
              {copied === "link" ? "Copiado!" : "Copiar link"}
            </button>
          </div>
        ) : (
          <p className="mt-1.5 text-[12px] text-[#c8d8c4]">
            Vercel → teu projeto → <strong>Settings → Domains</strong> → o domínio marcado como «Production».
          </p>
        )}
      </div>

      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-paper-deep/60 p-3">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">Estás a abrir</dt>
          <dd className="mt-0.5 break-all text-xs font-semibold text-ink">{origin || "—"}</dd>
        </div>
        <div className="rounded-xl bg-paper-deep/60 p-3">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-ink-soft">Tipo de link</dt>
          <dd className={`mt-0.5 text-xs font-semibold ${isInternal ? "text-coral" : "text-forest"}`}>
            {isInternal ? "URL interno do deployment (pede login)" : "Domínio público ✓"}
          </dd>
        </div>
      </dl>

      {isInternal ? (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
          Este link pede login a quem não for da tua conta Vercel. {publicLink ? (
            <>
              Usa <a href={publicLink} className="font-semibold underline">{publicLink}</a>.
            </>
          ) : (
            "Usa o domínio em Settings → Domains."
          )}
        </p>
      ) : null}

      <ol className="mt-3 space-y-2">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-xl border border-sand/70 bg-white px-3 py-2.5">
            <p className="text-[12px] font-semibold text-ink">{step.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
