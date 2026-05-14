/**
 * Illustrative demo content only — not tied to any real user, session, or database row.
 */

export const demoGolfer = {
  displayName: "Jordan Mercer",
  persona: "Illustrative competitive mid-am",
  handicapIndex: "8.4",
  typicalScore: "76–82",
  dominantHand: "Right" as const,
  commonMiss: "Push fade under pressure",
  primaryGoal: "Tighten scoring-club dispersion and own the 125–160 window",
  practiceFrequency: "4 range sessions / week",
  driverCarryYds: 265,
  threeWoodCarryYds: 238,
  fiveIronCarryYds: 192,
  sevenIronCarryYds: 168,
  pitchingWedgeCarryYds: 128,
  swingSpeedMph: 102,
  swingNotes:
    "Works the ball both ways on command at the range; on-course default is a high soft cut. Feels 'handsy' when legs get quiet on long iron approaches.",
  measurements: {
    height: `6'1"`,
    weightLbs: 182,
    wristToFloor: `36.5"`,
    wingspan: `74"`,
    flexibility: "7 / 10",
    injuryContext: "Minor left hip tightness — monitored with warm-up emphasis",
  },
} as const;

export const demoSession = {
  title: "Range — baseline iron audit",
  date: "April 12, 2026",
  environment: "Outdoor range · light crosswind",
  launchMonitor: "Trackman 4 (illustrative export)",
  shotCount: 24,
  notes: "Focused on 6i–PW ladders and stock vs. knockdown windows. Demo session for narrative only.",
} as const;

export type DemoBagClub = {
  category: string;
  brandModel: string;
  carryYds: number;
  totalYds: number;
  confidence: "High" | "Medium" | "Building";
  tendency: string;
};

export const demoBagClubs: readonly DemoBagClub[] = [
  {
    category: "Driver",
    brandModel: "Illustrative 9° · tour-stiff shaft",
    carryYds: 265,
    totalYds: 288,
    confidence: "High",
    tendency: "High draw when committed; leak right when tempo rushes",
  },
  {
    category: "3-wood",
    brandModel: "Illustrative 15°",
    carryYds: 238,
    totalYds: 258,
    confidence: "High",
    tendency: "Preferred fairway finder off short par 4s",
  },
  {
    category: "5-iron",
    brandModel: "Illustrative players cavity",
    carryYds: 192,
    totalYds: 202,
    confidence: "Medium",
    tendency: "Push-fade bias when lower body stalls",
  },
  {
    category: "7-iron",
    brandModel: "Illustrative players cavity",
    carryYds: 168,
    totalYds: 176,
    confidence: "High",
    tendency: "Stock start line 3–5 yds left of pin",
  },
  {
    category: "9-iron",
    brandModel: "Illustrative blade-cavity blend",
    carryYds: 148,
    totalYds: 155,
    confidence: "High",
    tendency: "High flight; reliable into tucked pins",
  },
  {
    category: "Pitching wedge",
    brandModel: "Illustrative 46°",
    carryYds: 128,
    totalYds: 132,
    confidence: "Building",
    tendency: "Distance control improving; start-line discipline is the focus",
  },
] as const;

export type DemoShot = {
  club: string;
  carryYds: number;
  ballSpeedMph: number;
  spinRpm: number;
  launchDeg: number;
  shape: string;
};

export const demoIronShots: readonly DemoShot[] = [
  { club: "7i", carryYds: 171, ballSpeedMph: 112, spinRpm: 6230, launchDeg: 18.2, shape: "Soft draw" },
  { club: "7i", carryYds: 166, ballSpeedMph: 110, spinRpm: 6580, launchDeg: 17.4, shape: "Straight" },
  { club: "7i", carryYds: 168, ballSpeedMph: 111, spinRpm: 6310, launchDeg: 17.9, shape: "Push-fade" },
  { club: "PW", carryYds: 126, ballSpeedMph: 96, spinRpm: 8420, launchDeg: 26.1, shape: "High straight" },
  { club: "PW", carryYds: 130, ballSpeedMph: 97, spinRpm: 7980, launchDeg: 25.4, shape: "Soft draw" },
] as const;

export const demoSwingPhases = [
  { phase: "Setup", note: "Athletic posture; ball position neutral with irons." },
  { phase: "Takeaway", note: "Wide, on-plane — clubhead tracks slightly inside." },
  { phase: "Backswing", note: "Full shoulder turn; short arm swing keeps face stable." },
  { phase: "Transition", note: "Pressure shifts left; slight early upper-body drift on demand shots." },
  { phase: "Downswing", note: "Shallowing works until lower body decelerates — then face hangs open." },
  { phase: "Impact", note: "Clean strike when sequence fires; spin loft rises on defensive swings." },
  { phase: "Follow-through", note: "Balanced finish when commitment matches intent." },
] as const;

export const demoAiSwingInsights = [
  {
    title: "Pattern recognition",
    body: "Your swing pattern suggests the miss shows up when the lower body stalls and the face stays slightly open through impact — especially on approaches where you guide the ball instead of committing.",
    accent: "emerald" as const,
  },
  {
    title: "Ball flight signature",
    body: "Launch monitor samples cluster with a gentle left-to-right shape under pressure. That matches your on-course tendency toward a push-fade when tempo creeps quick from the top.",
    accent: "sky" as const,
  },
  {
    title: "Scoring window",
    body: "Mid-irons look trustworthy; the biggest stroke-cost risk is leaving wedges short and right when the wind asks for a softer curve than your stock shot.",
    accent: "amber" as const,
  },
] as const;

export const demoGappingSummary =
  "Your 7 iron carry band is strong and repeatable. The illustration highlights a scoring gap from roughly 125 to 155 yards where carry dispersion widens — a classic place to tighten wedge and short-iron rehearsal so the course plays shorter than the card suggests.";

export const demoPracticePlan = [
  { block: "Tempo wedges", duration: "20 min", detail: "Half-swings to full, alternating stock vs. knockdown feel. Goal: predictable flight window." },
  { block: "Start-line gates", duration: "15 min", detail: "Two-tee gate at 15 yards; 10 balls per start line. Reward a neutral face release." },
  { block: "Contact quality", duration: "10 min", detail: "Low point control with 9i — brush the tee forward, not up." },
] as const;

export const demoEquipmentRecommendations = [
  "Keep the 7 iron in the bag as your confidence club — data supports it as the hub of your approach game.",
  "Consider a gap solution between your pitching wedge carry and your stock 9 iron that you trust in firm conditions (illustrative fitting note only).",
  "Shaft profile in long irons: prioritize stable handle without losing feel — your tempo rewards a slightly softer handle section if you chase more closure.",
] as const;

export const demoCaddiePreview =
  "On-course, SwingDNA would recommend aiming center-green when your push-fade miss brings short-right trouble into play — especially on tucked pins with wind off the left. Trust the mid-left half of the green as a win, then let speed handle the rest.";
