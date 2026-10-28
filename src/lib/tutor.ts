import { MODE_META, type Level, type Mode } from "@/lib/content";

export type CorrectionCategory =
  | "grammar"
  | "vocabulary"
  | "spelling"
  | "word-order"
  | "false-friend"
  | "register";

export type Correction = {
  id: string;
  original: string;
  correction: string;
  pt: string;
  es: string;
  category: CorrectionCategory;
};

export type TutorNote = { word: string; pt: string; es: string };

export type TutorReply = {
  content: string;
  translationPt: string;
  translationEs: string;
  corrections: Correction[];
  corrected: string;
  notes: TutorNote[];
  fluency: number;
  praise: "clean" | "few" | "several";
  source: "engine" | "ai";
};

type Rule = {
  id: string;
  category: CorrectionCategory;
  pattern: RegExp;
  captures: number;
  apply: (match: string, groups: string[]) => string;
  pt: string;
  es: string;
};

const UNCOUNTABLE: Record<string, string> = {
  informations: "information",
  advices: "advice",
  equipments: "equipment",
  furnitures: "furniture",
  feedbacks: "feedback",
  softwares: "software",
  staffs: "staff",
  researches: "research",
  knowledges: "knowledge",
  luggages: "luggage",
  homeworks: "homework",
  peoples: "people",
};

const BASE_VERB: Record<string, string> = {
  went: "go",
  saw: "see",
  had: "have",
  did: "do",
  made: "make",
  took: "take",
  got: "get",
  said: "say",
  knew: "know",
  thought: "think",
  came: "come",
  gave: "give",
  found: "find",
  told: "tell",
  worked: "work",
  liked: "like",
  spoke: "speak",
  wrote: "write",
  bought: "buy",
  met: "meet",
};

const THIRD_PERSON: Record<string, string> = {
  go: "goes",
  do: "does",
  say: "says",
  try: "tries",
  watch: "watches",
  finish: "finishes",
};

const CONTRACTION_FIX: Record<string, string> = {
  dont: "don't",
  doesnt: "doesn't",
  didnt: "didn't",
  cant: "can't",
  wont: "won't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
  couldnt: "couldn't",
  wouldnt: "wouldn't",
  shouldnt: "shouldn't",
  havent: "haven't",
  hasnt: "hasn't",
  im: "I'm",
  ive: "I've",
  youre: "you're",
  theyre: "they're",
  thats: "that's",
  whats: "what's",
  lets: "let's",
};

const vowelStart = (word: string) => /^[aeiou]/i.test(word.trim());

