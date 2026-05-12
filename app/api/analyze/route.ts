import { generateGolfCoachInsights, normalizeAnalyzePayload } from "@/lib/golfCoachAnalysis";
import { APIError } from "openai";

export const runtime = "nodejs";
export const maxDuration = 120;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return jsonError("Server is not configured with OPENAI_API_KEY.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Expected a JSON object with optional keys: profile, bag, session, shots.", 400);
  }

  const payload = normalizeAnalyzePayload(body as Record<string, unknown>);

  try {
    const insights = await generateGolfCoachInsights(apiKey, payload);
    return Response.json({ insights });
  } catch (err) {
    if (err instanceof APIError) {
      const msg = err.message || "OpenAI request failed.";
      if (err.status === 429) {
        return jsonError("Analysis temporarily rate-limited. Retry shortly.", 503);
      }
      if (err.status === 401 || err.status === 403) {
        return jsonError("AI provider authentication failed on the server.", 502);
      }
      return jsonError(msg, 502);
    }
    if (err instanceof Error) {
      return jsonError(err.message, 502);
    }
    return jsonError("Unexpected error generating analysis.", 502);
  }
}
