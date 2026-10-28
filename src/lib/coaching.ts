import type { FocusKey, Tri } from "@/lib/content";
import { splitSyllables } from "@/lib/speech";
import type { PronunciationScore } from "@/lib/scoring";

export type WordFocus = {
  word: string;
  syllables: string;
  focus: FocusKey | null;
  hardSound: string;
};

const FOCUS_RULES: { focus: FocusKey; test: RegExp }[] = [
  { focus: "th", test: /th/i },
  { focus: "vw", test: /[vw]/i },
  { focus: "ed", test: /ed$/i },
  { focus: "clusters", test: /(str|spr|scr|spl|sks|sps|nds|sts|cts|nth)/i },
  { focus: "rl", test: /[rl]/i },
  { focus: "longVowels", test: /(ee|ea|oo|ou|oa|igh|ai)/i },
  { focus: "contractions", test: /'/ },
  { focus: "stress", test: /^[a-z]{6,}$/i },
];

const SOUND_HINTS: Record<FocusKey, Tri> = {
  th: {
    pt: "Língua entre os dentes, ar a sair: «thhh». Sem tocar no céu da boca.",
    es: "Lengua entre los dientes, sale aire: «thhh». Sin tocar el paladar.",
    en: "Tongue between the teeth, air flowing: “thhh”. Don't touch the roof of your mouth.",
  },
  vw: {
    pt: "«V»: lábio de baixo nos dentes. «W»: lábios redondos, sem tocar.",
    es: "«V»: labio inferior en los dientes. «W»: labios redondos, sin tocar.",
    en: "“V”: bottom lip on the teeth. “W”: rounded lips, no contact.",
  },
  ed: {
    pt: "Terminação -ed: /t/ depois de som surdo, /d/ depois de som sonoro.",
    es: "Terminación -ed: /t/ tras sonido sordo, /d/ tras sonido sonoro.",
    en: "-ed: /t/ after a voiceless sound, /d/ after a voiced one.",
  },
  longVowels: {
    pt: "Alonga a vogal e mantém a boca estável até ao fim.",
    es: "Alarga la vocal y mantén la boca estable hasta el final.",
    en: "Stretch the vowel and keep your mouth steady to the end.",
  },
  stress: {
    pt: "Bate forte numa sílaba e encurta as outras: não digas todas iguais.",
    es: "Golpea fuerte una sílaba y acorta las demás: no las digas todas igual.",
    en: "Hit one syllable hard and shorten the rest — don't flatten them.",
  },
  clusters: {
    pt: "Junta as consoantes sem vogal no meio: «str», «sks».",
    es: "Une las consonantes sin vocal intermedia: «str», «sks».",
    en: "Glue the consonants with no vowel in between: “str”, “sks”.",
  },
  linking: {
    pt: "Liga a palavra seguinte: «an_apple» soa «a-napple».",
    es: "Une la palabra siguiente: «an_apple» suena «a-napple».",
    en: "Link the next word: “an_apple” sounds like “a-napple”.",
  },
  rl: {
    pt: "«R» não toca em nada; «L» final toca atrás dos dentes.",
    es: "«R» no toca nada; «L» final toca detrás de los dientes.",
    en: "“R” touches nothing; final “L” touches behind the teeth.",
  },
  contractions: {
    pt: "Contrai e apaga a vogal: «I'm», «we'll», «don't».",
    es: "Contrae y apaga la vocal: «I'm», «we'll», «don't».",
    en: "Contract and weaken the vowel: “I'm”, “we'll”, “don't”.",
  },
};

const DEFAULT_HINT: Tri = {
  pt: "Ouve o modelo, repete devagar e só depois aumenta a velocidade.",
  es: "Escucha el modelo, repite despacio y luego sube la velocidad.",
  en: "Listen to the model, repeat slowly, then speed up.",
};

export function wordFocus(word: string, ui: "pt" | "es" | "en"): WordFocus {
  const clean = word.replace(/[^A-Za-z']/g, "");
  const focus = FOCUS_RULES.find((rule) => rule.test.test(clean))?.focus ?? null;
  const syllables = splitSyllables(clean).join(" · ") || clean;
  const hint = focus ? SOUND_HINTS[focus][ui] : DEFAULT_HINT[ui];
  return { word: clean, syllables, focus, hardSound: hint };
}

export type CoachTier = "great" | "close" | "work";

export type CoachPlan = {
  tier: CoachTier;
  headline: Tri;
  steps: Tri[];
  focusWords: WordFocus[];
  repeatTarget: number;
  mastered: boolean;
};

export function buildCoachPlan(
  score: PronunciationScore,
  ui: "pt" | "es" | "en",
  attemptNumber = 1,
): CoachPlan {
  const missed = score.words.filter((word) => !word.match);
  const focusWords = missed.slice(0, 4).map((word) => wordFocus(word.target, ui));
  const tier: CoachTier = score.score >= 85 ? "great" : score.score >= 62 ? "close" : "work";

  const headline: Tri =
    tier === "great"
      ? {
          pt: "Boa dicção! Passa para a frase seguinte e mantém este ritmo.",
          es: "¡Buena dicción! Pasa a la frase siguiente y mantén este ritmo.",
          en: "Great diction! Move to the next sentence and keep this rhythm.",
        }
      : tier === "close"
        ? {
            pt: "Estás perto. Limpa as palavras em destaque e repete a frase completa.",
            es: "Estás cerca. Limpia las palabras destacadas y repite la frase completa.",
            en: "Almost there. Clean up the highlighted words and repeat the full sentence.",
          }
        : {
            pt: "Vamos devagar: ouve o modelo lento, repete por sílabas e só depois a frase inteira.",
            es: "Vamos despacio: escucha el modelo lento, repite por sílabas y luego la frase entera.",
            en: "Let's slow down: hear the slow model, repeat syllable by syllable, then the whole sentence.",
          };

  const steps: Tri[] =
    tier === "great"
      ? [
          {
            pt: "Repete a frase ao ritmo normal para consolidar.",
            es: "Repite la frase a ritmo normal para consolidar.",
            en: "Repeat at normal speed to consolidate.",
          },
          {
            pt: "Diz a mesma frase em tom de pergunta — entoação diferente, mesmas palavras.",
            es: "Di la misma frase como pregunta: otra entonación, mismas palabras.",
            en: "Say the same sentence as a question — different intonation, same words.",
          },
        ]
      : tier === "close"
        ? [
            {
              pt: "Ouve cada palavra destacada em modo lento e repete-a 3 vezes.",
              es: "Escucha cada palabra destacada en modo lento y repítela 3 veces.",
              en: "Hear each highlighted word slowly and repeat it 3 times.",
            },
            {
              pt: "Diz a frase inteira sem pressa, com uma pausa a meio.",
              es: "Di la frase completa sin prisa, con una pausa en medio.",
              en: "Say the full sentence unhurried, with a pause in the middle.",
            },
          ]
        : [
            {
              pt: "Ouve a frase a 0,6× e acompanha com os lábios, sem falar.",
              es: "Escucha la frase a 0,6× y acompaña con los labios, sin hablar.",
              en: "Listen at 0.6× and mouth the words silently.",
            },
            {
              pt: "Repete sílaba a sílaba a palavra em destaque e depois junta tudo.",
              es: "Repite sílaba a sílaba la palabra destacada y luego únela.",
              en: "Repeat the highlighted word syllable by syllable, then join it.",
            },
            {
              pt: "Grava outra vez, mais devagar: dicção vale mais do que velocidade.",
              es: "Graba otra vez más despacio: la dicción vale más que la velocidad.",
              en: "Record again, slower: diction beats speed.",
            },
          ];

  if (attemptNumber >= 3 && tier !== "great") {
    steps.push({
      pt: "Já tentaste três vezes: muda de frase e volta a esta mais tarde — o ouvido consolida em pausas.",
      es: "Ya lo intentaste tres veces: cambia de frase y vuelve a esta más tarde; el oído consolida en las pausas.",
      en: "Three attempts done: change sentence and come back later — ears consolidate during breaks.",
    });
  }

  return {
    tier,
    headline,
    steps,
    focusWords,
    repeatTarget: tier === "great" ? 1 : 2,
    mastered: score.score >= 85,
  };
}

export const SPEECH_HINT = {
  pt: {
    unsupported: "Este navegador não tem voz instalada. No Android, ativa «Texto para voz» nas definições do sistema.",
    blocked: "O áudio foi bloqueado. Toca outra vez no botão Ouvir (o telemóvel exige um toque).",
    speaking: "A falar…",
  },
  es: {
    unsupported: "Este navegador no tiene voz instalada. En Android, activa «Texto a voz» en los ajustes del sistema.",
    blocked: "El audio se ha bloqueado. Toca otra vez el botón Escuchar (el móvil exige un toque).",
    speaking: "Hablando…",
  },
  en: {
    unsupported: "This browser has no installed voice. On Android, enable “Text-to-speech” in system settings.",
    blocked: "Audio was blocked. Tap Listen again (mobile requires a tap).",
    speaking: "Speaking…",
  },
} as const;
