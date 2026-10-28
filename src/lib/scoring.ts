export type WordFeedback = {
  target: string;
  spoken: string | null;
  match: boolean;
  similarity: number;
};

export type PronunciationScore = {
  score: number;
  band: "excellent" | "good" | "almost" | "retry";
  target: string;
  spoken: string;
  words: WordFeedback[];
  missing: string[];
  extra: string[];
};

const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am",
  "i've": "i have",
  "i'll": "i will",
  "i'd": "i would",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "that's": "that is",
  "there's": "there is",
  "what's": "what is",
  "let's": "let us",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "can't": "cannot",
  "won't": "will not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "couldn't": "could not",
  "wouldn't": "would not",
  "shouldn't": "should not",
  "haven't": "have not",
  "hasn't": "has not",
  "you'll": "you will",
  "we'll": "we will",
  "they'll": "they will",
  "gonna": "going to",
  "wanna": "want to",
};

const DIGITS: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
  "11": "eleven",
  "12": "twelve",
  "15": "fifteen",
  "20": "twenty",
  "30": "thirty",
};

export function normalizeSpoken(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => CONTRACTIONS[word] ?? DIGITS[word] ?? word)
    .join(" ");
}

function words(text: string): string[] {
  return normalizeSpoken(text)
    .split(" ")
    .flatMap((word) => (CONTRACTIONS[word] ? CONTRACTIONS[word].split(" ") : [word]))
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

export function bandFor(score: number): PronunciationScore["band"] {
  if (score >= 88) return "excellent";
  if (score >= 72) return "good";
  if (score >= 52) return "almost";
  return "retry";
}

export function scorePronunciation(target: string, spoken: string): PronunciationScore {
  const targetWords = words(target);
  const spokenWords = words(spoken);
  const pool = [...spokenWords];
  const feedback: WordFeedback[] = [];
  const missing: string[] = [];

  for (const targetWord of targetWords) {
    let bestIndex = -1;
    let bestScore = 0;
    pool.forEach((candidate, index) => {
      const value = similarity(targetWord, candidate);
      if (value > bestScore) {
        bestScore = value;
        bestIndex = index;
      }
    });
    if (bestIndex >= 0 && bestScore >= 0.78) {
      const spokenWord = pool.splice(bestIndex, 1)[0];
      feedback.push({ target: targetWord, spoken: spokenWord, match: true, similarity: bestScore });
    } else {
      feedback.push({ target: targetWord, spoken: bestIndex >= 0 ? pool[bestIndex] : null, match: false, similarity: bestScore });
      if (bestScore < 0.5) missing.push(targetWord);
    }
  }

  const matched = feedback.filter((item) => item.match).length;
  const wordScore = targetWords.length ? matched / targetWords.length : 0;
  const whole = similarity(words(target).join(" "), words(spoken).join(" "));
  // Word accuracy dominates: one clearly wrong word should be visible in the score.
  const raw = spokenWords.length === 0 ? 0 : Math.pow(wordScore, 1.5) * 82 + whole * 18;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    score,
    band: bandFor(score),
    target,
    spoken,
    words: feedback,
    missing,
    extra: pool,
  };
}

export function xpForAttempt(difficulty: string, score: number): number {
  const base = difficulty === "hard" ? 20 : difficulty === "medium" ? 12 : 6;
  const bonus = score >= 90 ? 8 : score >= 75 ? 4 : 0;
  return base + bonus;
}