const RULES: Rule[] = [
  {
    id: "capital-i",
    category: "spelling",
    pattern: /\bi\b/g,
    captures: 0,
    apply: () => "I",
    pt: "O pronome «I» escreve-se sempre com maiúscula em inglês.",
    es: "El pronombre «I» siempre se escribe con mayúscula en inglés.",
  },
  {
    id: "contraction-apostrophe",
    category: "spelling",
    pattern: /\b(dont|doesnt|didnt|cant|wont|isnt|arent|wasnt|werent|couldnt|wouldnt|shouldnt|havent|hasnt|im|ive|youre|theyre|thats|whats|lets)\b/gi,
    captures: 1,
    apply: (_m, g) => CONTRACTION_FIX[g[0].toLowerCase()] ?? g[0],
    pt: "As contrações levam apóstrofo: don't, doesn't, I'm, can't.",
    es: "Las contracciones llevan apóstrofo: don't, doesn't, I'm, can't.",
  },
  {
    id: "am-agree",
    category: "grammar",
    pattern: /\bi(?:'m| am)\s+agree\b/gi,
    captures: 0,
    apply: () => "I agree",
    pt: "«Agree» é um verbo: diz-se «I agree» e não «I am agree».",
    es: "«Agree» es un verbo: se dice «I agree», no «I am agree».",
  },
  {
    id: "have-years",
    category: "grammar",
    pattern: /\bi\s+have\s+(\d{1,2})\s+years?(?:\s+old)?\b/gi,
    captures: 1,
    apply: (_m, g) => `I'm ${g[0]} years old`,
    pt: "A idade usa o verbo «to be»: I am 30 years old (e nunca «I have 30 years»).",
    es: "La edad usa el verbo «to be»: I am 30 years old (nunca «I have 30 years»).",
  },
  {
    id: "third-dont",
    category: "grammar",
    pattern: /\b(he|she|it)\s+don't\b/gi,
    captures: 1,
    apply: (_m, g) => `${g[0]} doesn't`,
    pt: "Na 3.ª pessoa do singular usamos «doesn't»: he doesn't work.",
    es: "En la 3.ª persona del singular usamos «doesn't»: he doesn't work.",
  },
  {
    id: "third-have",
    category: "grammar",
    pattern: /\b(he|she|it)\s+have\b/gi,
    captures: 1,
    apply: (_m, g) => `${g[0]} has`,
    pt: "Na 3.ª pessoa do singular «have» passa a «has».",
    es: "En la 3.ª persona del singular «have» pasa a «has».",
  },
  {
    id: "third-verb",
    category: "grammar",
    pattern:
      /\b(he|she|it)\s+(go|do|say|make|take|come|want|need|think|know|like|work|live|look|feel|try|use|get)\b/gi,
    captures: 2,
    apply: (_m, g) => `${g[0]} ${THIRD_PERSON[g[1].toLowerCase()] ?? `${g[1]}s`}`,
    pt: "Na 3.ª pessoa do singular o verbo leva -s: he works, she goes.",
    es: "En la 3.ª persona del singular el verbo lleva -s: he works, she goes.",
  },
  {
    id: "did-base",
    category: "grammar",
    pattern:
      /\b(don't|doesn't|didn't)\s+(went|saw|had|did|made|took|got|said|knew|thought|came|gave|found|told|worked|liked|spoke|wrote|bought|met)\b/gi,
    captures: 2,
    apply: (_m, g) => `${g[0]} ${BASE_VERB[g[1].toLowerCase()] ?? g[1]}`,
    pt: "Depois de «didn't» usa-se o infinitivo sem «to»: I didn't go.",
    es: "Después de «didn't» se usa el infinitivo sin «to»: I didn't go.",
  },
  {
    id: "uncountable",
    category: "vocabulary",
    pattern:
      /\b(informations|advices|equipments|furnitures|feedbacks|softwares|staffs|researches|knowledges|luggages|homeworks|peoples)\b/gi,
    captures: 1,
    apply: (_m, g) => UNCOUNTABLE[g[0].toLowerCase()] ?? g[0],
    pt: "Esta palavra é incontável em inglês: fica no singular e não leva «a/an».",
    es: "Esta palabra es incontable en inglés: va en singular y no lleva «a/an».",
  },
  {
    id: "people-verb",
    category: "grammar",
    pattern: /\bpeople\s+(is|was)\b/gi,
    captures: 1,
    apply: (_m, g) => `people ${g[0].toLowerCase() === "is" ? "are" : "were"}`,
    pt: "«People» é plural: people are / people were.",
    es: "«People» es plural: people are / people were.",
  },
  {
    id: "double-comparative",
    category: "grammar",
    pattern: /\bmore\s+(better|worse|easier|bigger|faster|cheaper|simpler)\b/gi,
    captures: 1,
    apply: (_m, g) => g[0],
    pt: "«Better» já é comparativo: não precisa de «more».",
    es: "«Better» ya es comparativo: no necesita «more».",
  },
  {
    id: "double-superlative",
    category: "grammar",
    pattern: /\bmost\s+(easiest|best|worst|biggest|fastest|cheapest)\b/gi,
    captures: 1,
    apply: (_m, g) => g[0],
    pt: "«Easiest» já é superlativo: não precisa de «most».",
    es: "«Easiest» ya es superlativo: no necesita «most».",
  },
  {
    id: "bored-boring",
    category: "vocabulary",
    pattern: /\bi(?:'m| am)\s+boring\b/gi,
    captures: 0,
    apply: () => "I'm bored",
    pt: "«Boring» descreve a coisa aborrecida; «bored» descreve como te sentes.",
    es: "«Boring» describe la cosa aburrida; «bored» describe cómo te sientes.",
  },
  {
    id: "explain-to",
    category: "grammar",
    pattern: /\bexplain\s+me\b/gi,
    captures: 0,
    apply: () => "explain to me",
    pt: "«Explain» pede «to» antes da pessoa: explain it to me.",
    es: "«Explain» pide «to» antes de la persona: explain it to me.",
  },
  {
    id: "depend-of",
    category: "grammar",
    pattern: /\bdepend(s|ed|ing)?\s+of\b/gi,
    captures: 1,
    apply: (_m, g) => `depend${g[0] ?? ""} on`,
    pt: "«Depend» usa «on», nunca «of».",
    es: "«Depend» usa «on», nunca «of».",
  },
  {
    id: "will-can",
    category: "grammar",
    pattern: /\b(?:i\s+will|i'll)\s+can\b/gi,
    captures: 0,
    apply: () => "I'll be able to",
    pt: "Dois modais não se juntam: «I'll be able to» em vez de «I'll can».",
    es: "Dos modales no se juntan: «I'll be able to» en vez de «I'll can».",
  },
  {
    id: "can-able",
    category: "grammar",
    pattern: /\bcan\s+(?:be\s+)?able\s+to\b/gi,
    captures: 0,
    apply: () => "can",
    pt: "«Can» já significa «ser capaz»: não precisa de «able to».",
    es: "«Can» ya significa «ser capaz»: no necesita «able to».",
  },
  {
    id: "since-period",
    category: "grammar",
    pattern: /\bsince\s+(\d+|three|four|five|six|seven|eight|nine|ten|two|one|a|an)\s+(years?|months?|weeks?|days?)\b/gi,
    captures: 2,
    apply: (_m, g) => `for ${g[0]} ${g[1]}`,
    pt: "Com um período de tempo usa «for»: for three years. «Since» pede um ponto no tempo (since 2020).",
    es: "Con un periodo usa «for»: for three years. «Since» pide un punto en el tiempo (since 2020).",
  },
  {
    id: "for-ago",
    category: "grammar",
    pattern: /\bfor\s+(\d+|three|two|five)\s+(years?|months?|days?)\s+ago\b/gi,
    captures: 2,
    apply: (_m, g) => `${g[0]} ${g[1]} ago`,
    pt: "«Ago» já marca o passado: three years ago, sem «for».",
    es: "«Ago» ya marca el pasado: three years ago, sin «for».",
  },
  {
    id: "have-been-working",
    category: "grammar",
    pattern: /\b(?:i\s+am|i'm|i)\s+working\s+here\s+for\b/gi,
    captures: 0,
    apply: () => "I've been working here for",
    pt: "Ação que começou no passado e continua: present perfect continuous — I've been working here for two years.",
    es: "Acción que empezó en el pasado y continúa: present perfect continuous — I've been working here for two years.",
  },
  {
    id: "how-long-time",
    category: "grammar",
    pattern: /\bhow\s+long\s+time\b/gi,
    captures: 0,
    apply: () => "how long",
    pt: "Pergunta-se «how long», sem «time».",
    es: "Se pregunta «how long», sin «time».",
  },
  {
    id: "make-question",
    category: "vocabulary",
    pattern: /\bmake\s+a\s+question\b/gi,
    captures: 0,
    apply: () => "ask a question",
    pt: "Em inglês «ask a question» (fazer uma pergunta), não «make a question».",
    es: "En inglés «ask a question» (hacer una pregunta), no «make a question».",
  },
  {
    id: "have-doubt",
    category: "false-friend",
    pattern: /\bi\s+have\s+(?:a|one)\s+doubt\b/gi,
    captures: 0,
    apply: () => "I have a question",
    pt: "«Doubt» é desconfiança. Para «tenho uma dúvida» diz «I have a question».",
    es: "«Doubt» es desconfianza. Para «tengo una duda» di «I have a question».",
  },
  {
    id: "go-to-home",
    category: "grammar",
    pattern: /\b(?:going|go|went|get|getting|drive|walk)\s+to\s+home\b/gi,
    captures: 0,
    apply: (match) => match.replace(/\s+to\s+home$/i, " home"),
    pt: "Não se usa «to» antes de «home»: I'm going home.",
    es: "No se usa «to» antes de «home»: I'm going home.",
  },
  {
    id: "on-the-internet",
    category: "grammar",
    pattern: /\bin\s+the\s+internet\b/gi,
    captures: 0,
    apply: () => "on the internet",
    pt: "Diz-se «on the internet».",
    es: "Se dice «on the internet».",
  },
  {
    id: "on-foot",
    category: "grammar",
    pattern: /\bby\s+foot\b/gi,
    captures: 0,
    apply: () => "on foot",
    pt: "Diz-se «on foot» (a pé).",
    es: "Se dice «on foot» (a pie).",
  },
  {
    id: "in-the-weekday",
    category: "grammar",
    pattern: /\bin\s+the\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    captures: 1,
    apply: (_m, g) => `on ${g[0]}`,
    pt: "Com dias da semana usa-se «on»: on Monday.",
    es: "Con días de la semana se usa «on»: on Monday.",
  },
  {
    id: "in-the-weekend",
    category: "grammar",
    pattern: /\bin\s+the\s+weekend\b/gi,
    captures: 0,
    apply: () => "at the weekend",
    pt: "Em inglês britânico diz-se «at the weekend».",
    es: "En inglés británico se dice «at the weekend».",
  },
  {
    id: "most-part",
    category: "grammar",
    pattern: /\bthe\s+most\s+part\s+of\b/gi,
    captures: 0,
    apply: () => "most of",
    pt: "Basta «most of the people» — não é preciso «the most part of».",
    es: "Basta «most of the people» — no hace falta «the most part of».",
  },
  {
    id: "profession-article",
    category: "grammar",
    pattern:
      /\b(?:i\s+am|i'm)\s+(?:a|an)?\s*(engineer|developer|teacher|student|doctor|nurse|designer|manager|accountant|lawyer|consultant|programmer|architect)\b/gi,
    captures: 1,
    apply: (_m, g) => `I'm ${vowelStart(g[0]) ? "an" : "a"} ${g[0]}`,
    pt: "Profissões em inglês levam artigo: I'm a developer / I'm an engineer.",
    es: "Las profesiones en inglés llevan artículo: I'm a developer / I'm an engineer.",
  },
  {
    id: "if-would",
    category: "grammar",
    pattern: /\bif\s+(i|you|he|she|we|they)\s+would\s+have\b/gi,
    captures: 1,
    apply: (_m, g) => `if ${g[0]} had`,
    pt: "Nas condicionais, «if» não leva «would»: If I had known...",
    es: "En las condicionales, «if» no lleva «would»: If I had known...",
  },
  {
    id: "cannot",
    category: "spelling",
    pattern: /\bcan\s+not\b/gi,
    captures: 0,
    apply: () => "cannot",
    pt: "«Cannot» escreve-se numa só palavra (ou «can't»).",
    es: "«Cannot» se escribe en una sola palabra (o «can't»).",
  },
  {
    id: "very-much-like",
    category: "word-order",
    pattern: /\bi\s+like\s+very\s+much\b/gi,
    captures: 0,
    apply: () => "I really like it",
    pt: "A ordem natural é «I really like it» ou «I like it a lot».",
    es: "El orden natural es «I really like it» o «I like it a lot».",
  },
  {
    id: "i-very-verb",
    category: "word-order",
    pattern: /\bi\s+very\s+(like|love|want|need|enjoy)\b/gi,
    captures: 1,
    apply: (_m, g) => `I really ${g[0].toLowerCase()}`,
    pt: "«Very» não acompanha verbos. Diz «I really like» ou «I like it a lot».",
    es: "«Very» no acompaña verbos. Di «I really like» o «I like it a lot».",
  },
  {
    id: "finish-to",
    category: "grammar",
    pattern: /\bfinish(ed)?\s+to\s+(\w+)\b/gi,
    captures: 2,
    apply: (_m, g) => `finish${g[0] ?? ""} ${g[1]}`,
    pt: "Depois de «finish» usa-se o gerúndio: I finished working.",
    es: "Después de «finish» se usa el gerundio: I finished working.",
  },
];

const NOTES: { pattern: RegExp; word: string; pt: string; es: string }[] = [
  {
    pattern: /\bactually\b/i,
    word: "actually",
    pt: "«Actually» = na verdade. Para «atualmente» usa «currently» ou «nowadays».",
    es: "«Actually» = en realidad. Para «actualmente» usa «currently» o «nowadays».",
  },
  {
    pattern: /\bpretend\b/i,
    word: "pretend",
    pt: "«Pretend» = fingir. Para «pretender» usa «intend» ou «plan».",
    es: "«Pretend» = fingir. Para «pretender» usa «intend» o «plan».",
  },
  {
    pattern: /\bsensible\b/i,
    word: "sensible",
    pt: "«Sensible» = sensato. «Sensível» é «sensitive».",
    es: "«Sensible» = sensato. «Sensible» (emoción) es «sensitive».",
  },
  {
    pattern: /\bassist\b/i,
    word: "assist",
    pt: "«Assist» = ajudar. Para «assistir a» usa «attend» ou «watch».",
    es: "«Assist» = ayudar. Para «asistir a» usa «attend» o «watch».",
  },
  {
    pattern: /\bparents\b/i,
    word: "parents",
    pt: "«Parents» = pais (progenitores). «Parentes» = relatives.",
    es: "«Parents» = padres (progenitores). «Parientes» = relatives.",
  },
  {
    pattern: /\bcollege\b/i,
    word: "college",
    pt: "«College» = ensino superior. «Colégio» (escola) é «school».",
    es: "«College» = universidad. «Colegio» es «school».",
  },
];

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

function applyRules(text: string): { corrected: string; corrections: Correction[] } {
  let working = text;
  const corrections: Correction[] = [];

  const push = (rule: Rule, original: string, correction: string) => {
    if (!rule.pt) return;
    const key = `${rule.id}:${original.toLowerCase()}`;
    if (corrections.some((c) => c.id === key)) return;
    corrections.push({
      id: key,
      original,
      correction,
      pt: rule.pt,
      es: rule.es,
      category: rule.category,
    });
  };

  for (const rule of RULES) {
    const baseFlags = rule.pattern.flags.replace(/g/g, "");
    const regex = new RegExp(rule.pattern.source, `${baseFlags}g`);
    working = working.replace(regex, (match: string, ...rest: unknown[]) => {
      const groups = rest
        .slice(0, rule.captures)
        .map((value) => (typeof value === "string" ? value : ""));
      const replacement = rule.apply(match, groups);
      if (!replacement || replacement === match) return match;
      push(rule, match, replacement);
      return replacement;
    });
  }

  working = working.replace(/([.!?]\s+)([a-z])/g, (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);

  if (working && /^[a-z]/.test(working)) {
    const fixed = working.charAt(0).toUpperCase() + working.slice(1);
    const firstWord = working.split(/\s/)[0];
    corrections.push({
      id: "capitalize-first",
      original: firstWord,
      correction: firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
      pt: "Começa as frases com letra maiúscula em inglês.",
      es: "Empieza las frases con mayúscula en inglés.",
      category: "spelling",
    });
    working = fixed;
  }

  return { corrected: working.trim(), corrections };
}

export function analyseMessage(message: string): {
  corrected: string;
  corrections: Correction[];
  notes: TutorNote[];
  fluency: number;
  praise: TutorReply["praise"];
} {
  const { corrected, corrections } = applyRules(message.trim());
  const notes = NOTES.filter((note) => note.pattern.test(message)).map(({ word, pt, es }) => ({
    word,
    pt,
    es,
  }));
  const words = tokenize(message).length;
  const fluency = words === 0 ? 0 : Math.max(15, Math.min(100, 58 + Math.min(words, 22) * 1.6 - corrections.length * 8));
  const praise = corrections.length === 0 ? "clean" : corrections.length <= 2 ? "few" : "several";
  return { corrected, corrections, notes, fluency: Math.round(fluency), praise };
}

export function localReply(mode: Mode, turnIndex: number, message: string): {
  content: string;
  translationPt: string;
  translationEs: string;
} {
  const bank = MODE_META[mode].replies;
  const entry = bank[turnIndex % bank.length];
  const opener = MODE_META[mode].openers[turnIndex % MODE_META[mode].openers.length];
  const chosen = turnIndex === 0 ? opener : entry;

  if (tokenize(message).length <= 2 && turnIndex > 0) {
    return {
      content: "No problem — take your time. Could you give me one full sentence about it?",
      translationPt: "Sem problema — leva o teu tempo. Podes dar-me uma frase completa sobre isso?",
      translationEs: "Sin problema, tómate tu tiempo. ¿Puedes darme una frase completa sobre eso?",
    };
  }

  return { content: chosen.en, translationPt: chosen.pt, translationEs: chosen.es };
}

export function estimateLevel(samples: { fluency: number; words: number; errors: number }[]): Level {
  if (samples.length === 0) return "A2";
  const totalWords = samples.reduce((sum, sample) => sum + sample.words, 0);
  const totalErrors = samples.reduce((sum, sample) => sum + sample.errors, 0);
  const avgWords = totalWords / samples.length;
  const errorRate = totalErrors / Math.max(samples.length, 1);
  if (avgWords >= 16 && errorRate <= 0.6) return "C1";
  if (avgWords >= 11 && errorRate <= 1.4) return "B2";
  if (avgWords >= 6) return "B1";
  return "A2";
}

type AiPayload = {
  content?: unknown;
  translationPt?: unknown;
  translationEs?: unknown;
  corrections?: unknown;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function callOpenAI(input: {
  mode: Mode;
  level: Level;
  message: string;
  history: { role: string; content: string }[];
}): Promise<TutorReply | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const system = [
    "You are Fluentia, a warm English conversation tutor for European Portuguese speakers who also understand Spanish.",
    `Practice mode: ${MODE_META[input.mode].name.en}. Learner CEFR level: ${input.level}.`,
    "Always answer in natural English, 2-4 sentences, and end with exactly one question.",
    "Correct the learner's English gently and specifically.",
    'Reply ONLY with JSON: {"content": string, "translationPt": string, "translationEs": string, "corrections": [{"original": string, "correction": string, "pt": string, "es": string, "category": "grammar"|"vocabulary"|"spelling"|"word-order"|"false-friend"|"register"}]}',
    "translations must translate your English reply into European Portuguese and Spanish. Keep corrections to the three most important.",
  ].join(" ");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          ...input.history.slice(-8).map((item) => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: item.content,
          })),
          { role: "user", content: input.message },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const raw = data as { choices?: { message?: { content?: unknown } }[] };
    const content = asString(raw.choices?.[0]?.message?.content);
    if (!content) return null;
    const parsed = JSON.parse(content) as AiPayload;
    const analysis = analyseMessage(input.message);
    const aiCorrections: Correction[] = Array.isArray(parsed.corrections)
      ? parsed.corrections.flatMap((item, index) => {
          const entry = item as Record<string, unknown>;
          const original = asString(entry.original);
          const correction = asString(entry.correction);
          if (!original || !correction) return [];
          return [
            {
              id: `ai-${index}-${original.toLowerCase()}`,
              original,
              correction,
              pt: asString(entry.pt, "Correção do tutor."),
              es: asString(entry.es, "Corrección del tutor."),
              category: (asString(entry.category, "grammar") as CorrectionCategory) ?? "grammar",
            },
          ];
        })
      : analysis.corrections;

    return {
      content: asString(parsed.content, analysis.corrected),
      translationPt: asString(parsed.translationPt),
      translationEs: asString(parsed.translationEs),
      corrections: aiCorrections.length > 0 ? aiCorrections : analysis.corrections,
      corrected: analysis.corrected,
      notes: analysis.notes,
      fluency: analysis.fluency,
      praise: analysis.praise,
      source: "ai",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateTutorReply(input: {
  mode: Mode;
  level: Level;
  message: string;
  turnIndex: number;
  history: { role: string; content: string }[];
}): Promise<TutorReply> {
  const analysis = analyseMessage(input.message);
  const ai = await callOpenAI(input);
  if (ai) return ai;

  const local = localReply(input.mode, input.turnIndex, input.message);
  return {
    ...local,
    corrections: analysis.corrections,
    corrected: analysis.corrected,
    notes: analysis.notes,
    fluency: analysis.fluency,
    praise: analysis.praise,
    source: "engine",
  };
}

export function coachingLeadIn(
  corrections: Correction[],
  praise: TutorReply["praise"],
): { content: string; translationPt: string; translationEs: string } | null {
  if (praise === "clean") {
    return {
      content: "No mistakes in that sentence — nicely done.",
      translationPt: "Sem erros nessa frase — muito bem.",
      translationEs: "Sin errores en esa frase, muy bien.",
    };
  }
  const priority: Record<CorrectionCategory, number> = {
    "false-friend": 1,
    grammar: 2,
    "word-order": 3,
    vocabulary: 4,
    register: 5,
    spelling: 6,
  };
  const first = [...corrections]
    .filter((correction) => correction.original.trim().length > 1)
    .sort((a, b) => (priority[a.category] ?? 9) - (priority[b.category] ?? 9))[0];
  if (!first) return null;
  return {
    content: `Quick fix: “${first.correction.trim()}” instead of “${first.original.trim()}”.`,
    translationPt: `Correção rápida: «${first.correction.trim()}» em vez de «${first.original.trim()}».`,
    translationEs: `Corrección rápida: «${first.correction.trim()}» en lugar de «${first.original.trim()}».`,
  };
}

export function openingMessage(mode: Mode, level: Level): {
  content: string;
  translationPt: string;
  translationEs: string;
} {
  const meta = MODE_META[mode];
  const base = meta.openers[0];
  const levelTip: Record<Level, string> = {
    A2: " Short, simple answers are perfect — I'll help with the rest.",
    B1: " Try to use a full sentence and one connector (because, although, so).",
    B2: " Push yourself: add a detail and a comparison in your answer.",
    C1: " Feel free to be idiomatic — I'll flag anything that sounds unnatural.",
  };
  return {
    content: `${base.en}${levelTip[level]}`,
    translationPt: base.pt,
    translationEs: base.es,
  };
}
