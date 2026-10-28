import type { Level, Mode } from "@/lib/content";
import { appendMessage, getConversation, recordActivity, toMessageDTO } from "@/lib/repo";
import { getLearnerId } from "@/lib/session";
import { analyseMessage, coachingLeadIn, generateTutorReply } from "@/lib/tutor";
import type { MessageMeta } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const learnerId = await getLearnerId();
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId)) {
    return Response.json({ error: "Conversa inválida." }, { status: 400 });
  }

  const owned = await getConversation(learnerId, conversationId);
  if (!owned) return Response.json({ error: "Conversa não encontrada." }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 700) : "";
  if (!message) return Response.json({ error: "Escreve uma frase em inglês." }, { status: 400 });

  const mode = owned.conversation.mode as Mode;
  const level = owned.conversation.level as Level;
  const turnIndex = owned.messages.filter((row) => row.role === "assistant").length;

  const analysis = analyseMessage(message);
  const meta: MessageMeta = {
    corrected: analysis.corrected,
    notes: analysis.notes,
    fluency: analysis.fluency,
    praise: analysis.praise,
    engine: "engine",
  };

  const userRow = await appendMessage({
    conversationId,
    role: "user",
    content: message,
    corrections: analysis.corrections,
    meta,
  });

  const reply = await generateTutorReply({
    mode,
    level,
    message,
    turnIndex,
    history: owned.messages.map((row) => ({ role: row.role, content: row.content })),
  });

  const lead = coachingLeadIn(reply.corrections, reply.praise);
  const assistantContent = lead ? `${lead.content} ${reply.content}` : reply.content;
  const assistantPt = lead && reply.translationPt ? `${lead.translationPt} ${reply.translationPt}` : reply.translationPt;
  const assistantEs = lead && reply.translationEs ? `${lead.translationEs} ${reply.translationEs}` : reply.translationEs;

  const assistantRow = await appendMessage({
    conversationId,
    role: "assistant",
    content: assistantContent,
    translationPt: assistantPt,
    translationEs: assistantEs,
    corrections: [],
    meta: { engine: reply.source },
  });

  const xp = 6 + (reply.corrections.length === 0 ? 4 : Math.max(0, 3 - reply.corrections.length));
  await recordActivity(learnerId, xp);

  return Response.json({
    userMessage: toMessageDTO(userRow),
    assistantMessage: toMessageDTO(assistantRow),
    xpEarned: xp,
    engine: reply.source,
  });
}
