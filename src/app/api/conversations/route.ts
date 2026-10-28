import { LEVELS, MODES, type Level, type Mode } from "@/lib/content";
import {
  createConversation,
  listConversations,
  recordActivity,
  toConversationDTO,
  toMessageDTO,
} from "@/lib/repo";
import { getLearnerId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const learnerId = await getLearnerId();
  const rows = await listConversations(learnerId, 30);
  return Response.json({ conversations: rows.map(toConversationDTO) });
}

export async function POST(request: Request) {
  const learnerId = await getLearnerId();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const mode = (typeof body.mode === "string" && (MODES as readonly string[]).includes(body.mode)
    ? body.mode
    : "daily") as Mode;
  const level = (typeof body.level === "string" && (LEVELS as readonly string[]).includes(body.level)
    ? body.level
    : "B1") as Level;

  const { conversation, firstMessage } = await createConversation(learnerId, mode, level);
  await recordActivity(learnerId, 0);

  return Response.json({
    conversation: toConversationDTO(conversation),
    message: toMessageDTO(firstMessage),
  });
}
