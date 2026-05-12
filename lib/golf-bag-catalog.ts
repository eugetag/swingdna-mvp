/**
 * Frontend-only sample catalog for /bag cascading dropdowns.
 * Model & loft lookups are scoped by club category + brand + model ID.
 */

export type BagClubCategory =
  | "driver"
  | "fairway_wood"
  | "hybrid"
  | "iron"
  | "wedge"
  | "putter";

export type CatalogBrandId =
  | "taylormade"
  | "callaway"
  | "titleist"
  | "ping"
  | "mizuno"
  | "srixon"
  | "cobra"
  | "odyssey";

export type CatalogModel = {
  id: string;
  label: string;
  lofts: string[];
};

export type CatalogBrand = {
  id: CatalogBrandId;
  label: string;
  models: CatalogModel[];
};

export type ClubCatalog = Record<BagClubCategory, CatalogBrand[]>;

const d = (lofts: string[]): string[] => lofts;

const driverLofts = {
  lowSpin: d(["8°", "8.5°", "9°", "9.5°", "10°", "10.5°"]),
  standard: d(["9°", "9.5°", "10°", "10.5°", "11°", "12°"]),
  highLaunch: d(["9°", "10.5°", "12°", "13.5°", "14°"]),
} as const;

export const CATEGORY_LABELS: Record<BagClubCategory, string> = {
  driver: "Driver",
  fairway_wood: "Fairway Wood",
  hybrid: "Hybrid",
  iron: "Iron",
  wedge: "Wedge",
  putter: "Putter",
};

export const FLEX_OPTIONS = [
  { id: "ladies", label: "Ladies" },
  { id: "senior", label: "Senior" },
  { id: "regular", label: "Regular" },
  { id: "stiff", label: "Stiff" },
  { id: "x_stiff", label: "X-Stiff" },
  { id: "tour_x", label: "Tour X" },
] as const;

export const SHOT_SHAPE_OPTIONS = [
  { id: "straight", label: "Straight" },
  { id: "fade", label: "Fade" },
  { id: "draw", label: "Draw" },
  { id: "slice", label: "Slice" },
  { id: "hook", label: "Hook" },
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "push_fade", label: "Push Fade" },
  { id: "pull_draw", label: "Pull Draw" },
] as const;

