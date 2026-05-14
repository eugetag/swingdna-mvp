import type { SupabaseClient } from "@supabase/supabase-js";
import type { SwingPhasePhotoRow } from "@/lib/swingPhasePhotos";
import { trimStringish } from "@/lib/trimStringish";

/** Rows as returned from Supabase (snake_case). */
export type GolferProfileRow = {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  name: string | null;
  handicap: string | null;
  dominant_hand: string | null;
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
  subscription_tier?: string | null;
  advanced_ai_analysis_count?: number | null;
  swing_analysis_count?: number | null;
  ai_usage_month_key?: string | null;
};

export type GolfBagClubRow = {
  id: string;
  created_at: string;
  user_id: string;
  club_type: string | null;
  brand: string | null;
  model: string | null;
  loft: string | null;
  shaft: string | null;
  flex: string | null;
  carry_distance: number | null;
  total_distance: number | null;
  shot_shape_tendency: string | null;
  confidence_rating: number | null;
};

export type LaunchSessionRow = {
  id: string;
  created_at: string;
  user_id: string;
  session_title: string | null;
  session_date: string | null;
  environment: string | null;
  launch_monitor: string | null;
  notes: string | null;
};

export type LaunchShotRow = {
  id: string;
  created_at: string;
  user_id: string;
  session_id: string;
  club_used: string | null;
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

export type ReportBundle = {
  profile: GolferProfileRow | null;
  bagClubs: GolfBagClubRow[];
  latestSession: LaunchSessionRow | null;
  sessionShots: LaunchShotRow[];
  swingPhasePhotos: SwingPhasePhotoRow[];
};

/** True when any player-measurement column is populated (for report / AI hints). */
export function profileHasMeasurementData(p: GolferProfileRow | null): boolean {
  if (!p) return false;
  const nums: (number | null | undefined)[] = [
    p.age,
    p.height,
    p.weight,
    p.flexibility_score,
    p.waist_measurement,
    p.inseam,
    p.arm_length,
    p.wrist_to_floor,
    p.shoulder_width,
  ];
  if (nums.some((x) => x != null && Number.isFinite(Number(x)))) return true;
  const strs = [p.body_type, p.shoe_size, p.athletic_background, p.injury_notes, p.fitting_notes];
  return strs.some((s) => trimStringish(s) !== "");
}

export type SessionAggregates = {
  shotCount: number;
  avgCarry: number | null;
  avgBallSpeed: number | null;
  avgClubSpeed: number | null;
  avgSmash: number | null;
  avgSpin: number | null;
  commonMissDirection: string | null;
  mostUsedClub: string | null;
  strongestClubByCarry: { club: string; avgCarry: number; count: number } | null;
  weakestClubByConsistency: { club: string; cv: number; count: number } | null;
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdSample(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m === null) return null;
  const v = values.reduce((s, x) => s + (x - m) * (x - m), 0) / (values.length - 1);
  return Math.sqrt(v);
}

export function humanizeToken(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function modeString(values: (string | number | null | undefined)[]): string | null {
  const filtered = values.filter((v) => trimStringish(v) !== "");
  if (filtered.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of filtered) {
    const k = trimStringish(v);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [k, n] of counts) {
    if (n > bestN) {
      bestN = n;
      best = k;
    }
  }
  return best;
}

export function computeSessionAggregates(shots: LaunchShotRow[]): SessionAggregates {
  const shotCount = shots.length;
  const carries = shots.map((s) => s.carry_distance).filter((n): n is number => n != null && Number.isFinite(n));
  const ball = shots.map((s) => s.ball_speed).filter((n): n is number => n != null && Number.isFinite(n));
  const club = shots.map((s) => s.club_speed).filter((n): n is number => n != null && Number.isFinite(n));
  const smash = shots.map((s) => s.smash_factor).filter((n): n is number => n != null && Number.isFinite(n));
  const spin = shots.map((s) => s.spin_rate).filter((n): n is number => n != null && Number.isFinite(n));

  const byClub = new Map<string, number[]>();
  for (const s of shots) {
    const c = trimStringish(s.club_used);
    if (!c) continue;
    const cd = s.carry_distance;
    if (cd == null || !Number.isFinite(cd)) continue;
    if (!byClub.has(c)) byClub.set(c, []);
    byClub.get(c)!.push(cd);
  }

  let strongest: { club: string; avgCarry: number; count: number } | null = null;
  for (const [club, arr] of byClub) {
    if (arr.length === 0) continue;
    const avg = mean(arr)!;
    if (!strongest || avg > strongest.avgCarry) {
      strongest = { club, avgCarry: avg, count: arr.length };
    }
  }

  let weakest: { club: string; cv: number; count: number } | null = null;
  for (const [club, arr] of byClub) {
    if (arr.length < 2) continue;
    const m = mean(arr)!;
    const sd = stdSample(arr);
    if (sd == null || m <= 0) continue;
    const cv = sd / m;
    if (!weakest || cv > weakest.cv) {
      weakest = { club, cv, count: arr.length };
    }
  }

  const mostUsedClub = modeString(shots.map((s) => s.club_used));

  return {
    shotCount,
    avgCarry: mean(carries),
    avgBallSpeed: mean(ball),
    avgClubSpeed: mean(club),
    avgSmash: mean(smash),
    avgSpin: mean(spin),
    commonMissDirection: modeString(shots.map((s) => s.miss_direction)),
    mostUsedClub,
    strongestClubByCarry: strongest,
    weakestClubByConsistency: weakest,
  };
}

function fmt1(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}

function fmt0(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return Math.round(n).toString();
}

export function sessionHighlightCards(agg: SessionAggregates): { label: string; value: string; delta: string }[] {
  return [
    {
      label: "Avg carry (session)",
      value: agg.avgCarry != null ? `${fmt1(agg.avgCarry)} yd` : "—",
      delta: agg.shotCount > 0 ? `${agg.shotCount} tracked shots` : "No carry data",
    },
    {
      label: "Avg ball speed",
      value: agg.avgBallSpeed != null ? `${fmt1(agg.avgBallSpeed)} mph` : "—",
      delta: agg.avgClubSpeed != null ? `Club ${fmt1(agg.avgClubSpeed)} mph` : "—",
    },
    {
      label: "Avg smash factor",
      value: agg.avgSmash != null ? fmt2(agg.avgSmash) : "—",
      delta: agg.avgSpin != null ? `Spin ${fmt0(agg.avgSpin)} rpm` : "Spin —",
    },
  ];
}

function fmt2(n: number): string {
  return n.toFixed(2);
}

function isLongIronClub(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("4-iron") ||
    n.includes("5-iron") ||
    n.includes("3-iron") ||
    n.includes("2-iron") ||
    n.includes("4 iron") ||
    n.includes("5 iron")
  );
}

function isWedgeClub(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("wedge") || n === "pw" || n.includes("gw") || n.includes("sw") || n.includes("lw");
}

function isWoodOrDriver(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("driver") || n.includes("wood") || n.includes("hybrid");
}

export type TendencyCard = { title: string; severity: "High" | "Med" | "Low"; detail: string };

export function buildTendencyCards(
  profile: GolferProfileRow | null,
  agg: SessionAggregates,
  shots: LaunchShotRow[],
): TendencyCard[] {
  const out: TendencyCard[] = [];

  const sevenIron = shots.filter((s) => s.club_used && /7-iron|7 iron/i.test(s.club_used));
  if (sevenIron.length >= 3) {
    const shapes = sevenIron.map((s) => s.shot_shape).filter(Boolean) as string[];
    const fadeish = shapes.filter((s) => /fade|push/i.test(s)).length;
    if (fadeish >= Math.ceil(sevenIron.length * 0.4)) {
      out.push({
        title: "Your 7-iron window favors a push-fade tendency",
        severity: "Med",
        detail:
          "Start lines cluster with a fade-family curvature in this log. Own it as a stock flight, then rehearse one draw-release rep every five balls to stay balanced.",
      });
    }
  }

  const miss = agg.commonMissDirection;
  const shapeMode = modeString(shots.map((s) => s.shot_shape));
  if (miss && (miss.toLowerCase().includes("right") || miss.toLowerCase().includes("fade"))) {
    out.push({
      title: "Miss bias leans right / fade side",
      severity: "Med",
      detail: `Across this session, "${miss}" showed up most often. Pair start-line gates with tempo checkpoints before speed ramps.`,
    });
  } else if (miss && (miss.toLowerCase().includes("left") || miss.toLowerCase().includes("pull"))) {
    out.push({
      title: "Miss bias leans left",
      severity: "Med",
      detail: `Your dominant miss direction was "${miss}". Track face-to-path on video or LM to see if it's start line or curvature.`,
    });
  } else if (shapeMode) {
    out.push({
      title: `Shot shape cluster: ${shapeMode}`,
      severity: "Low",
      detail:
        "Pattern is readable — use it as a stock shot when pressure rises, but rehearse the opposite curve once per block to stay adjustable.",
    });
  }

  const longIronShots = shots.filter((s) => s.club_used && isLongIronClub(s.club_used));
  const wedgeShots = shots.filter((s) => s.club_used && isWedgeClub(s.club_used));
  const longIronSpin = longIronShots.map((s) => s.spin_rate).filter((n): n is number => n != null && Number.isFinite(n));
  const wedgeSpinArr = wedgeShots.map((s) => s.spin_rate).filter((n): n is number => n != null && Number.isFinite(n));
  const liMean = mean(longIronSpin);
  const wMean = mean(wedgeSpinArr);
  if (liMean != null && wMean != null && wMean > liMean * 1.15 && longIronShots.length >= 2) {
    out.push({
      title: "Spin consistency drops significantly on longer irons",
      severity: "Med",
      detail:
        "Long-iron spin sits lower relative to wedges in this log — normal to an extent, but watch thin contact if launch drops with it.",
    });
  }

  const midIronSmash = mean(
    shots
      .filter((s) => s.club_used && /6-iron|7-iron|8-iron/i.test(s.club_used))
      .map((s) => s.smash_factor)
      .filter((n): n is number => n != null && Number.isFinite(n)),
  );
  const woodSmash = mean(
    shots
      .filter((s) => s.club_used && isWoodOrDriver(s.club_used))
      .map((s) => s.smash_factor)
      .filter((n): n is number => n != null && Number.isFinite(n)),
  );
  if (midIronSmash != null && woodSmash != null && midIronSmash > woodSmash + 0.04) {
    out.push({
      title: "Smash factor efficiency is strongest with mid-irons",
      severity: "Low",
      detail:
        "Your iron delivery is converting speed into ball speed efficiently. Use that feel as a reference when rehearsing driver contact.",
    });
  }

  if (profile?.common_miss) {
    out.push({
      title: "Profile vs session alignment",
      severity: "Low",
      detail: `Your profile lists "${profile.common_miss}". Compare to session miss trends — if they diverge, update profile after big swing changes.`,
    });
  }

  if (out.length === 0) {
    out.push({
      title: "Build a denser shot log",
      severity: "Low",
      detail:
        "Log 15+ shots across two clubs minimum to unlock dispersion and spin storylines. Mixed blocks beat single-club marathons for AI reads.",
    });
  }

  return out.slice(0, 6);
}

export function buildSwingInsights(agg: SessionAggregates, shots: LaunchShotRow[]): string[] {
  const lines: string[] = [];
  const pathVals = shots.map((s) => s.club_path).filter((n): n is number => n != null && Number.isFinite(n));
  const faceVals = shots.map((s) => s.face_angle).filter((n): n is number => n != null && Number.isFinite(n));
  const pathAvg = mean(pathVals);
  const faceAvg = mean(faceVals);
  if (pathAvg != null && faceAvg != null) {
    lines.push(
      `Average club path ${pathAvg >= 0 ? "+" : ""}${pathAvg.toFixed(1)}° vs face ${faceAvg >= 0 ? "+" : ""}${faceAvg.toFixed(1)}° — start line and curvature will follow this relationship on centered strikes.`,
    );
  }
  if (agg.avgSmash != null) {
    lines.push(`Session average smash factor ${agg.avgSmash.toFixed(2)} — compare by club in the table below to spot energy leaks.`);
  }
  const aoa = mean(shots.map((s) => s.attack_angle).filter((n): n is number => n != null && Number.isFinite(n)));
  if (aoa != null) {
    lines.push(
      `Attack angle averages ${aoa >= 0 ? "+" : ""}${aoa.toFixed(1)}° — pair with launch and spin windows when tuning driver vs iron delivery.`,
    );
  }
  if (lines.length === 0) {
    lines.push("Add path, face, and AoA fields in Sessions to unlock automatic impact geometry commentary on this report.");
  }
  return lines;
}

export function buildGappingBullets(bag: GolfBagClubRow[]): { summary: string; bullets: string[] } {
  const withCarry = bag
    .map((c) => ({
      label: [c.club_type, c.brand, c.model].filter(Boolean).join(" · ") || "Club",
      carry: c.carry_distance,
    }))
    .filter((x) => x.carry != null && Number.isFinite(x.carry))
    .sort((a, b) => (b.carry ?? 0) - (a.carry ?? 0));

  if (withCarry.length < 2) {
    return {
      summary:
        withCarry.length === 1
          ? "One club in your bag has a logged carry — add carries to more clubs to expose gapping windows."
          : "Log carry distances on your bag clubs to generate automatic gapping commentary.",
      bullets: ["Open /bag and enter carry (and total) for each stick you rely on from 120 yards and in."],
    };
  }

  const bullets: string[] = [];
  for (let i = 0; i < withCarry.length - 1; i++) {
    const a = withCarry[i];
    const b = withCarry[i + 1];
    const gap = (a.carry ?? 0) - (b.carry ?? 0);
    if (gap > 18) {
      bullets.push(`${gap.toFixed(0)} yd gap between ${a.label} (${a.carry} yd) and ${b.label} (${b.carry} yd) — verify scoring yardages in that window.`);
    }
  }
  if (bullets.length === 0) {
    bullets.push("Carry steps look reasonably tight on paper — validate with on-course GPS or a trusted LM block.");
  }

  return {
    summary: "Carry-ordered view of your saved bag — large drops flag scoring gaps you feel on the course.",
    bullets: bullets.slice(0, 5),
  };
}

export function avgBagConfidence(bag: GolfBagClubRow[]): number | null {
  const vals = bag.map((c) => c.confidence_rating).filter((n): n is number => n != null && Number.isFinite(n));
  return mean(vals);
}

export function buildPracticePriorities(
  profile: GolferProfileRow | null,
  agg: SessionAggregates,
  weakest: SessionAggregates["weakestClubByConsistency"],
): { rank: number; title: string; detail: string }[] {
  const out: { rank: number; title: string; detail: string }[] = [];

  if (weakest) {
    out.push({
      rank: 1,
      title: `Stabilize ${weakest.club} carry dispersion`,
      detail: `Highest relative inconsistency in this session (CV ${(weakest.cv * 100).toFixed(0)}%). Small bucket, same tempo, stop after 8 quality reps.`,
    });
  }

  if (agg.commonMissDirection) {
    out.push({
      rank: out.length + 1,
      title: `Neutralize "${agg.commonMissDirection}" starts`,
      detail: "Use alignment sticks + intermediate targets; alternate 3 stock swings with 3 rehearsal swings.",
    });
  }

  if (profile?.primary_goal) {
    const goalLabel = humanizeToken(profile.primary_goal);
    out.push({
      rank: out.length + 1,
      title: `Progress toward: ${goalLabel}`,
      detail:
        trimStringish(profile.practice_frequency) ||
        "Match practice volume to your stated goal — short frequent blocks beat rare marathon sessions.",
    });
  }

  while (out.length < 3) {
    out.push({
      rank: out.length + 1,
      title: "Log another mixed session",
      detail: "Pair driver + mid-iron + wedge in one LM export so this report can contrast delivery patterns.",
    });
  }

  return out.slice(0, 3);
}

export function buildEquipmentNotes(bag: GolfBagClubRow[]): string[] {
  const notes: string[] = [];
  const flexes = new Set(bag.map((c) => c.flex).filter(Boolean));
  if (flexes.size > 1) {
    notes.push(`Multiple flex profiles in bag (${[...flexes].slice(0, 3).join(", ")}…) — confirm transition timing matches your release pattern.`);
  }
  const lowConf = bag.filter((c) => c.confidence_rating != null && c.confidence_rating <= 5);
  if (lowConf.length > 0) {
    const labels = lowConf.map((c) => c.club_type ?? "Club").slice(0, 3);
    notes.push(`Low confidence clubs: ${labels.join(", ")} — consider gapping audit or shaft profile review on those slots.`);
  }
  if (notes.length === 0) {
    notes.push("Bag specs look coherent — revisit after swing changes or if launch conditions shift (mat vs turf).");
  }
  return notes;
}

export function buildNextSessionPlan(agg: SessionAggregates): { duration: string; blocks: string[] } {
  const blocks: string[] = [
    "Warm-up (10m): mobility + 15 slow 7-irons with carry feedback.",
  ];
  if (agg.mostUsedClub) {
    blocks.push(`Primary block (25m): ${agg.mostUsedClub} — 3×8 ball ladder, same ball type, log spin + start line.`);
  } else {
    blocks.push("Primary block (25m): Mid-iron window — 8 shots per target line, track lateral miss.");
  }
  blocks.push(
    "Secondary (20m): Driver or fairway — 6 quality reps, pause if two consecutive poor strikes.",
    "Wedge (15m): Two partial swings + one full per yardage tier.",
    "Cool-down (10m): Speed putting or lag ladder.",
  );
  return { duration: agg.shotCount > 24 ? "90 minutes" : "75 minutes", blocks };
}

export async function fetchReportBundle(
  client: SupabaseClient,
  userId: string,
): Promise<{ bundle: ReportBundle; supabaseErrors: string[] }> {
  const supabaseErrors: string[] = [];

  const { data: profileRow, error: profileErr } = await client
    .from("golfer_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (profileErr) supabaseErrors.push(`golfer_profiles: ${profileErr.message}`);

  const { data: bagRows, error: bagErr } = await client
    .from("golf_bag_clubs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (bagErr) supabaseErrors.push(`golf_bag_clubs: ${bagErr.message}`);

  const { data: sessionRow, error: sessionErr } = await client
    .from("launch_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sessionErr) supabaseErrors.push(`launch_sessions: ${sessionErr.message}`);

  const profile = (profileRow ?? null) as GolferProfileRow | null;
  const bagClubs = (bagRows ?? []) as GolfBagClubRow[];
  const latestSession = (sessionRow ?? null) as LaunchSessionRow | null;

  let sessionShots: LaunchShotRow[] = [];
  if (latestSession?.id) {
    const { data: shotRows, error: shotsErr } = await client
      .from("launch_shots")
      .select("*")
      .eq("user_id", userId)
      .eq("session_id", latestSession.id)
      .order("created_at", { ascending: true });
    if (shotsErr) supabaseErrors.push(`launch_shots: ${shotsErr.message}`);
    else sessionShots = (shotRows ?? []) as LaunchShotRow[];
  }

  const { data: photoRows, error: photosErr } = await client
    .from("swing_phase_photos")
    .select("*")
    .eq("user_id", userId)
    .order("phase_name", { ascending: true });
  if (photosErr) supabaseErrors.push(`swing_phase_photos: ${photosErr.message}`);
  const swingPhasePhotos = (photoRows ?? []) as SwingPhasePhotoRow[];

  return {
    bundle: { profile, bagClubs, latestSession, sessionShots, swingPhasePhotos },
    supabaseErrors,
  };
}

export function hasAnyReportData(bundle: ReportBundle): boolean {
  return (
    bundle.profile != null ||
    bundle.bagClubs.length > 0 ||
    bundle.latestSession != null ||
    bundle.sessionShots.length > 0 ||
    bundle.swingPhasePhotos.length > 0
  );
}

export function buildDnaRead(
  profile: GolferProfileRow | null,
  agg: SessionAggregates,
  bagAvgConf: number | null,
): string {
  const parts: string[] = [];
  if (agg.shotCount > 0) {
    parts.push(`This brief reads ${agg.shotCount} shots from your latest LM session.`);
  }
  if (agg.avgSmash != null && agg.avgSmash >= 1.42) {
    parts.push("Center-face efficiency looks tour-adjacent on average — protect that quality under fatigue.");
  } else if (agg.avgSmash != null && agg.avgSmash < 1.35) {
    parts.push("Smash factor skews soft — prioritize strike quality before chasing more club speed.");
  }
  if (bagAvgConf != null && bagAvgConf >= 7.5) {
    parts.push("Your saved bag shows high confidence across slots — lean on those clubs in competition blocks.");
  } else if (bagAvgConf != null && bagAvgConf < 6) {
    parts.push("Bag confidence runs cool in spots — consider a gapping session or shaft audit on low-confidence heads.");
  }
  if (profile?.primary_goal) {
    parts.push(`Primary stated goal: ${humanizeToken(profile.primary_goal)}.`);
  }
  if (profile && profileHasMeasurementData(profile)) {
    parts.push("Saved fitting measurements add depth for equipment and movement reads.");
  }
  if (parts.length === 0) {
    return "Log profile, bag carries, and a mixed LM session to unlock a richer SwingDNA read.";
  }
  return parts.join(" ");
}

export function deriveStrongestScore(
  strongest: SessionAggregates["strongestClubByCarry"],
  sessionAvgCarry: number | null,
): number {
  if (!strongest) return 7.0;
  let base = 6.5 + Math.min(1.5, strongest.count * 0.12);
  if (sessionAvgCarry != null && strongest.avgCarry >= sessionAvgCarry + 5) {
    base += 0.8;
  }
  return Math.min(9.6, Math.round(base * 10) / 10);
}

export function deriveWeakestScore(weakest: SessionAggregates["weakestClubByConsistency"]): number {
  if (!weakest) return 6.0;
  const raw = 9.2 - Math.min(4.5, weakest.cv * 22);
  return Math.max(3.5, Math.min(7.2, Math.round(raw * 10) / 10));
}
