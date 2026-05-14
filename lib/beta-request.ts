/** Shared validation for Founding Golfer Beta signup (API + optional client hints). */

export type BetaRequestInsert = {
  name: string;
  email: string;
  handicap: string;
  launch_monitor: string;
  golf_goal: string;
};

const LIMITS = {
  name: 200,
  email: 254,
  handicap: 80,
  launch_monitor: 200,
  golf_goal: 4000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimToMax(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max);
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const v = record[key];
  if (typeof v !== "string") return undefined;
  return v;
}

export type BetaRequestParseResult =
  | { ok: true; data: BetaRequestInsert }
  | { ok: false; error: string };

export function parseBetaRequestBody(body: unknown): BetaRequestParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Expected a JSON object." };
  }
  const o = body as Record<string, unknown>;
  const name = readString(o, "name");
  const email = readString(o, "email");
  const handicap = readString(o, "handicap");
  const launch_monitor = readString(o, "launch_monitor");
  const golf_goal = readString(o, "golf_goal");

  if (name === undefined || handicap === undefined || launch_monitor === undefined || golf_goal === undefined) {
    return { ok: false, error: "Missing required fields." };
  }
  if (email === undefined) {
    return { ok: false, error: "Email is required." };
  }

  const nameT = trimToMax(name, LIMITS.name);
  const emailT = trimToMax(email, LIMITS.email).toLowerCase();
  const handicapT = trimToMax(handicap, LIMITS.handicap);
  const lmT = trimToMax(launch_monitor, LIMITS.launch_monitor);
  const goalT = trimToMax(golf_goal, LIMITS.golf_goal);

  if (!nameT) return { ok: false, error: "Full name is required." };
  if (!emailT) return { ok: false, error: "Email is required." };
  if (!EMAIL_RE.test(emailT)) return { ok: false, error: "Enter a valid email address." };
  if (!handicapT) return { ok: false, error: "Handicap is required." };
  if (!lmT) return { ok: false, error: "Launch monitor is required." };
  if (!goalT) return { ok: false, error: "Biggest golf goal is required." };

  return {
    ok: true,
    data: {
      name: nameT,
      email: emailT,
      handicap: handicapT,
      launch_monitor: lmT,
      golf_goal: goalT,
    },
  };
}
