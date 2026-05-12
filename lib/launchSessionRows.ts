/**
 * Inserts for `launch_sessions` and `launch_shots` — column names match Supabase schema.
 */

import { trimStringish } from "@/lib/trimStringish";
export type LaunchSessionInsert = {
  user_id: string;
  session_title: string | null;
  session_date: string;
  environment: string;
  launch_monitor: string;
  notes: string | null;
};

export type LaunchShotInsert = {
  user_id: string;
  session_id: string;
  club_used: string;
  ball_speed: number | null;
  club_speed: number | null;
  smash_factor: number | null;
  carry_distance: number | null;
  total_distance: number | null;
  spin_rate: number | null;
  launch_angle: number | null;
  apex: number | null;
  attack_angle: number | null;
  club_path: number | null;
  face_angle: number | null;
  shot_shape: string | null;
  strike_quality: string | null;
  miss_direction: string | null;
  notes: string | null;
};

export type SessionSnapshotForInsert = {
  title: string;
  date: string;
  environment: string;
  launchMonitorLabel: string;
  notes: string;
};

export type ShotSnapshotForInsert = {
  club: string;
  ballSpeed: string;
  clubSpeed: string;
  smashFactor: string;
  carryYards: string;
  totalYards: string;
  spinRpm: string;
  launchAngle: string;
  apexYards: string;
  attackAngle: string;
  clubPath: string;
  faceAngle: string;
  shotShapeLabel: string;
  strikeQualityLabel: string;
  missDirectionLabel: string;
  shotNotes: string;
};

function parseOptionalNumeric(value: unknown): number | null {
  const t = trimStringish(value);
  if (t === "") return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function emptyToNull(value: unknown): string | null {
  const t = trimStringish(value);
  return t === "" ? null : t;
}

export function buildLaunchSessionInsert(meta: SessionSnapshotForInsert): Omit<LaunchSessionInsert, "user_id"> {
  return {
    session_title: emptyToNull(meta.title),
    session_date: meta.date,
    environment: meta.environment,
    launch_monitor: trimStringish(meta.launchMonitorLabel),
    notes: emptyToNull(meta.notes),
  };
}

export function buildLaunchShotInsert(
  shot: ShotSnapshotForInsert,
  sessionId: string,
): Omit<LaunchShotInsert, "user_id"> {
  return {
    session_id: sessionId,
    club_used: shot.club,
    ball_speed: parseOptionalNumeric(shot.ballSpeed),
    club_speed: parseOptionalNumeric(shot.clubSpeed),
    smash_factor: parseOptionalNumeric(shot.smashFactor),
    carry_distance: parseOptionalNumeric(shot.carryYards),
    total_distance: parseOptionalNumeric(shot.totalYards),
    spin_rate: parseOptionalNumeric(shot.spinRpm),
    launch_angle: parseOptionalNumeric(shot.launchAngle),
    apex: parseOptionalNumeric(shot.apexYards),
    attack_angle: parseOptionalNumeric(shot.attackAngle),
    club_path: parseOptionalNumeric(shot.clubPath),
    face_angle: parseOptionalNumeric(shot.faceAngle),
    shot_shape: emptyToNull(shot.shotShapeLabel),
    strike_quality: emptyToNull(shot.strikeQualityLabel),
    miss_direction: emptyToNull(shot.missDirectionLabel),
    notes: emptyToNull(shot.shotNotes),
  };
}

export function buildLaunchShotInserts(
  shots: ShotSnapshotForInsert[],
  sessionId: string,
): Omit<LaunchShotInsert, "user_id">[] {
  return shots.map((s) => buildLaunchShotInsert(s, sessionId));
}
