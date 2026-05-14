import { parseBetaRequestBody } from "@/lib/beta-request";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = parseBetaRequestBody(body);
  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("beta_requests").insert(parsed.data);

  if (error) {
    console.error("[beta-request]", error.message);
    return jsonError("Could not save your request. Please try again.", 502);
  }

  return Response.json({ ok: true as const });
}
