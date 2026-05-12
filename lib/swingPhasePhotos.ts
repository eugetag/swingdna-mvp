/**
 * Swing phase photo uploads — Storage bucket `swing-photos` + table `swing_phase_photos`.
 */

export const SWING_PHOTO_BUCKET = "swing-photos" as const;

export const SWING_PHASE_NAMES = [
  "setup",
  "takeaway",
  "backswing",
  "transition",
  "downswing",
  "impact",
  "follow_through",
] as const;

export type SwingPhaseName = (typeof SWING_PHASE_NAMES)[number];

export const SWING_PHASE_LABELS: Record<SwingPhaseName, string> = {
  setup: "Setup",
  takeaway: "Takeaway",
  backswing: "Backswing",
  transition: "Transition",
  downswing: "Downswing",
  impact: "Impact",
  follow_through: "Follow-through",
};

export type SwingPhasePhotoRow = {
  id: string;
  created_at: string;
  user_id: string;
  phase_name: SwingPhaseName;
  image_url: string;
  notes: string | null;
};

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function extFromFile(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXT.has(fromName)) return fromName === "jpeg" ? "jpg" : fromName;
  const mime = file.type.split("/").pop()?.toLowerCase();
  if (mime === "jpeg" || mime === "jpg") return "jpg";
  if (mime && ALLOWED_EXT.has(mime)) return mime;
  return null;
}

/** Storage object path: `{userId}/{phase}.{ext}` */
export function buildSwingPhotoStoragePath(userId: string, phase: SwingPhaseName, file: File): string | null {
  const ext = extFromFile(file);
  if (!ext) return null;
  return `${userId}/${phase}.${ext}`;
}
