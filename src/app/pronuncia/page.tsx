import PronunciationStudio from "@/components/PronunciationStudio";
import { PRONUNCIATION_CHALLENGES } from "@/lib/content";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import { getOrCreateProfile, getStats } from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";
import type { AttemptDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PronunciationPage() {
  const learnerId = await getLearnerId();
  const lang = normalizeLang(await getUiLangCookie());
  const dict = getDictionary(lang);

  const [profile, stats] = await Promise.all([getOrCreateProfile(learnerId), getStats(learnerId)]);

  const attempts: AttemptDTO[] = stats.recentAttempts.map((attempt) => ({
    id: attempt.id,
    mode: attempt.mode,
    difficulty: attempt.difficulty,
    targetText: attempt.targetText,
    transcript: attempt.transcript,
    score: attempt.score,
    createdAt: attempt.createdAt,
  }));

  return (
    <PronunciationStudio
      dict={dict}
      lang={lang}
      challenges={PRONUNCIATION_CHALLENGES}
      initialAttempts={attempts}
      profile={{ level: profile.level, voice: profile.voice }}
    />
  );
}
