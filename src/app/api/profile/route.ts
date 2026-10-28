import { LEVELS, MODES, type Level, type Mode } from "@/lib/content";
import { getOrCreateProfile, updateProfile } from "@/lib/repo";
import { getLearnerId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const learnerId = await getLearnerId();
  const profile = await getOrCreateProfile(learnerId);
  return Response.json({ profile });
}

export async function PATCH(request: Request) {
  const learnerId = await getLearnerId();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: { name?: string; level?: Level; goal?: Mode; voice?: string; uiLanguage?: string } = {};

  if (typeof body.name === "string" && body.name.trim().length > 0) {
    patch.name = body.name.trim().slice(0, 40);
  }
  if (typeof body.level === "string" && (LEVELS as readonly string[]).includes(body.level)) {
    patch.level = body.level as Level;
  }
  if (typeof body.goal === "string" && (MODES as readonly string[]).includes(body.goal)) {
    patch.goal = body.goal as Mode;
  }
  if (body.voice === "en-GB" || body.voice === "en-US") {
    patch.voice = body.voice;
  }
  if (body.uiLanguage === "pt-PT" || body.uiLanguage === "es" || body.uiLanguage === "en") {
    patch.uiLanguage = body.uiLanguage;
  }

  await getOrCreateProfile(learnerId);
  const profile = Object.keys(patch).length ? await updateProfile(learnerId, patch) : await getOrCreateProfile(learnerId);
  return Response.json({ ok: true, profile });
}
