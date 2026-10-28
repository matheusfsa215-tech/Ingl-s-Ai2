import { deleteConversation, getConversation, toConversationDTO, toMessageDTO } from "@/lib/repo";
import { getLearnerId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const learnerId = await getLearnerId();
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId)) {
    return Response.json({ error: "Conversa inválida." }, { status: 400 });
  }
  const owned = await getConversation(learnerId, conversationId);
  if (!owned) return Response.json({ error: "Conversa não encontrada." }, { status: 404 });

  return Response.json({
    conversation: toConversationDTO(owned.conversation),
    messages: owned.messages.map(toMessageDTO),
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const learnerId = await getLearnerId();
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId)) {
    return Response.json({ error: "Conversa inválida." }, { status: 400 });
  }
  const deleted = await deleteConversation(learnerId, conversationId);
  if (!deleted) return Response.json({ error: "Conversa não encontrada." }, { status: 404 });
  return Response.json({ ok: true });
}
