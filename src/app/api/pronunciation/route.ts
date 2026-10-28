import { MODES, PRONUNCIATION_CHALLENGES, type Mode } from "@/lib/content";
import { saveAttempt } from "@/lib/repo";
import { getLearnerId } from "@/lib/session";
import { scorePronunciation, xpForAttempt } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const learnerId = await getLearnerId();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const transcript = typeof body.transcript === "string" ? body.transcript.trim().slice(0, 600) : "";

  const challenge = PRONUNCIATION_CHALLENGES.find((item) => item.id === challengeId);
  if (!challenge) return Response.json({ error: "Desafio não encontrado." }, { status: 404 });
  if (!transcript) {
    return Response.json(
      { error: "Não recebi nenhuma transcrição. Grava ou escreve o que disseste." },
      { status: 400 },
    );
  }

  const result = scorePronunciation(challenge.text, transcript);
  const xpEarned = xpForAttempt(challenge.difficulty, result.score);

  const attempt = await saveAttempt({
    profileId: learnerId,
    challengeId: challenge.id,
    mode: challenge.mode as Mode,
    difficulty: challenge.difficulty,
    targetText: challenge.text,
    transcript,
    score: result.score,
    breakdown: result,
    xpEarned,
  });

  return Response.json({
    result,
    xpEarned,
    attempt: {
      id: attempt.id,
      score: attempt.score,
      mode: attempt.mode,
      difficulty: attempt.difficulty,
      targetText: attempt.targetText,
      transcript: attempt.transcript,
      createdAt: new Date(attempt.createdAt).toISOString(),
    },
    modes: MODES,
  });
}
