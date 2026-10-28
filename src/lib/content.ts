export const MODES = ["daily", "work", "social", "technical"] as const;
export type Mode = (typeof MODES)[number];

export const LEVELS = ["A2", "B1", "B2", "C1"] as const;
export type Level = (typeof LEVELS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type UiLang = "pt-PT" | "es" | "en";
export type Tri = { pt: string; es: string; en: string };

export type FocusKey =
  | "th"
  | "vw"
  | "ed"
  | "longVowels"
  | "stress"
  | "clusters"
  | "linking"
  | "rl"
  | "contractions";

export type PronunciationChallenge = {
  id: string;
  mode: Mode;
  difficulty: Difficulty;
  text: string;
  translation: { pt: string; es: string };
  focus: FocusKey[];
};

export type ModeMeta = {
  emoji: string;
  gradient: string;
  chip: string;
  name: Tri;
  description: Tri;
  openers: Tri[];
  replies: Tri[];
  starters: Tri[];
  hints: Tri[];
};

export const MODE_META: Record<Mode, ModeMeta> = {
  daily: {
    emoji: "☕",
    gradient: "from-[#0E4A3C] to-[#2E7D5B]",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    name: { pt: "Dia a dia", es: "Día a día", en: "Everyday life" },
    description: {
      pt: "Pequeno-almoço, transportes, compras e rotinas em inglês real.",
      es: "Desayuno, transporte, compras y rutinas en inglés real.",
      en: "Breakfast, transport, shopping and routines in real English.",
    },
    openers: [
      {
        en: "Hey, good to see you! Let's warm up: what did you have for breakfast this morning?",
        pt: "Olá, que bom ver-te! Vamos aquecer: o que comeste ao pequeno-almoço esta manhã?",
        es: "¡Hola, qué bueno verte! Vamos a calentar: ¿qué desayunaste esta mañana?",
      },
      {
        en: "Let's talk about your day. What is the first thing you usually do when you wake up?",
        pt: "Vamos falar do teu dia. Qual é a primeira coisa que costumas fazer quando acordas?",
        es: "Hablemos de tu día. ¿Qué es lo primero que sueles hacer al despertar?",
      },
    ],
    replies: [
      {
        en: "That sounds like a solid start to the day. Is your routine the same at the weekend, or does it change completely?",
        pt: "Parece um bom começo de dia. A tua rotina é igual ao fim de semana ou muda completamente?",
        es: "Suena a un buen comienzo del día. ¿Tu rutina es igual el fin de semana o cambia por completo?",
      },
      {
        en: "Nice — I can picture that. What is the most annoying part of your commute, and how do you deal with it?",
        pt: "Boa — consigo imaginar. Qual é a parte mais chata do teu percurso e como lidas com isso?",
        es: "Bien, me lo imagino. ¿Cuál es la parte más molesta de tu trayecto y cómo lo llevas?",
      },
      {
        en: "Interesting! If you could change one thing about your neighbourhood, what would it be?",
        pt: "Interessante! Se pudesses mudar uma coisa no teu bairro, o que seria?",
        es: "¡Interesante! Si pudieras cambiar una cosa de tu barrio, ¿cuál sería?",
      },
      {
        en: "Got it. Tell me more about that — how often does it happen, and does it bother you?",
        pt: "Entendido. Conta-me mais sobre isso — acontece com que frequência e incomoda-te?",
        es: "Entendido. Cuéntame más: ¿con qué frecuencia pasa y te molesta?",
      },
      {
        en: "I like the way you explained that. When you go shopping for food, do you plan ahead or decide in the shop?",
        pt: "Gosto da forma como explicaste isso. Quando vais às compras, planeias antes ou decides na loja?",
        es: "Me gusta cómo lo explicaste. Cuando haces la compra, ¿planificas antes o decides en la tienda?",
      },
      {
        en: "Fair enough! Imagine you had a free afternoon with no plans at all. What would you do?",
        pt: "Justo! Imagina que tinhas uma tarde livre sem planos. O que farias?",
        es: "¡Justo! Imagina que tuvieras una tarde libre sin planes. ¿Qué harías?",
      },
    ],
    starters: [
      {
        en: "I usually wake up at seven and have a quick breakfast.",
        pt: "Costumo acordar às sete e tomar um pequeno-almoço rápido.",
        es: "Suelo despertarme a las siete y desayunar algo rápido.",
      },
      {
        en: "My commute takes about forty minutes by bus.",
        pt: "O meu percurso leva cerca de quarenta minutos de autocarro.",
        es: "Mi trayecto dura unos cuarenta minutos en autobús.",
      },
      {
        en: "At the weekend I like to relax and meet my friends.",
        pt: "Ao fim de semana gosto de descansar e encontrar os meus amigos.",
        es: "El fin de semana me gusta descansar y ver a mis amigos.",
      },
    ],
    hints: [
      {
        en: "I'm used to ... / I can't stand ...",
        pt: "Estou habituado a... / Não suporto...",
        es: "Estoy acostumbrado a... / No soporto...",
      },
      {
        en: "It depends on the day, really.",
        pt: "Depende do dia, na verdade.",
        es: "Depende del día, la verdad.",
      },
      {
        en: "On my way home I usually ...",
        pt: "A caminho de casa costumo...",
        es: "De camino a casa suelo...",
      },
      {
        en: "That is pretty much what I do too.",
        pt: "É mais ou menos o que eu faço também.",
        es: "Es más o menos lo que hago yo también.",
      },
    ],
  },
  work: {
    emoji: "💼",
    gradient: "from-[#123C63] to-[#2B6CA3]",
    chip: "bg-sky-50 text-sky-800 border-sky-200",
    name: { pt: "Trabalho", es: "Trabajo", en: "At work" },
    description: {
      pt: "Reuniões, emails, colegas e as frases que salvam o dia no escritório.",
      es: "Reuniones, correos, colegas y las frases que salvan el día en la oficina.",
      en: "Meetings, emails, colleagues and the phrases that save your day.",
    },
    openers: [
      {
        en: "Welcome to the office chat. Tell me: what does a typical workday look like for you?",
        pt: "Bem-vindo à conversa de escritório. Diz-me: como é um dia de trabalho típico para ti?",
        es: "Bienvenido al chat de oficina. Dime: ¿cómo es un día de trabajo típico para ti?",
      },
      {
        en: "Imagine a colleague asks what you do. How would you describe your job in three sentences?",
        pt: "Imagina que um colega pergunta o que fazes. Como descreverias o teu trabalho em três frases?",
        es: "Imagina que un colega pregunta a qué te dedicas. ¿Cómo describirías tu trabajo en tres frases?",
      },
    ],
    replies: [
      {
        en: "Thanks for the update. Which part of that is the most demanding right now, and who supports you?",
        pt: "Obrigado pela atualização. Que parte disso é a mais exigente agora e quem te apoia?",
        es: "Gracias por la actualización. ¿Qué parte es la más exigente ahora y quién te apoya?",
      },
      {
        en: "Understood. If you had to explain that to a new colleague, what would you say first?",
        pt: "Entendido. Se tivesses de explicar isso a um colega novo, o que dirias primeiro?",
        es: "Entendido. Si tuvieras que explicárselo a un colega nuevo, ¿qué dirías primero?",
      },
      {
        en: "Good point. How do you usually follow up on that — by email, in a call, or in the weekly meeting?",
        pt: "Bom ponto. Como costumas fazer o seguimento — por email, numa chamada ou na reunião semanal?",
        es: "Buen punto. ¿Cómo haces normalmente el seguimiento: por correo, en una llamada o en la reunión semanal?",
      },
      {
        en: "That makes sense. What would you need from the team to move it forward this week?",
        pt: "Faz sentido. Do que precisarias da equipa para avançar com isso esta semana?",
        es: "Tiene sentido. ¿Qué necesitarías del equipo para avanzar esta semana?",
      },
      {
        en: "Nice. Could you give me a concrete example of a time when that worked well?",
        pt: "Muito bem. Podes dar-me um exemplo concreto de uma situação em que isso funcionou bem?",
        es: "Bien. ¿Puedes darme un ejemplo concreto de una vez en que funcionó bien?",
      },
      {
        en: "Noted. If the deadline moved forward by a week, what would you prioritise?",
        pt: "Anotado. Se o prazo fosse antecipado uma semana, o que priorizarias?",
        es: "Anotado. Si el plazo se adelantara una semana, ¿qué priorizarías?",
      },
    ],
    starters: [
      {
        en: "I'm responsible for the customer support team.",
        pt: "Sou responsável pela equipa de apoio ao cliente.",
        es: "Soy responsable del equipo de atención al cliente.",
      },
      {
        en: "We're aiming to finish the project by the end of the month.",
        pt: "O nosso objetivo é terminar o projeto até ao fim do mês.",
        es: "Nuestro objetivo es terminar el proyecto a finales de mes.",
      },
      {
        en: "I'll follow up with the client and get back to you.",
        pt: "Vou falar com o cliente e depois digo-te algo.",
        es: "Haré seguimiento con el cliente y te digo algo.",
      },
    ],
    hints: [
      {
        en: "Could you clarify what you mean by ...?",
        pt: "Podes esclarecer o que queres dizer com...?",
        es: "¿Puedes aclarar a qué te refieres con...?",
      },
      {
        en: "I'd like to flag a risk before we commit.",
        pt: "Gostaria de assinalar um risco antes de nos comprometermos.",
        es: "Me gustaría señalar un riesgo antes de comprometernos.",
      },
      {
        en: "Let me summarise the next steps.",
        pt: "Deixa-me resumir os próximos passos.",
        es: "Déjame resumir los próximos pasos.",
      },
      {
        en: "I'm afraid I won't be able to make it.",
        pt: "Lamento, mas não vou conseguir estar presente.",
        es: "Me temo que no podré asistir.",
      },
    ],
  },
  social: {
    emoji: "🥂",
    gradient: "from-[#6C2E5B] to-[#B05B84]",
    chip: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
    name: { pt: "Socialmente", es: "Social", en: "Socially" },
    description: {
      pt: "Jantares, small talk, convites e desculpas com boa educação.",
      es: "Cenas, charla informal, invitaciones y disculpas con buena educación.",
      en: "Dinners, small talk, invitations and polite excuses.",
    },
    openers: [
      {
        en: "You're at a friend's dinner party. Someone asks how you know the host. What do you say?",
        pt: "Estás num jantar em casa de um amigo. Alguém pergunta como conheces o anfitrião. O que dizes?",
        es: "Estás en una cena en casa de un amigo. Alguien pregunta cómo conoces al anfitrión. ¿Qué dices?",
      },
      {
        en: "Let's practise small talk. A stranger at a café asks what you've been up to lately.",
        pt: "Vamos praticar conversa fiada. Um desconhecido no café pergunta o que tens feito ultimamente.",
        es: "Vamos a practicar la charla informal. Un desconocido en el café te pregunta qué has hecho últimamente.",
      },
    ],
    replies: [
      {
        en: "Ha, I love that. And what do you usually do when you want to switch off after a busy week?",
        pt: "Ah, adoro isso. E o que costumas fazer quando queres desligar depois de uma semana intensa?",
        es: "Ja, me encanta. ¿Y qué sueles hacer cuando quieres desconectar tras una semana intensa?",
      },
      {
        en: "That's a great story. How did the two of you meet in the first place?",
        pt: "É uma ótima história. Como é que vocês dois se conheceram, afinal?",
        es: "Es una gran historia. ¿Cómo os conocisteis vosotros dos?",
      },
      {
        en: "Sounds fun! Would you rather have a quiet night in or go out with a big group?",
        pt: "Parece divertido! Preferias uma noite tranquila em casa ou sair com um grupo grande?",
        es: "¡Suena divertido! ¿Preferirías una noche tranquila en casa o salir con un grupo grande?",
      },
      {
        en: "I hear you. What's the best meal you've had recently — and who were you with?",
        pt: "Compreendo. Qual foi a melhor refeição que tiveste recentemente — e com quem?",
        es: "Te entiendo. ¿Cuál ha sido la mejor comida que has probado últimamente y con quién?",
      },
      {
        en: "Right. If your friends described you in three words, what would they pick?",
        pt: "Certo. Se os teus amigos te descrevessem em três palavras, quais escolheriam?",
        es: "Claro. Si tus amigos te describieran con tres palabras, ¿cuáles elegirían?",
      },
      {
        en: "Lovely. Are you more of a planner, or do you decide things at the last minute?",
        pt: "Que bom. És mais de planear ou decides as coisas em cima da hora?",
        es: "Qué bien. ¿Eres más de planificar o decides las cosas a última hora?",
      },
    ],
    starters: [
      {
        en: "Nice to meet you — I'm a friend of the host.",
        pt: "Muito prazer — sou amigo do anfitrião.",
        es: "Encantado — soy amigo del anfitrión.",
      },
      {
        en: "I've been meaning to try this restaurant for ages.",
        pt: "Há muito tempo que quero experimentar este restaurante.",
        es: "Llevo mucho tiempo queriendo probar este restaurante.",
      },
      {
        en: "I'd love to join, but I already have plans.",
        pt: "Adorava juntar-me, mas já tenho planos.",
        es: "Me encantaría unirme, pero ya tengo planes.",
      },
    ],
    hints: [
      {
        en: "I'm not really into ... to be honest.",
        pt: "Não sou muito de..., sinceramente.",
        es: "No soy mucho de..., sinceramente.",
      },
      {
        en: "That sounds right up my street.",
        pt: "Isso é mesmo a minha praia.",
        es: "Eso es justo lo mío.",
      },
      {
        en: "Would you mind if I brought someone?",
        pt: "Importas-te que eu leve alguém?",
        es: "¿Te importa si llevo a alguien?",
      },
      {
        en: "I'd better head off, but this was lovely.",
        pt: "É melhor ir andando, mas isto foi muito bom.",
        es: "Mejor me voy, pero ha estado genial.",
      },
    ],
  },
  technical: {
    emoji: "🛠️",
    gradient: "from-[#2A2340] to-[#5A4B8C]",
    chip: "bg-violet-50 text-violet-800 border-violet-200",
    name: { pt: "Técnico no trabalho", es: "Técnico en el trabajo", en: "Technical at work" },
    description: {
      pt: "Stand-ups, bugs, código, arquitetura e negociação técnica em inglês.",
      es: "Dailies, bugs, código, arquitectura y negociación técnica en inglés.",
      en: "Stand-ups, bugs, code, architecture and technical negotiation in English.",
    },
    openers: [
      {
        en: "Stand-up time. Give me a quick update: what are you working on, and what's blocking you?",
        pt: "Hora do stand-up. Dá-me uma atualização rápida: em que estás a trabalhar e o que te está a bloquear?",
        es: "Hora del daily. Dame una actualización rápida: ¿en qué trabajas y qué te bloquea?",
      },
      {
        en: "A colleague asks you to explain your system's architecture. Where do you start?",
        pt: "Um colega pede-te para explicar a arquitetura do teu sistema. Por onde começas?",
        es: "Un colega te pide explicar la arquitectura de tu sistema. ¿Por dónde empiezas?",
      },
    ],
    replies: [
      {
        en: "Got it. What's the acceptance criteria, and how will we verify the fix in production?",
        pt: "Entendido. Quais são os critérios de aceitação e como vamos verificar a correção em produção?",
        es: "Entendido. ¿Cuáles son los criterios de aceptación y cómo verificaremos la corrección en producción?",
      },
      {
        en: "That's a reasonable approach. What's the trade-off if we choose the simpler option?",
        pt: "É uma abordagem razoável. Qual é o compromisso se escolhermos a opção mais simples?",
        es: "Es un enfoque razonable. ¿Cuál es el compromiso si elegimos la opción más simple?",
      },
      {
        en: "Interesting. How does that behave under heavy load, and have you measured the latency?",
        pt: "Interessante. Como se comporta com carga elevada e já mediste a latência?",
        es: "Interesante. ¿Cómo se comporta con carga alta y has medido la latencia?",
      },
      {
        en: "Makes sense. Could you outline the rollback plan in case the deployment fails?",
        pt: "Faz sentido. Podes descrever o plano de reversão caso o deployment falhe?",
        es: "Tiene sentido. ¿Puedes describir el plan de reversión por si falla el despliegue?",
      },
      {
        en: "Fair point. Is this a quick patch, or does it need a proper refactor with tests?",
        pt: "É justo. Isto é um remendo rápido ou precisa de uma refatoração com testes?",
        es: "Es justo. ¿Es un parche rápido o necesita una refactorización con pruebas?",
      },
      {
        en: "Understood. Who owns the ticket, and when can we realistically ship it?",
        pt: "Entendido. Quem é responsável pelo ticket e quando podemos realmente lançá-lo?",
        es: "Entendido. ¿Quién es responsable del ticket y cuándo podemos lanzarlo de verdad?",
      },
    ],
    starters: [
      {
        en: "Yesterday I refactored the authentication middleware.",
        pt: "Ontem refatorei o middleware de autenticação.",
        es: "Ayer refactoricé el middleware de autenticación.",
      },
      {
        en: "The bug was caused by a race condition under load.",
        pt: "O bug foi causado por uma condição de corrida sob carga.",
        es: "El bug lo causó una condición de carrera bajo carga.",
      },
      {
        en: "We should write tests before merging this branch.",
        pt: "Devemos escrever testes antes de fazer merge deste ramo.",
        es: "Deberíamos escribir pruebas antes de fusionar esta rama.",
      },
    ],
    hints: [
      {
        en: "Just to double-check I understood: ...?",
        pt: "Só para confirmar que percebi: ...?",
        es: "Solo para confirmar que lo he entendido: ¿...?",
      },
      {
        en: "The root cause appears to be ...",
        pt: "A causa raiz parece ser...",
        es: "La causa raíz parece ser...",
      },
      {
        en: "We're blocked until the credentials are rotated.",
        pt: "Estamos bloqueados até as credenciais serem renovadas.",
        es: "Estamos bloqueados hasta que se renueven las credenciales.",
      },
      {
        en: "I'd suggest shipping it behind a feature flag.",
        pt: "Sugiro lançar isso por trás de uma feature flag.",
        es: "Sugiero lanzarlo detrás de una feature flag.",
      },
    ],
  },
};

export const FOCUS_LABELS: Record<FocusKey, { label: Tri; tip: Tri }> = {
  th: {
    label: { pt: "Som /θ/ e /ð/", es: "Sonido /θ/ y /ð/", en: "/θ/ and /ð/ sounds" },
    tip: {
      pt: "Põe a ponta da língua entre os dentes e sopra: think, this, three. Não digas «sink» nem «dis».",
      es: "Pon la punta de la lengua entre los dientes y sopla: think, this, three. No digas «sink» ni «dis».",
      en: "Put your tongue tip between your teeth and blow: think, this, three. Never «sink» or «dis».",
    },
  },
  vw: {
    label: { pt: "V vs. W", es: "V vs. W", en: "V vs. W" },
    tip: {
      pt: "No /v/ o lábio de baixo toca nos dentes (very). No /w/ os lábios arredondam sem tocar (water).",
      es: "En /v/ el labio inferior toca los dientes (very). En /w/ los labios se redondean sin tocarse (water).",
      en: "For /v/ the bottom lip touches the teeth (very). For /w/ the lips round without touching (water).",
    },
  },
  ed: {
    label: { pt: "Terminação -ed", es: "Terminación -ed", en: "-ed endings" },
    tip: {
      pt: "Três sons: /t/ (worked), /d/ (played) e /ɪd/ (wanted). Nunca acrescentes uma sílaba extra em worked.",
      es: "Tres sonidos: /t/ (worked), /d/ (played) e /ɪd/ (wanted). Nunca añadas una sílaba extra en worked.",
      en: "Three sounds: /t/ (worked), /d/ (played) and /ɪd/ (wanted). Never add an extra syllable to worked.",
    },
  },
  longVowels: {
    label: { pt: "Vogais longas", es: "Vocales largas", en: "Long vowels" },
    tip: {
      pt: "Alonga o som em sheet, beach e food — se encurtares, a palavra muda de significado.",
      es: "Alarga el sonido en sheet, beach y food; si lo acortas, la palabra cambia de significado.",
      en: "Hold the vowel in sheet, beach and food — shortening it changes the word entirely.",
    },
  },
  stress: {
    label: { pt: "Sílaba tónica", es: "Sílaba tónica", en: "Word stress" },
    tip: {
      pt: "O inglês bate forte numa sílaba e apaga as outras: comFORtable, deVELopment, phoTOgraphy.",
      es: "El inglés golpea una sílaba y apaga las demás: comFORtable, deVELopment, phoTOgraphy.",
      en: "English hits one syllable hard and flattens the rest: comFORtable, deVELopment, phoTOgraphy.",
    },
  },
  clusters: {
    label: { pt: "Grupos de consoantes", es: "Grupos de consonantes", en: "Consonant clusters" },
    tip: {
      pt: "Não coloques vogais entre consoantes: «street» não é «is-treet» nem «asks» é «a-sks».",
      es: "No metas vocales entre consonantes: «street» no es «is-treet» ni «asks» es «a-sks».",
      en: "Don't insert vowels between consonants: «street» is not «is-treet», «asks» is not «a-sks».",
    },
  },
  linking: {
    label: { pt: "Ligação entre palavras", es: "Enlace entre palabras", en: "Linking words" },
    tip: {
      pt: "Junta as palavras como um nativo: «an_apple» soa «anapple» e «not_at_all» soa «no-ta-tall».",
      es: "Une las palabras como un nativo: «an_apple» suena «anapple» y «not_at_all» suena «no-ta-tall».",
      en: "Link words like a native: «an_apple» sounds like «anapple», «not_at_all» like «no-ta-tall».",
    },
  },
  rl: {
    label: { pt: "R e L", es: "R y L", en: "R and L" },
    tip: {
      pt: "No /r/ a língua não toca no céu da boca; no /l/ final a língua toca atrás dos dentes: really, world.",
      es: "En /r/ la lengua no toca el paladar; en /l/ final toca detrás de los dientes: really, world.",
      en: "For /r/ the tongue touches nothing; for final /l/ it touches behind the teeth: really, world.",
    },
  },
  contractions: {
    label: { pt: "Contrações naturais", es: "Contracciones naturales", en: "Natural contractions" },
    tip: {
      pt: "Fala com contrações: I'd, we'll, they've, isn't. Dizer tudo por extenso soa robótico.",
      es: "Habla con contracciones: I'd, we'll, they've, isn't. Decirlo todo completo suena robótico.",
      en: "Use contractions: I'd, we'll, they've, isn't. Full forms everywhere sound robotic.",
    },
  },
};

type Seed = [string, string, string, FocusKey[]];

const CHALLENGE_SEEDS: Record<Mode, Record<Difficulty, Seed[]>> = {
  daily: {
    easy: [
      ["Good morning, can I have a coffee, please?", "Bom dia, posso tomar um café, por favor?", "Buenos días, ¿me pone un café, por favor?", ["th", "stress"]],
      ["I'm going to the supermarket after work.", "Vou ao supermercado depois do trabalho.", "Voy al supermercado después del trabajo.", ["contractions", "clusters"]],
      ["It's a lovely day, isn't it?", "Está um dia lindo, não está?", "Hace un día precioso, ¿verdad?", ["contractions", "linking"]],
    ],
    medium: [
      ["Could you tell me where the nearest bus stop is?", "Pode dizer-me onde fica a paragem de autocarro mais próxima?", "¿Puede decirme dónde está la parada de autobús más cercana?", ["stress", "linking"]],
      ["I usually cook dinner at about seven o'clock.", "Costumo fazer o jantar por volta das sete.", "Suelo hacer la cena sobre las siete.", ["vw", "rl"]],
      ["Do you know if the pharmacy is open today?", "Sabes se a farmácia está aberta hoje?", "¿Sabes si la farmacia está abierta hoy?", ["th", "longVowels"]],
    ],
    hard: [
      ["I'd rather take the earlier train, even if it means leaving before sunrise.", "Preferia apanhar o comboio mais cedo, mesmo que isso implique sair antes do nascer do sol.", "Preferiría coger el tren más temprano, aunque eso implique salir antes del amanecer.", ["contractions", "stress", "linking"]],
      ["Honestly, I can't remember whether I locked the front door this morning.", "Sinceramente, não me lembro se tranquei a porta esta manhã.", "Sinceramente, no recuerdo si cerré la puerta esta mañana.", ["th", "rl", "contractions"]],
      ["Next time you're in the neighbourhood, you should definitely drop by.", "Da próxima vez que estiveres pelo bairro, devias mesmo passar.", "La próxima vez que estés por el barrio, deberías pasarte sin falta.", ["linking", "clusters", "stress"]],
    ],
  },
  work: {
    easy: [
      ["I'll send you the report before lunch.", "Envio-te o relatório antes do almoço.", "Te envío el informe antes de comer.", ["contractions", "rl"]],
      ["Can we move the meeting to two o'clock?", "Podemos passar a reunião para as duas?", "¿Podemos mover la reunión a las dos?", ["stress", "linking"]],
      ["Please find the file in the shared folder.", "Encontras o ficheiro na pasta partilhada.", "Encontrarás el archivo en la carpeta compartida.", ["clusters", "vw"]],
    ],
    medium: [
      ["I've scheduled a quick catch-up with the design team tomorrow.", "Marquei uma conversa rápida com a equipa de design para amanhã.", "He agendado una charla rápida con el equipo de diseño para mañana.", ["contractions", "stress"]],
      ["Could you walk me through the new approval process?", "Podes explicar-me o novo processo de aprovação?", "¿Puedes explicarme el nuevo proceso de aprobación?", ["th", "linking"]],
      ["We need to align on the deadline before Friday.", "Precisamos de alinhar o prazo antes de sexta-feira.", "Tenemos que alinear el plazo antes del viernes.", ["longVowels", "clusters"]],
    ],
    hard: [
      ["The client raised a few concerns that I think deserve a thorough discussion.", "O cliente levantou algumas questões que merecem uma discussão aprofundada.", "El cliente planteó algunas cuestiones que merecen una discusión a fondo.", ["th", "stress", "linking"]],
      ["Let's circle back on the budget once we've reviewed the quarterly figures.", "Voltemos ao orçamento quando tivermos revisto os números trimestrais.", "Volvamos al presupuesto cuando hayamos revisado las cifras trimestrales.", ["clusters", "contractions"]],
      ["I'd appreciate a heads-up if the priorities change unexpectedly.", "Agradecia que me avisasses se as prioridades mudarem inesperadamente.", "Agradecería que me avisaras si las prioridades cambian de forma inesperada.", ["contractions", "rl", "stress"]],
    ],
  },
  social: {
    easy: [
      ["Nice to meet you! How do you know Sarah?", "Muito prazer! Como conheces a Sarah?", "¡Encantado! ¿Cómo conoces a Sarah?", ["rl", "linking"]],
      ["Do you want to grab a drink later?", "Queres ir beber algo mais tarde?", "¿Quieres tomar algo más tarde?", ["clusters", "linking"]],
      ["Thanks a lot for inviting me.", "Muito obrigado por me convidares.", "Muchas gracias por invitarme.", ["th", "clusters"]],
    ],
    medium: [
      ["I've heard great things about that place — is it worth the hype?", "Ouvi coisas muito boas sobre esse sítio — vale a fama?", "He oído cosas muy buenas de ese sitio, ¿vale la pena tanto bombo?", ["contractions", "th", "stress"]],
      ["Shall we split the bill, or are you treating me tonight?", "Dividimos a conta ou vais tu pagar hoje?", "¿Dividimos la cuenta o me invitas tú esta noche?", ["longVowels", "rl"]],
      ["I didn't catch your name, could you say it again?", "Não apanhei o teu nome, podes repetir?", "No he cogido tu nombre, ¿puedes repetirlo?", ["ed", "linking"]],
    ],
    hard: [
      ["I wasn't expecting to enjoy the evening this much, to be honest.", "Sinceramente, não estava à espera de gostar tanto da noite.", "Sinceramente, no esperaba disfrutar tanto de la noche.", ["contractions", "th", "linking"]],
      ["Even though we disagree, I genuinely appreciate your perspective.", "Mesmo discordando, aprecio genuinamente a tua perspetiva.", "Aunque no coincidamos, aprecio de verdad tu perspectiva.", ["vw", "stress", "clusters"]],
      ["Would you be up for joining us next weekend if you're free?", "Gostarias de se juntar a nós no próximo fim de semana, se estiveres livre?", "¿Te apetecería unirte a nosotros el próximo fin de semana si estás libre?", ["contractions", "linking", "rl"]],
    ],
  },
  technical: {
    easy: [
      ["Could you share your screen for a moment?", "Podes partilhar o ecrã por um momento?", "¿Puedes compartir tu pantalla un momento?", ["stress", "th"]],
      ["The build passed and the tests are running.", "O build passou e os testes estão a correr.", "La compilación pasó y las pruebas están en ejecución.", ["clusters", "ed"]],
      ["Please log the issue in the tracker.", "Por favor, regista o problema no tracker.", "Por favor, registra la incidencia en el gestor.", ["linking", "th"]],
    ],
    medium: [
      ["We should cache the response to reduce latency on the dashboard.", "Devemos fazer cache da resposta para reduzir a latência no painel.", "Deberíamos cachear la respuesta para reducir la latencia del panel.", ["vw", "longVowels", "stress"]],
      ["The deployment failed because an environment variable was missing.", "O deployment falhou porque faltava uma variável de ambiente.", "El despliegue falló porque faltaba una variable de entorno.", ["clusters", "linking", "vw"]],
      ["Can you review the pull request before the release?", "Podes rever o pull request antes do lançamento?", "¿Puedes revisar la pull request antes del lanzamiento?", ["rl", "stress"]],
    ],
    hard: [
      ["We reproduced the intermittent timeout under heavy concurrent load.", "Reproduzimos o timeout intermitente sob carga concorrente elevada.", "Reprodujimos el timeout intermitente bajo una carga concurrente alta.", ["clusters", "longVowels", "stress"]],
      ["I'd argue the architectural trade-off is acceptable given the requirements.", "Defendo que o compromisso arquitetural é aceitável face aos requisitos.", "Sostengo que el compromiso arquitectónico es aceptable dados los requisitos.", ["contractions", "stress", "clusters"]],
      ["The root cause was a race condition in the authentication middleware.", "A causa raiz foi uma condição de corrida no middleware de autenticação.", "La causa raíz fue una condición de carrera en el middleware de autenticación.", ["th", "rl", "vw"]],
    ],
  },
};

export const PRONUNCIATION_CHALLENGES: PronunciationChallenge[] = MODES.flatMap((mode) =>
  DIFFICULTIES.flatMap((difficulty) =>
    CHALLENGE_SEEDS[mode][difficulty].map(([text, pt, es, focus], index) => ({
      id: `${mode}-${difficulty}-${index + 1}`,
      mode,
      difficulty,
      text,
      translation: { pt, es },
      focus,
    })),
  ),
);

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 8,
  medium: 14,
  hard: 22,
};
