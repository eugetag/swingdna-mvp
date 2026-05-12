/**
 * Row shape for `public.golfer_profiles` inserts.
 * Keep in sync with your Supabase table (see `supabase/migrations/0001_golfer_profiles.sql`).
 */
export type GolferProfileInsert = {
  user_id: string;
  name: string | null;
  handicap: string | null;
  dominant_hand: "right" | "left" | null;
  typical_score: string | null;
  driver_carry: number | null;
  seven_iron_carry: number | null;
  swing_speed: number | null;
  common_miss: string | null;
  primary_goal: string | null;
  practice_frequency: string | null;
  notes: string | null;
};

type FormLike = {
  name: string;
  handicap: string;
  dominantHand: "" | "right" | "left";
  typicalScore: string;
  driverCarryYards: string;
  sevenIronCarryYards: string;
  swingSpeedMph: string;
  commonMiss: string;
  primaryGoal: string;
  practiceFrequency: string;
  notes: string;
};

function emptyToNull(value: string): string | null {
  const t = value.trim();
  return t === "" ? null : t;
}

function parseOptionalInt(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalFloat(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

/** Form fields only — merge `user_id` at insert time after `auth.getUser()`. */
export function buildGolferProfileInsert(form: FormLike): Omit<GolferProfileInsert, "user_id"> {
  const hand = form.dominantHand;
  return {
    name: emptyToNull(form.name),
    handicap: emptyToNull(form.handicap),
    dominant_hand: hand === "" ? null : hand,
    typical_score: emptyToNull(form.typicalScore),
    driver_carry: parseOptionalInt(form.driverCarryYards),
    seven_iron_carry: parseOptionalInt(form.sevenIronCarryYards),
    swing_speed: parseOptionalFloat(form.swingSpeedMph),
    common_miss: emptyToNull(form.commonMiss),
    primary_goal: emptyToNull(form.primaryGoal),
    practice_frequency: emptyToNull(form.practiceFrequency),
    notes: emptyToNull(form.notes),
  };
}
