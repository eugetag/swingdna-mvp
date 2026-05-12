/**
 * Row shape for `public.golf_bag_clubs` inserts.
 * Column names must match Supabase exactly.
 */
import { trimStringish } from "@/lib/trimStringish";
export type GolfBagClubInsert = {
  user_id: string;
  club_type: string;
  brand: string;
  model: string;
  loft: string;
  shaft: string;
  flex: string;
  carry_distance: number | null;
  total_distance: number | null;
  shot_shape_tendency: string;
  confidence_rating: number;
};

function parseOptionalNumeric(value: unknown): number | null {
  const t = trimStringish(value);
  if (t === "") return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function nz(value: unknown): string {
  return trimStringish(value);
}

export function buildGolfBagClubInsert(input: {
  clubTypeLabel: string;
  brandLabel: string;
  modelLabel: string;
  loftLabel: string;
  shaft: string;
  flexLabel: string;
  carryYards: string;
  totalYards: string;
  shotShapeLabel: string;
  confidence: number;
}): Omit<GolfBagClubInsert, "user_id"> {
  return {
    club_type: nz(input.clubTypeLabel),
    brand: nz(input.brandLabel),
    model: nz(input.modelLabel),
    loft: nz(input.loftLabel),
    shaft: nz(input.shaft),
    flex: nz(input.flexLabel),
    carry_distance: parseOptionalNumeric(input.carryYards),
    total_distance: parseOptionalNumeric(input.totalYards),
    shot_shape_tendency: nz(input.shotShapeLabel),
    confidence_rating: input.confidence,
  };
}
