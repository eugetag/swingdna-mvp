import OpenAI from "openai";
import type {
  GolfBagClubRow,
  GolferProfileRow,
  LaunchSessionRow,
  LaunchShotRow,
} from "@/lib/reportAnalytics";

/** Payload accepted by `/api/analyze` (mirrors Supabase row shapes). */
export type AnalyzeCoachPayload = {
  profile: GolferProfileRow | null;
  bag: GolfBagClubRow[];
  session: LaunchSessionRow | null;
  shots: LaunchShotRow[];
};

/** Structured coaching output from the model. */
export type GolfCoachInsights = {
  executiveSummary: string;
  swingTendencies: string[];
  clubGappingObservations: string[];
  consistencyAnalysis: string[];
  distanceObservations: string[];
  practiceRecommendations: string[];
  equipmentRecommendations: string[];
  courseStrategySuggestions: string[];
};

const SYSTEM_PROMPT = `You are an elite PGA Tour–caliber coach and caddie: precise, premium, and economical with words. You synthesize launch-monitor data, bag builds, and player context into actionable intelligence—never generic platitudes.

Voice: intelligent, confident, warm authority. No exclamation spam. No clichés ("keep your head down"). Prefer one sharp observation over three vague ones.

Rules:
- Ground every claim in the supplied data when possible; where data is thin, say so briefly and infer cautiously.
- Each array field should contain 3–7 distinct bullet strings (single sentences, no numbering prefix).
- JSON only in your reply—no markdown fences, no prose outside the object.

Required JSON shape (exact keys, camelCase):
{
  "executiveSummary": string (one or two sentences, Tour-caddie tone),
  "swingTendencies": string[],
  "clubGappingObservations": string[],
  "consistencyAnalysis": string[],
  "distanceObservations": string[],
  "practiceRecommendations": string[],
  "equipmentRecommendations": string[],
  "courseStrategySuggestions": string[]
}`;

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asNonEmptyString(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  return t || fallback;
}

export function parseCoachInsightsJson(content: string): GolfCoachInsights {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    throw new Error("Model returned invalid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Model JSON was not an object.");
  }

  const o = parsed as Record<string, unknown>;
  const empty = "Insufficient structured data for a full read—expand session or bag detail for sharper notes.";

  return {
    executiveSummary: asNonEmptyString(o.executiveSummary, empty),
    swingTendencies: asStringArray(o.swingTendencies),
    clubGappingObservations: asStringArray(o.clubGappingObservations),
    consistencyAnalysis: asStringArray(o.consistencyAnalysis),
    distanceObservations: asStringArray(o.distanceObservations),
    practiceRecommendations: asStringArray(o.practiceRecommendations),
    equipmentRecommendations: asStringArray(o.equipmentRecommendations),
    courseStrategySuggestions: asStringArray(o.courseStrategySuggestions),
  };
}

function buildUserContent(payload: AnalyzeCoachPayload): string {
  const envelope = {
    instruction:
      "Analyze this player package and return ONLY the JSON object with the exact keys specified in the system message.",
    data: {
      profile: payload.profile,
      bag: payload.bag,
      session: payload.session,
      shots: payload.shots,
    },
    hints: {
      shotCount: payload.shots.length,
      bagClubCount: payload.bag.length,
      hasSession: payload.session != null,
      hasProfile: payload.profile != null,
    },
  };
  return JSON.stringify(envelope);
}

export async function generateGolfCoachInsights(
  apiKey: string,
  payload: AnalyzeCoachPayload,
): Promise<GolfCoachInsights> {
  const model = process.env.OPENAI_ANALYZE_MODEL?.trim() || "gpt-4o";
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.45,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserContent(payload) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("OpenAI returned an empty completion.");
  }

  return parseCoachInsightsJson(content);
}

export function normalizeAnalyzePayload(body: Record<string, unknown>): AnalyzeCoachPayload {
  return {
    profile: (body.profile ?? null) as GolferProfileRow | null,
    bag: Array.isArray(body.bag) ? (body.bag as GolfBagClubRow[]) : [],
    session: (body.session ?? null) as LaunchSessionRow | null,
    shots: Array.isArray(body.shots) ? (body.shots as LaunchShotRow[]) : [],
  };
}