export const CONFIDENCE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Sample catalog keyed by SwingDNA club category */
export const GOLF_BAG_CATALOG: ClubCatalog = {
  driver: [
    {
      id: "taylormade",
      label: "TaylorMade",
      models: [
        { id: "qi10", label: "Qi10", lofts: [...driverLofts.standard] },
        { id: "qi10-ls", label: "Qi10 LS", lofts: [...driverLofts.lowSpin] },
        { id: "qi10-max", label: "Qi10 Max", lofts: [...driverLofts.highLaunch] },
        { id: "stealth-2", label: "Stealth 2", lofts: [...driverLofts.standard] },
        { id: "stealth-2-plus", label: "Stealth 2 Plus", lofts: [...driverLofts.lowSpin] },
      ],
    },
    {
      id: "callaway",
      label: "Callaway",
      models: [
        {
          id: "paradym-ai-smoke-max",
          label: "Paradym Ai Smoke Max",
          lofts: [...driverLofts.highLaunch],
        },
        {
          id: "paradym-ai-smoke-td",
          label: "Paradym Ai Smoke Triple Diamond",
          lofts: [...driverLofts.lowSpin],
        },
        { id: "elyte", label: "Elyte", lofts: [...driverLofts.standard] },
        {
          id: "elyte-triple-diamond",
          label: "Elyte Triple Diamond",
          lofts: [...driverLofts.lowSpin],
        },
      ],
    },
    {
      id: "titleist",
      label: "Titleist",
      models: [
        { id: "tsr2", label: "TSR2", lofts: [...driverLofts.highLaunch] },
        { id: "tsr3", label: "TSR3", lofts: [...driverLofts.lowSpin] },
        { id: "gt2", label: "GT2", lofts: [...driverLofts.standard] },
        { id: "gt3", label: "GT3", lofts: [...driverLofts.lowSpin] },
      ],
    },
    {
      id: "ping",
      label: "Ping",
      models: [
        { id: "g430-max", label: "G430 Max", lofts: [...driverLofts.highLaunch] },
        { id: "g430-lst", label: "G430 LST", lofts: [...driverLofts.lowSpin] },
        { id: "g440-max", label: "G440 Max", lofts: [...driverLofts.highLaunch] },
        { id: "g440-lst", label: "G440 LST", lofts: [...driverLofts.lowSpin] },
      ],
    },
    {
      id: "mizuno",
      label: "Mizuno",
      models: [
        { id: "st-z-230", label: "ST-Z 230", lofts: [...driverLofts.lowSpin] },
        { id: "st-x-230", label: "ST-X 230", lofts: [...driverLofts.standard] },
      ],
    },
    {
      id: "srixon",
      label: "Srixon",
      models: [
        { id: "zx5-mk2", label: "ZX5 Mk II", lofts: [...driverLofts.standard] },
        { id: "zx7-mk2", label: "ZX7 Mk II", lofts: [...driverLofts.lowSpin] },
      ],
    },
    {
      id: "cobra",
      label: "Cobra",
      models: [
        { id: "darkspeed-x", label: "DARKSPEED X", lofts: [...driverLofts.lowSpin] },
        { id: "darkspeed-max", label: "DARKSPEED MAX", lofts: [...driverLofts.highLaunch] },
      ],
    },
  ],

  fairway_wood: [
    {
      id: "taylormade",
      label: "TaylorMade",
      models: [
        {
          id: "qi10-fw",
          label: "Qi10 Fairway",
          lofts: d(["13.5°", "15°", "16.5°", "18°", "21°"]),
        },
        {
          id: "stealth-2-fw",
          label: "Stealth 2 Fairway",
          lofts: d(["15°", "16.5°", "18°", "21°"]),
        },
        { id: "sim2-fw", label: "SIM2 Fairway", lofts: d(["15°", "19°", "22°"]) },
      ],
    },
    {
      id: "callaway",
      label: "Callaway",
      models: [
        {
          id: "elyte-fw",
          label: "Elyte Fairway",
          lofts: d(["14°", "15°", "16.5°", "18°", "20°"]),
        },
        {
          id: "paradym-smoke-fw",
          label: "Paradym Ai Smoke Fairway",
          lofts: d(["15°", "16.5°", "18°", "21°"]),
        },
        { id: "mavrik-fw", label: "Mavrik Sub Zero", lofts: d(["13.5°", "15°", "18°"]) },
      ],
    },
    {
      id: "titleist",
      label: "Titleist",
      models: [
        { id: "tsr2-fw", label: "TSR2+", lofts: d(["13.5°", "15°", "16.5°", "18°"]) },
        { id: "tsr3-fw", label: "TSR3 Fairway", lofts: d(["13°", "15°", "16.5°"]) },
        { id: "gt2-fw", label: "GT2 Fairway", lofts: d(["15°", "18°", "21°"]) },
      ],
    },
    {
      id: "ping",
      label: "Ping",
      models: [
        { id: "g430-fw", label: "G430 Fairway", lofts: d(["14.5°", "15°", "18.5°", "20°"]) },
        { id: "g440-fw", label: "G440 Fairway", lofts: d(["14.5°", "15°", "18°", "20°"]) },
      ],
    },
    {
      id: "mizuno",
      label: "Mizuno",
      models: [
        { id: "st-z-fw", label: "ST-Z Fairway", lofts: d(["15°", "18°"]) },
        { id: "clk-hybrid-style-fw", label: "CLK Fli-Hi (strong)", lofts: d(["16°", "19°"]) },
      ],
    },
    {
      id: "srixon",
      label: "Srixon",
      models: [
        { id: "zx-fw", label: "ZX Mk II Fairway", lofts: d(["15°", "18°", "21°"]) },
      ],
    },
    {
      id: "cobra",
      label: "Cobra",
      models: [
        { id: "darkspeed-fw", label: "DARKSPEED Fairway", lofts: d(["15°", "18°", "21°"]) },
        { id: "sna-fw", label: "Snakebite FW", lofts: d(["14.5°", "18.5°"]) },
      ],
    },
  ],

  hybrid: [
    {
      id: "taylormade",
      label: "TaylorMade",
      models: [
        { id: "qi10-rescue", label: "Qi10 Rescue", lofts: d(["19°", "22°", "25°", "28°"]) },
        { id: "stealth-2-rescue", label: "Stealth 2 Rescue", lofts: d(["19°", "22°", "25°"]) },
      ],
    },
    {
      id: "callaway",
      label: "Callaway",
      models: [
        { id: "elyte-hybrid", label: "Elyte Hybrid", lofts: d(["18°", "21°", "24°", "27°"]) },
        { id: "apex-uw", label: "Apex UW", lofts: d(["17°", "19°", "21°"]) },
      ],
    },
    {
      id: "titleist",
      label: "Titleist",
      models: [
        { id: "tsr2-hyr", label: "TSR2 Hybrid", lofts: d(["18°", "21°", "24°"]) },
        { id: "tsr3-hyr", label: "TSR3 Hybrid", lofts: d(["19°", "22°"]) },
      ],
    },
    {
      id: "ping",
      label: "Ping",
      models: [
        { id: "g430-hyr", label: "G430 Hybrid", lofts: d(["19°", "22°", "26°", "28°"]) },
        { id: "crossover", label: "G Crossover", lofts: d(["18°", "20°", "23°"]) },
      ],
    },
    {
      id: "mizuno",
      label: "Mizuno",
      models: [{ id: "clk-hybrid", label: "CLK Hybrid", lofts: d(["19°", "22°", "25°"]) }],
    },
    {
      id: "srixon",
      label: "Srixon",
      models: [{ id: "zx-hybrid", label: "ZX Mk II Hybrid", lofts: d(["18°", "21°", "24°"]) }],
    },
    {
      id: "cobra",
      label: "Cobra",
      models: [{ id: "darkspeed-hyr", label: "DARKSPEED Hybrid", lofts: d(["17°", "19°", "22°"]) }],
    },
  ],

  iron: [
    {
      id: "taylormade",
      label: "TaylorMade",
      models: [
        {
          id: "qi-iron",
          label: "Qi Iron",
          lofts: d(["4 (19°)", "5 (21.5°)", "6 (24.5°)", "7 (28°)", "8 (32°)", "9 (37°)", "PW (43°)"]),
        },
        {
          id: "p790-iron",
          label: "P·790",
          lofts: d(["4 (21°)", "5 (23.5°)", "6 (26.5°)", "7 (30.5°)", "8 (35°)", "9 (41°)", "PW (46°)"]),
        },
      ],
    },
    {
      id: "callaway",
      label: "Callaway",
      models: [
        {
          id: "apex-cb",
          label: "Apex CB",
          lofts: d(["4 (21°)", "5 (23.5°)", "6 (26°)", "7 (30°)", "8 (34°)", "9 (39°)", "PW (43°)"]),
        },
        {
          id: "paradym-smoke-iron",
          label: "Paradym Ai Smoke",
          lofts: d(["4 (19°)", "5 (21.8°)", "6 (24.8°)", "7 (28.5°)", "8 (33°)", "9 (37.5°)", "PW (42°)"]),
        },
      ],
    },
    {
      id: "titleist",
      label: "Titleist",
      models: [
        {
          id: "t350",
          label: "T350",
          lofts: d(["5", "6", "7", "8", "9", "PW", "W"]),
        },
        {
          id: "t150",
          label: "T150",
          lofts: d(["4", "5", "6", "7", "8", "9", "P (43°)"]),
        },
      ],
    },
    {
      id: "ping",
      label: "Ping",
      models: [
        {
          id: "g730",
          label: "G730",
          lofts: d(["4", "5", "6", "7", "8", "9", "UW (45°)"]),
        },
        {
          id: "i530",
          label: "i530",
          lofts: d(["4", "5", "6", "7", "8", "9", "PW"]),
        },
      ],
    },
    {
      id: "mizuno",
      label: "Mizuno",
      models: [
        {
          id: "jp-923-hot-metal",
          label: "JPX 923 Hot Metal",
          lofts: d(["5", "6", "7", "8", "9", "PW", "GW"]),
        },
        {
          id: "pro-241",
          label: "Pro 241",
          lofts: d(["4", "5", "6", "7", "8", "9", "PW"]),
        },
      ],
    },
    {
      id: "srixon",
      label: "Srixon",
      models: [
        {
          id: "zx7-mk2-iron",
          label: "ZX7 Mk II",
          lofts: d(["4", "5", "6", "7", "8", "9", "PW"]),
        },
        {
          id: "zx4-mk2-iron",
          label: "ZX4 Mk II",
          lofts: d(["5", "6", "7", "8", "9", "PW"]),
        },
      ],
    },
    {
      id: "cobra",
      label: "Cobra",
      models: [
        {
          id: "king-te",
          label: "KING Tec",
          lofts: d(["5", "6", "7", "8", "9", "PW"]),
        },
        {
          id: "air-x-iron",
          label: "AIR-X",
          lofts: d(["5", "6", "7", "8", "9", "PW", "GW"]),
        },
      ],
    },
  ],

  wedge: [
    {
      id: "taylormade",
      label: "TaylorMade",
      models: [
        {
          id: "mg4",
          label: "MG4 Wedge",
          lofts: d(["50° 09", "52° 09", "54° 11", "56° 12", "58° 10", "60° 10"]),
        },
        {
          id: "milled-grind-spin",
          label: "Milled Grind 4 LB",
          lofts: d(["54° LB", "56° LB", "58° LB", "60° LB"]),
        },
      ],
    },
    {
      id: "callaway",
      label: "Callaway",
      models: [
        {
          id: "jaws-md5",
          label: "JAWS Raw",
          lofts: d(["50° · 10S", "52° · 10S", "54° · 10S", "56° · 12W", "58° · 08C", "60° · 10S"]),
        },
        {
          id: "opus",
          label: "Opus",
          lofts: d(["50° · S", "52° · C", "54° · S", "56° · W", "58° · T", "60° · S"]),
        },
      ],
    },
    {
      id: "titleist",
      label: "Titleist",
      models: [
        {
          id: "sm10",
          label: "Vokey SM10",
          lofts: d(["46° · 10F", "50° · 12F", "54° · 10S", "56° · 12D", "58° · 08M", "60° · 04T"]),
        },
        {
          id: "sm9",
          label: "Vokey SM9",
          lofts: d(["52° · 12F", "54° · 10S", "56° · 14F", "58° · 10S", "60° · 08M"]),
        },
      ],
    },
    {
      id: "ping",
      label: "Ping",
      models: [
        {
          id: "glide-4-wedge",
          label: "Glide 4.0",
          lofts: d(["50° · SS", "52° · SS", "54° · WS", "56° · ES", "58° · TS", "60° · WS"]),
        },
      ],
    },
    {
      id: "mizuno",
      label: "Mizuno",
      models: [
        {
          id: "es23",
          label: "ES23",
          lofts: d(["50°", "52°", "54°", "56°", "58°", "60°"]),
        },
        {
          id: "t24",
          label: "T24",
          lofts: d(["54° · 06", "56° · 10", "58° · 08", "60° · 06"]),
        },
      ],
    },
    {
      id: "srixon",
      label: "Srixon",
      models: [
        {
          id: "premium-wedge",
          label: "ZX / Premium Wedge",
          lofts: d(["52° MW", "54° MW", "56° VW", "58° LW", "60° MW"]),
        },
      ],
    },
    {
      id: "cobra",
      label: "Cobra",
      models: [
        {
          id: "king-snake",
          label: "KING Snakebite",
          lofts: d(["48° VW", "50° VW", "52° VW", "54° VW", "56° VW", "58° LW"]),
        },
      ],
    },
  ],

  putter: [
    {
      id: "odyssey",
      label: "Odyssey",
      models: [
        {
          id: "ai-one",
          label: "Ai-One Seven S",
          lofts: d(["3° · 34\"", "3° · 35\"", "3° · 36\""]),
        },
        {
          id: "ai-one-double-wide",
          label: "Ai-One Double Wide",
          lofts: d(["3° · 33\"", "3° · 34\"", "3° · 35\""]),
        },
        {
          id: "white-hot-versa",
          label: "White Hot Versa #7",
          lofts: d(["3° · 34\"", "3° · 35\""]),
        },
        {
          id: "eleven",
          label: "Eleven Triple Track",
          lofts: d(["3° · 34\"", "3° · 36\""]),
        },
      ],
    },
    {
      id: "taylormade",
      label: "TaylorMade",
      models: [
        {
          id: "spider-tour-x",
          label: "Spider Tour X",
          lofts: d(["3° · 34\"", "3° · 35\""]),
        },
        {
          id: "tp-bandon",
          label: "TP Reserve Bandon",
          lofts: d(["3° · 33\"", "3° · 35\""]),
        },
      ],
    },
    {
      id: "titleist",
      label: "Titleist",
      models: [
        {
          id: "scotty-phantom",
          label: "Scotty Cameron Phantom X 5",
          lofts: d(["3° · 33\"", "3° · 34\"", "3° · 35\""]),
        },
        {
          id: "scotty-newport",
          label: "Scotty Cameron Newport 2",
          lofts: d(["3.5° · 34\"", "3.5° · 35\""]),
        },
      ],
    },
    {
      id: "ping",
      label: "Ping",
      models: [
        {
          id: "plds",
          label: "PLD Milled Anser",
          lofts: d(["3° · 34\"", "3° · 35\""]),
        },
        {
          id: "harwood",
          label: "Harwood",
          lofts: d(["3° · 34\"", "3° · 36\""]),
        },
      ],
    },
    {
      id: "mizuno",
      label: "Mizuno",
      models: [{ id: "m-craft-v", label: "M·Craft VI", lofts: d(["3° · 34\"", "3° · 35\""]) }],
    },
    {
      id: "srixon",
      label: "Srixon",
      models: [
        { id: "z-nx", label: "Z-NIX P Series", lofts: d(["3° · 34\"", "3° · 35\""]) },
      ],
    },
    {
      id: "callaway",
      label: "Callaway",
      models: [
        {
          id: "white-hot-og",
          label: "White Hot OG #1",
          lofts: d(["3° · 33\"", "3° · 34\"", "3° · 35\""]),
        },
      ],
    },
    {
      id: "cobra",
      label: "Cobra",
      models: [{ id: "king-nova", label: "KING 3D Nova", lofts: d(["3° · 34\"", "3° · 35\""]) }],
    },
  ],
};

export function getBrands(category: BagClubCategory): CatalogBrand[] {
  return GOLF_BAG_CATALOG[category] ?? [];
}

export function getModels(category: BagClubCategory, brandId: string): CatalogModel[] {
  const b = getBrands(category).find((x) => x.id === brandId);
  return b?.models ?? [];
}

export function getLofts(
  category: BagClubCategory,
  brandId: string,
  modelId: string,
): string[] {
  const m = getModels(category, brandId).find((x) => x.id === modelId);
  return m?.lofts ?? [];
}

export function resolveBrandLabel(category: BagClubCategory, brandId: string): string {
  if (!brandId) return "—";
  return getBrands(category).find((b) => b.id === brandId)?.label ?? brandId;
}

export function resolveModelLabel(
  category: BagClubCategory,
  brandId: string,
  modelId: string,
): string {
  if (!brandId || !modelId) return "—";
  return getModels(category, brandId).find((m) => m.id === modelId)?.label ?? modelId;
}
