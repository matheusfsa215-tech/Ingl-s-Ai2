import DictionCoach from "@/components/DictionCoach";
import { MODES, type Mode } from "@/lib/content";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import { getOrCreateProfile, getStats } from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const learnerId = await getLearnerId();
  const lang = normalizeLang(await getUiLangCookie());
  const dict = getDictionary(lang);

  const [profile, stats] = await Promise.all([getOrCreateProfile(learnerId), getStats(learnerId)]);

  const initialMode = (MODES as readonly string[]).includes(profile.goal) ? (profile.goal as Mode) : "daily";

  return (
    <DictionCoach
      dict={dict}
      lang={lang}
      voice={profile.voice}
      initialMode={initialMode}
      initialAttempts={stats.recentAttempts}
    />
  );
}
