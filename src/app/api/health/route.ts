import { runServerChecks, summarize } from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const checks = await runServerChecks();
    const { ok } = summarize(checks);
    return Response.json(
      {
        ok,
        service: "fluentia",
        checkedAt: new Date().toISOString(),
        checks: checks.map((check) => ({
          id: check.id,
          status: check.status,
          label: check.label,
          detail: check.detail,
        })),
      },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 },
    );
  }
}
