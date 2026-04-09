export type UnitCategory = "time" | "volume" | "length" | "weight";

export interface Unit {
  name: string;
  abbreviation: string;
  factor: number;
}

interface CategoryDefinition {
  baseUnit: string;
  units: Unit[];
}

const categories: Record<UnitCategory, CategoryDefinition> = {
  time: {
    baseUnit: "s",
    units: [
      { name: "seconds", abbreviation: "s", factor: 1 },
      { name: "minutes", abbreviation: "min", factor: 60 },
      { name: "hours", abbreviation: "h", factor: 3600 },
      { name: "days", abbreviation: "d", factor: 86400 },
      { name: "weeks", abbreviation: "w", factor: 604800 },
    ],
  },
  volume: {
    baseUnit: "ml",
    units: [
      { name: "milliliters", abbreviation: "ml", factor: 1 },
      { name: "centiliters", abbreviation: "cl", factor: 10 },
      { name: "deciliters", abbreviation: "dl", factor: 100 },
      { name: "liters", abbreviation: "l", factor: 1000 },
    ],
  },
  length: {
    baseUnit: "mm",
    units: [
      { name: "millimeters", abbreviation: "mm", factor: 1 },
      { name: "centimeters", abbreviation: "cm", factor: 10 },
      { name: "decimeters", abbreviation: "dm", factor: 100 },
      { name: "meters", abbreviation: "m", factor: 1000 },
      { name: "kilometers", abbreviation: "km", factor: 1_000_000 },
    ],
  },
  weight: {
    baseUnit: "g",
    units: [
      { name: "grams", abbreviation: "g", factor: 1 },
      { name: "kilograms", abbreviation: "kg", factor: 1000 },
      { name: "tons", abbreviation: "t", factor: 1_000_000 },
    ],
  },
};

export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
): number {
  const fromDef = findUnit(fromUnit);
  const toDef = findUnit(toUnit);

  if (!fromDef || !toDef) {
    throw new Error(`Unknown unit: ${fromDef ? toUnit : fromUnit}`);
  }

  const baseValue = value * fromDef.factor;
  return baseValue / toDef.factor;
}

export function getUnitsForCategory(category: UnitCategory): Unit[] {
  const def = categories[category];
  if (!def) {
    throw new Error(`Unknown category: ${category}`);
  }
  return [...def.units];
}

export function getCategoryForUnit(abbreviation: string): UnitCategory | null {
  for (const [cat, def] of Object.entries(categories)) {
    if (def.units.some((u) => u.abbreviation === abbreviation)) {
      return cat as UnitCategory;
    }
  }
  return null;
}

export function getAllCategories(): UnitCategory[] {
  return Object.keys(categories) as UnitCategory[];
}

function findUnit(abbreviation: string): Unit | undefined {
  for (const def of Object.values(categories)) {
    const unit = def.units.find((u) => u.abbreviation === abbreviation);
    if (unit) return unit;
  }
  return undefined;
}
