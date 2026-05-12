/**
 * Row shape for `public.golfer_profiles` inserts/updates.
 * Keep in sync with Supabase migrations.
 */
import type { GolferProfileRow } from "@/lib/reportAnalytics";
import { trimStringish } from "@/lib/trimStringish";
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
  age: number | null;
  height: number | null;
  weight: number | null;
  body_type: string | null;
  flexibility_score: number | null;
  waist_measurement: number | null;
  inseam: number | null;
  arm_length: number | null;
  wrist_to_floor: number | null;
  shoulder_width: number | null;
  shoe_size: string | null;
  athletic_background: string | null;
  injury_notes: string | null;
  fitting_notes: string | null;
};

/** Writable profile fields without `user_id` (for inserts merged with user, or updates). */
export type GolferProfileWriteFields = Omit<GolferProfileInsert, "user_id">;

export type BodyTypeId = "slim" | "average" | "athletic" | "stocky" | "larger" | "";

export const BODY_TYPE_LABELS: Record<Exclude<BodyTypeId, "">, string> = {
  slim: "Slim",
  average: "Average",
  athletic: "Athletic",
  stocky: "Stocky",
  larger: "Larger frame",
};

export function formatBodyTypeLabel(id: string | null | undefined): string {
  const raw = trimStringish(id);
  if (!raw) return "—";
  const k = raw.toLowerCase() as Exclude<BodyTypeId, "">;
  return BODY_TYPE_LABELS[k] ?? raw;
}

export type GolferProfileFormState = {
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
  age: string;
  heightInches: string;
  weightLbs: string;
  bodyType: BodyTypeId;
  flexibilityScore: string;
  waistInches: string;
  inseamInches: string;
  armLengthInches: string;
  wristToFloorInches: string;
  shoulderWidthInches: string;
  shoeSize: string;
  athleticBackground: string;
  injuryNotes: string;
  fittingNotes: string;
};

function emptyToNull(value: unknown): string | null {
  const t = trimStringish(value);
  return t === "" ? null : t;
}

function parseOptionalInt(value: unknown): number | null {
  const t = trimStringish(value);
  if (t === "") return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalFloat(value: unknown): number | null {
  const t = trimStringish(value);
  if (t === "") return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function parseFlexibilityScore(value: unknown): number | null {
  const n = parseOptionalInt(value);
  if (n == null) return null;
  if (n < 1 || n > 10) return null;
  return n;
}

/** Map form state → DB columns (no `user_id`). */
export function buildGolferProfileWriteFields(form: GolferProfileFormState): GolferProfileWriteFields {
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
    age: parseOptionalInt(form.age),
    height: parseOptionalFloat(form.heightInches),
    weight: parseOptionalFloat(form.weightLbs),
    body_type: form.bodyType === "" ? null : form.bodyType,
    flexibility_score: parseFlexibilityScore(form.flexibilityScore),
    waist_measurement: parseOptionalFloat(form.waistInches),
    inseam: parseOptionalFloat(form.inseamInches),
    arm_length: parseOptionalFloat(form.armLengthInches),
    wrist_to_floor: parseOptionalFloat(form.wristToFloorInches),
    shoulder_width: parseOptionalFloat(form.shoulderWidthInches),
    shoe_size: emptyToNull(form.shoeSize),
    athletic_background: emptyToNull(form.athleticBackground),
    injury_notes: emptyToNull(form.injuryNotes),
    fitting_notes: emptyToNull(form.fittingNotes),
  };
}

/** @deprecated Use `buildGolferProfileWriteFields` — alias for clarity at call sites. */
export function buildGolferProfileInsert(form: GolferProfileFormState): GolferProfileWriteFields {
  return buildGolferProfileWriteFields(form);
}

const BODY_TYPE_IDS = new Set<string>(["slim", "average", "athletic", "stocky", "larger"]);

function numToForm(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return String(n);
}

function bodyTypeFromRow(v: string | null | undefined): BodyTypeId {
  const t = trimStringish(v).toLowerCase();
  if (!t) return "";
  return BODY_TYPE_IDS.has(t) ? (t as BodyTypeId) : "";
}

export const initialGolferProfileFormState: GolferProfileFormState = {
  name: "",
  handicap: "",
  dominantHand: "",
  typicalScore: "",
  driverCarryYards: "",
  sevenIronCarryYards: "",
  swingSpeedMph: "",
  commonMiss: "",
  primaryGoal: "",
  practiceFrequency: "",
  notes: "",
  age: "",
  heightInches: "",
  weightLbs: "",
  bodyType: "",
  flexibilityScore: "",
  waistInches: "",
  inseamInches: "",
  armLengthInches: "",
  wristToFloorInches: "",
  shoulderWidthInches: "",
  shoeSize: "",
  athleticBackground: "",
  injuryNotes: "",
  fittingNotes: "",
};

/** Hydrate the profile form from the latest Supabase row. */
export function golferProfileRowToFormState(row: GolferProfileRow): GolferProfileFormState {
  const dh = row.dominant_hand === "right" || row.dominant_hand === "left" ? row.dominant_hand : "";
  return {
    name: row.name ?? "",
    handicap: row.handicap ?? "",
    dominantHand: dh,
    typicalScore: row.typical_score ?? "",
    driverCarryYards: numToForm(row.driver_carry),
    sevenIronCarryYards: numToForm(row.seven_iron_carry),
    swingSpeedMph: numToForm(row.swing_speed),
    commonMiss: row.common_miss ?? "",
    primaryGoal: row.primary_goal ?? "",
    practiceFrequency: row.practice_frequency ?? "",
    notes: row.notes ?? "",
    age: numToForm(row.age),
    heightInches: numToForm(row.height),
    weightLbs: numToForm(row.weight),
    bodyType: bodyTypeFromRow(row.body_type),
    flexibilityScore: numToForm(row.flexibility_score),
    waistInches: numToForm(row.waist_measurement),
    inseamInches: numToForm(row.inseam),
    armLengthInches: numToForm(row.arm_length),
    wristToFloorInches: numToForm(row.wrist_to_floor),
    shoulderWidthInches: numToForm(row.shoulder_width),
    shoeSize: row.shoe_size ?? "",
    athleticBackground: row.athletic_background ?? "",
    injuryNotes: row.injury_notes ?? "",
    fittingNotes: row.fitting_notes ?? "",
  };
}
