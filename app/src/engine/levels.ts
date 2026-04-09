import type { UnitCategory } from "./units";

export interface LevelConfig {
  level: number;
  tier: number;
  tierName: string;
  problemCount: number;
  requiredCorrect: number;
  categories: UnitCategory[];
}

const TIER_NAMES: Record<number, string> = {
  1: "tier.foundation",
  2: "tier.growing",
  3: "tier.intermediate",
  4: "tier.advanced",
  5: "tier.expert",
};

const LEVEL_CATEGORIES: Record<number, UnitCategory[]> = {
  1: ["time", "length"],
  2: ["time", "length"],
  3: ["time", "length"],
  4: ["time", "length", "volume"],
  5: ["time", "length", "volume"],
  6: ["time", "length", "volume"],
  7: ["time", "length", "volume", "weight"],
  8: ["time", "length", "volume", "weight"],
  9: ["time", "length", "volume", "weight"],
  10: ["time", "length", "volume", "weight"],
  11: ["time", "length", "volume", "weight"],
  12: ["time", "length", "volume", "weight"],
  13: ["time", "length", "volume", "weight"],
  14: ["time", "length", "volume", "weight"],
  15: ["time", "length", "volume", "weight"],
};

export function getTierForLevel(level: number): number {
  if (level < 1 || level > 15) {
    throw new Error(`Invalid level: ${level}. Must be 1-15.`);
  }
  return Math.ceil(level / 3);
}

export function getLevelConfig(level: number): LevelConfig {
  const tier = getTierForLevel(level);

  return {
    level,
    tier,
    tierName: TIER_NAMES[tier],
    problemCount: 5,
    requiredCorrect: 4,
    categories: LEVEL_CATEGORIES[level],
  };
}
