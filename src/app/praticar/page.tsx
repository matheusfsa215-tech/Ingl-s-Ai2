import PracticeStudio from "@/components/PracticeStudio";
import { MODES, type Level, type Mode } from "@/lib/content";
import { getDictionary, normalizeLang } from "@/lib/i18n";
import {
  getConversation,
  getOrCreateProfile,
  listConversations,
  toConversationDTO,
  toMessageDTO,
} from "@/lib/repo";
import { getLearnerId, getUiLangCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

const LEVELS = ["A2", "B1", "B2", "C1"] as const;

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; c?: string }>;
}) {
  const params = await searchParams;
  const learnerId = await getLearnerId();
  const lang = normalizeLang(await getUiLangCookie());
  const dict = getDictionary(lang);

  const [profile, conversations] = await Promise.all([
    getOrCreateProfile(learnerId),
    listConversations(learnerId, 20),
  ]);

  const requestedId = params.c ? Number(params.c) : NaN;
  const wantsFreshMode = (MODES as readonly string[]).includes(params.mode ?? "");
  const fallbackId = wantsFreshMode ? undefined : conversations[0]?.id;
  const targetId = Number.isFinite(requestedId) ? requestedId : fallbackId;
  const active = targetId ? await getConversation(learnerId, targetId) : null;

  const initialMode = (MODES as readonly string[]).includes(params.mode ?? "")
    ? (params.mode as Mode)
    : (MODES as readonly string[]).includes(profile.goal)
      ? (profile.goal as Mode)
      : "daily";

  const initialLevel = (LEVELS as readonly string[]).includes(profile.level)
    ? (profile.level as Level)
    : "B1";

  return (
    <PracticeStudio
      dict={dict}
      lang={lang}
      profile={{ name: profile.name, level: initialLevel, voice: profile.voice }}
      initialConversations={conversations.map(toConversationDTO)}
      initialConversation={active ? toConversationDTO(active.conversation) : null}
      initialMessages={active ? active.messages.map(toMessageDTO) : []}
      initialMode={initialMode}
    />
  );
}
