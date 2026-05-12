/**
 * Map a Supabase `golf_bag_clubs` row back into the /bag form draft shape.
 * Rows store display labels; we best-effort match catalog IDs, else use custom sentinels.
 */
import {
  CATEGORY_LABELS,
  CONFIDENCE_OPTIONS,
  FLEX_OPTIONS,
  SHOT_SHAPE_OPTIONS,
  type BagClubCategory,
  getBrands,
  getLofts,
  getModels,
} from "@/lib/golf-bag-catalog";
import type { GolfBagClubRow } from "@/lib/reportAnalytics";
import { trimStringish } from "@/lib/trimStringish";

export const BAG_CUSTOM_BRAND = "__sdn_custom_brand__";
export const BAG_CUSTOM_MODEL = "__sdn_custom_model__";
export const BAG_CUSTOM_LOFT = "__sdn_custom_loft__";

export type BagFlexId = (typeof FLEX_OPTIONS)[number]["id"];
export type BagShotShapeId = (typeof SHOT_SHAPE_OPTIONS)[number]["id"];
export type BagConfidence = (typeof CONFIDENCE_OPTIONS)[number];

export type BagClubDraftFromRow = {
  clubCategory: BagClubCategory | "";
  brandId: string;
  brandCustomDetail: string;
  customBrandModel: string;
  modelId: string;
  modelCustomDetail: string;
  loftPreset: string;
  loftCustomDetail: string;
  shaft: string;
  flex: BagFlexId | "";
  carryYards: string;
  totalYards: string;
  shotShape: BagShotShapeId | "";
  confidence: BagConfidence | "";
};

function categoryFromClubType(clubType: string | null): BagClubCategory | "" {
  const t = trimStringish(clubType);
  if (!t) return "";
  const keys = Object.keys(CATEGORY_LABELS) as BagClubCategory[];
  const byLabel = keys.find((k) => CATEGORY_LABELS[k] === t);
  if (byLabel) return byLabel;
  return keys.find((k) => k === t.toLowerCase()) ?? "";
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function flexIdFromLabel(label: string | null): BagFlexId | "" {
  const t = trimStringish(label);
  if (!t) return "";
  const hit = FLEX_OPTIONS.find((x) => norm(x.label) === norm(t));
  return hit?.id ?? "";
}

function shotShapeIdFromLabel(label: string | null): BagShotShapeId | "" {
  const t = trimStringish(label);
  if (!t) return "";
  const hit = SHOT_SHAPE_OPTIONS.find((x) => norm(x.label) === norm(t));
  return hit?.id ?? "";
}

export function golfBagClubRowToDraft(row: GolfBagClubRow): BagClubDraftFromRow {
  const clubCategory = categoryFromClubType(row.club_type);
  const brandLabel = trimStringish(row.brand);
  const modelLabel = trimStringish(row.model);
  const loftLabel = trimStringish(row.loft);
  const shaft = trimStringish(row.shaft);
  const carryYards =
    row.carry_distance != null && Number.isFinite(Number(row.carry_distance))
      ? String(row.carry_distance)
      : "";
  const totalYards =
    row.total_distance != null && Number.isFinite(Number(row.total_distance))
      ? String(row.total_distance)
      : "";
  const confidence =
    row.confidence_rating != null &&
    Number.isFinite(row.confidence_rating) &&
    row.confidence_rating >= 1 &&
    row.confidence_rating <= 10
      ? (Math.round(row.confidence_rating) as BagConfidence)
      : "";

  let brandId = "";
  let brandCustomDetail = "";
  let customBrandModel = "";
  let modelId = "";
  let modelCustomDetail = "";
  let loftPreset = "";
  let loftCustomDetail = "";

  if (!clubCategory) {
    return {
      clubCategory: "",
      brandId: "",
      brandCustomDetail: brandLabel,
      customBrandModel: modelLabel,
      modelId: BAG_CUSTOM_MODEL,
      modelCustomDetail: modelLabel,
      loftPreset: BAG_CUSTOM_LOFT,
      loftCustomDetail: loftLabel,
      shaft,
      flex: flexIdFromLabel(row.flex),
      carryYards,
      totalYards,
      shotShape: shotShapeIdFromLabel(row.shot_shape_tendency),
      confidence,
    };
  }

  const brands = getBrands(clubCategory);
  const brandHit = brands.find((b) => norm(b.label) === norm(brandLabel) || b.id === brandLabel);

  if (!brandHit) {
    return {
      clubCategory,
      brandId: BAG_CUSTOM_BRAND,
      brandCustomDetail: brandLabel,
      customBrandModel: modelLabel,
      modelId: BAG_CUSTOM_MODEL,
      modelCustomDetail: modelLabel,
      loftPreset: BAG_CUSTOM_LOFT,
      loftCustomDetail: loftLabel,
      shaft,
      flex: flexIdFromLabel(row.flex),
      carryYards,
      totalYards,
      shotShape: shotShapeIdFromLabel(row.shot_shape_tendency),
      confidence,
    };
  }

  brandId = brandHit.id;
  const models = getModels(clubCategory, brandId);
  const modelHit = models.find((m) => norm(m.label) === norm(modelLabel) || m.id === modelLabel);

  if (!modelHit) {
    return {
      clubCategory,
      brandId,
      brandCustomDetail: "",
      customBrandModel: "",
      modelId: BAG_CUSTOM_MODEL,
      modelCustomDetail: modelLabel,
      loftPreset: BAG_CUSTOM_LOFT,
      loftCustomDetail: loftLabel,
      shaft,
      flex: flexIdFromLabel(row.flex),
      carryYards,
      totalYards,
      shotShape: shotShapeIdFromLabel(row.shot_shape_tendency),
      confidence,
    };
  }

  modelId = modelHit.id;
  const catalogLofts = getLofts(clubCategory, brandId, modelId);
  if (loftLabel && catalogLofts.some((L) => L === loftLabel)) {
    loftPreset = loftLabel;
  } else if (loftLabel) {
    loftPreset = BAG_CUSTOM_LOFT;
    loftCustomDetail = loftLabel;
  }

  return {
    clubCategory,
    brandId,
    brandCustomDetail: "",
    customBrandModel: "",
    modelId,
    modelCustomDetail: "",
    loftPreset,
    loftCustomDetail,
    shaft,
    flex: flexIdFromLabel(row.flex),
    carryYards,
    totalYards,
    shotShape: shotShapeIdFromLabel(row.shot_shape_tendency),
    confidence,
  };
}
