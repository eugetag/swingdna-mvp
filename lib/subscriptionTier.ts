/**
 * Subscription tiers for authenticated golfers (stored on `golfer_profiles.subscription_tier`).
 * Stripe checkout is not wired yet — UI and limits only.
 */

export type SubscriptionTier = "founding" | "player" | "elite";

export const SUBSCRIPTION_TIERS: readonly SubscriptionTier[] = ["founding", "player", "elite"] as const;

export function isSubscriptionTier(value: string | null | undefined): value is SubscriptionTier {
  return value === "founding" || value === "player" || value === "elite";
}

export function normalizeSubscriptionTier(value: string | null | undefined): SubscriptionTier {
  return isSubscriptionTier(value) ? value : "player";
}

/** `null` = unlimited for the month */
export type TierMonthlyLimits = {
  advancedAiAnalysis: number | null;
  swingAnalysis: number | null;
};

/**
 * Player: 1 advanced AI / month, 5 swing analyses / month.
 * Elite: unlimited.
 * Founding: elevated allowance vs Player (early-adopter perk until billing ships).
 */
export function monthlyLimitsForTier(tier: SubscriptionTier): TierMonthlyLimits {
  switch (tier) {
    case "elite":
      return { advancedAiAnalysis: null, swingAnalysis: null };
    case "founding":
      return { advancedAiAnalysis: 3, swingAnalysis: 12 };
    case "player":
    default:
      return { advancedAiAnalysis: 1, swingAnalysis: 5 };
  }
}

export type SubscriptionPlanCard = {
  tier: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  blurb: string;
  featured: boolean;
  highlights: readonly string[];
};

export const SUBSCRIPTION_PLAN_CARDS: readonly SubscriptionPlanCard[] = [
  {
    tier: "founding",
    name: "Founding Golfer",
    price: "$9.99",
    period: "/mo",
    blurb: "Early access pricing with expanded monthly allowances.",
    featured: false,
    highlights: [
      "3 advanced AI analyses / mo",
      "12 swing analyses / mo",
      "Founding member badge",
      "Priority feature input",
    ],
  },
  {
    tier: "player",
    name: "Player",
    price: "$14.99",
    period: "/mo",
    blurb: "Full stack for dedicated amateurs building a data-backed game plan.",
    featured: true,
    highlights: [
      "1 advanced AI analysis / mo",
      "5 swing photo or video analyses / mo",
      "Profile, bag, sessions & report",
      "Practice prescriptions",
    ],
  },
  {
    tier: "elite",
    name: "Elite",
    price: "$39.99",
    period: "/mo",
    blurb: "Unlimited intelligence for competitors who live in the numbers.",
    featured: false,
    highlights: [
      "Unlimited advanced AI",
      "Unlimited swing analyses",
      "Deep session & trend reads",
      "Coming soon: Stripe checkout",
    ],
  },
] as const;
