import { FOCUS_LABELS, MODES, PRONUNCIATION_CHALLENGES, type Mode } from "@/lib/content";
import { wordFocus } from "@/lib/coaching";
import { saveAttempt } from "@/lib/repo";
import { getLearnerId } from "@/lib/session";
import { scorePronunciation, xpForAttempt } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "frase-livre";

export async function POST(request: Request) {
  const learnerId = await getLearnerId();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const customText = typeof body.text === "string" ? body.text.trim().slice(0, 400) : "";
  const transcript = typeof body.transcript === "string" ? body.transcript.trim().slice(0, 900) : "";

  const challenge = PRONUNCIATION_CHALLENGES.find((item) => item.id === challengeId);
  const targetText = challenge?.text ?? customText;

  if (!targetText) {
    return Response.json({ error: "Falta a frase a avaliar." }, { status: 400 });
  }
  if (!transcript) {
    return Response.json({ error: "Não recebi nenhuma transcrição." }, { status: 400 });
  }

  const result = scorePronunciation(targetText, transcript);
  const difficulty = challenge?.difficulty ?? "medium";
  const rawMode = typeof body.mode === "string" ? body.mode : challenge?.mode ?? "daily";
  const mode = ((MODES as readonly string[]).includes(rawMode) ? rawMode : "daily") as Mode;
  const xpEarned = Math.round(xpForAttempt(difficulty, result.score) * (customText ? 1.2 : 1));

  const attempt = await saveAttempt({
    profileId: learnerId,
    challengeId: challenge?.id ?? `coach-${slug(targetText)}`,
    mode,
    difficulty,
    targetText,
    transcript,
    score: result.score,
    breakdown: result,
    xpEarned,
  });

  const focusWords = result.words
    .map((word, index) => ({ ...word, index }))
    .filter((word) => !word.match || word.similarity < 0.9)
    .slice(0, 6)
    .map((word) => wordFocus(word.target, "en"));

  const focusKeys = Array.from(
    new Set(
      focusWords
        .map((word) => word.focus)
        .filter((focus): focus is NonNullable<typeof focus> => Boolean(focus)),
    ),
  );

  return Response.json({
    result,
    xpEarned,
    focusWords,
    focusKeys,
    focusLabels: focusKeys.map((key) => ({ key, label: FOCUS_LABELS[key].label })),
    attemptId: attempt.id,
    targetText,
  });
}
