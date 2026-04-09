import type { UnitCategory, Unit } from "./units";
import { convert, getUnitsForCategory } from "./units";
import { getLevelConfig, getTierForLevel } from "./levels";

export interface Problem {
  id: string;
  level: number;
  tier: number;
  category: UnitCategory;
  questionTemplate: string;
  questionParams: Record<string, string | number>;
  answer: number;
  answerUnit: string;
  acceptedFormats?: string[];
  hint?: string;
}

type ProblemGenerator = (level: number, category: UnitCategory) => Problem;

export function generateProblems(level: number, count: number): Problem[] {
  const config = getLevelConfig(level);
  const tier = getTierForLevel(level);
  const generators = TIER_GENERATORS[tier];
  const problems: Problem[] = [];

  for (let i = 0; i < count; i++) {
    const category = pickRandom(config.categories);
    const generator = pickRandom(generators);
    const problem = generator(level, category);
    problem.id = `lvl${level}-${i}-${Date.now().toString(36)}`;
    problems.push(problem);
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Tier 1 — Foundation: simple direct conversions
// Level 1: only adjacent units (cm↔m, min↔h, etc.) with small round numbers
// Level 2-3: any pair within category, slightly bigger numbers
// ---------------------------------------------------------------------------

function getEasyPairs(category: UnitCategory): [Unit, Unit][] {
  const pairs: Record<string, [string, string][]> = {
    time: [["s", "min"], ["min", "h"]],
    length: [["cm", "m"], ["mm", "cm"], ["m", "km"]],
    volume: [["ml", "l"], ["dl", "l"], ["ml", "dl"]],
    weight: [["g", "kg"], ["kg", "t"]],
  };
  const units = getUnitsForCategory(category);
  return (pairs[category] || []).map(([a, b]) => [
    units.find(u => u.abbreviation === a)!,
    units.find(u => u.abbreviation === b)!,
  ] as [Unit, Unit]).filter(([a, b]) => a && b);
}

const tier1DirectConvert: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const ratio = big.factor / small.factor;

  let value: number, from: Unit, to: Unit;
  if (level === 1) {
    const multiplier = randomInt(1, 5);
    value = multiplier * ratio;
    from = small;
    to = big;
  } else {
    // levels 2-3: still adjacent pairs, slightly bigger numbers
    if (Math.random() < 0.5) {
      value = randomInt(1, 10) * ratio;
      from = small;
      to = big;
    } else {
      value = randomInt(1, 10);
      from = big;
      to = small;
    }
  }

  const answer = Math.round(convert(value, from.abbreviation, to.abbreviation));

  return {
    id: "", level, tier: 1, category,
    questionTemplate: "problem.tier1.directConvert",
    questionParams: { value, fromUnit: from.abbreviation, toUnit: to.abbreviation },
    answer,
    answerUnit: to.abbreviation,
  };
};

const tier1DirectConvertLarger: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const value = randomInt(1, level === 1 ? 5 : 10);
  const answer = Math.round(convert(value, big.abbreviation, small.abbreviation));

  return {
    id: "", level, tier: 1, category,
    questionTemplate: "problem.tier1.directConvertLarger",
    questionParams: { value, fromUnit: big.abbreviation, toUnit: small.abbreviation },
    answer,
    answerUnit: small.abbreviation,
  };
};

const tier1HowMany: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const value = randomInt(1, level === 1 ? 5 : 10);
  const answer = Math.round(convert(value, big.abbreviation, small.abbreviation));

  return {
    id: "", level, tier: 1, category,
    questionTemplate: "problem.tier1.howMany",
    questionParams: { value, bigUnit: big.abbreviation, smallUnit: small.abbreviation },
    answer,
    answerUnit: small.abbreviation,
  };
};

// ---------------------------------------------------------------------------
// Tier 2 — Growing: fractions, multi-step same category
// ---------------------------------------------------------------------------

const tier2FractionConvert: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const ratio = big.factor / small.factor;
  // Pick fractions that yield integer when multiplied by ratio
  const fractions = [0.5, 0.25, 0.75].filter(f => (f * ratio) % 1 === 0);
  const frac = fractions.length > 0 ? pickRandom(fractions) : 0.5;
  const value = frac;
  const answer = Math.round(value * ratio);

  return {
    id: "", level, tier: 2, category,
    questionTemplate: "problem.tier2.fractionConvert",
    questionParams: { value, fromUnit: big.abbreviation, toUnit: small.abbreviation },
    answer,
    answerUnit: small.abbreviation,
  };
};

const tier2MultiStep: ProblemGenerator = (level, category) => {
  const units = getUnitsForCategory(category);
  const sorted = [...units].sort((a, b) => a.factor - b.factor);
  if (sorted.length < 3) return tier2FractionConvert(level, category);
  const from = sorted[0];
  const to = sorted[sorted.length - 1];
  const factor = to.factor / from.factor;
  const multiplier = randomInt(1, 5);
  const value = multiplier * factor;
  const answer = multiplier;

  return {
    id: "", level, tier: 2, category,
    questionTemplate: "problem.tier2.multiStep",
    questionParams: { value, fromUnit: from.abbreviation, toUnit: to.abbreviation },
    answer,
    answerUnit: to.abbreviation,
  };
};

const tier2AddSameCategory: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const ratio = big.factor / small.factor;
  const valueB = randomInt(1, 5);
  const valueA = randomInt(1, 50);
  const answer = valueA + valueB * ratio;

  return {
    id: "", level, tier: 2, category,
    questionTemplate: "problem.tier2.addSameCategory",
    questionParams: {
      valueA, unitA: small.abbreviation,
      valueB, unitB: big.abbreviation,
      answerUnit: small.abbreviation,
    },
    answer,
    answerUnit: small.abbreviation,
  };
};

// ---------------------------------------------------------------------------
// Story scenarios for word problems
// ---------------------------------------------------------------------------

interface StoryScenario {
  template: string;
  person: string;
  item: string;
}

// Generate gendered verb params from a person key like "person.mom"
function personParams(personKey: string): Record<string, string> {
  const base = personKey; // e.g. "person.mom"
  return {
    person: personKey,
    personBought: `${base}.bought`,
    personMade: `${base}.made`,
    personHas: `${base}.has`,
    personBuys: `${base}.buys`,
    personIsMaking: `${base}.is_making`,
    personHasRecipe: `${base}.has_recipe`,
    personGoes: `${base}.goes`,
  };
}

const FOOD_STORIES: StoryScenario[] = [
  { template: "problem.story.divideFood", person: "person.mom", item: "item.apples" },
  { template: "problem.story.divideFood", person: "person.grandma", item: "item.flour" },
  { template: "problem.story.divideFood", person: "person.dad", item: "item.potatoes" },
  { template: "problem.story.divideFood", person: "person.teacher", item: "item.candy" },
];

const DRINK_STORIES: StoryScenario[] = [
  { template: "problem.story.pourDrinks", person: "person.mom", item: "item.lemonade" },
  { template: "problem.story.pourDrinks", person: "person.dad", item: "item.juice" },
  { template: "problem.story.pourDrinks", person: "person.anna", item: "item.tea" },
];

const LENGTH_STORIES: StoryScenario[] = [
  { template: "problem.story.cutRibbon", person: "person.anna", item: "item.ribbon" },
  { template: "problem.story.cutRibbon", person: "person.grandma", item: "item.fabric" },
  { template: "problem.story.cutRibbon", person: "person.dad", item: "item.rope" },
];

const SPEED_STORIES = [
  { template: "problem.story.roadTrip", vehicle: "item.car" },
  { template: "problem.story.roadTrip", vehicle: "item.bus" },
  { template: "problem.story.roadTrip", vehicle: "item.train" },
];

const BAKING_STORIES: StoryScenario[] = [
  { template: "problem.story.bakingRecipe", person: "person.grandma", item: "item.flour" },
  { template: "problem.story.bakingRecipe", person: "person.mom", item: "item.sugar" },
  { template: "problem.story.bakingRecipe", person: "person.anna", item: "item.butter" },
];

const TIME_STORIES: StoryScenario[] = [
  { template: "problem.story.divideTime", person: "person.anna", item: "" },
  { template: "problem.story.divideTime", person: "person.peter", item: "" },
  { template: "problem.story.divideTime", person: "person.mom", item: "" },
];

function getCategoryStories(category: UnitCategory): StoryScenario[] {
  switch (category) {
    case "weight": return FOOD_STORIES;
    case "volume": return DRINK_STORIES;
    case "length": return LENGTH_STORIES;
    case "time": return TIME_STORIES;
  }
}

// ---------------------------------------------------------------------------
// Tier 3 — Intermediate: story-based word problems
// ---------------------------------------------------------------------------

const tier3DivideFood: ProblemGenerator = (level, category) => {
  const story = pickRandom(getCategoryStories(category));
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const ratio = big.factor / small.factor;

  const people = randomInt(2, 6);
  const answerPerPerson = randomInt(2, 20) * (ratio >= 100 ? 1 : 10);
  const totalSmall = answerPerPerson * people;
  const totalBig = totalSmall / ratio;

  // Use big units if it divides evenly, otherwise stay in small
  const useBig = totalSmall % ratio === 0 && totalBig <= 20;

  return {
    id: "", level, tier: 3, category,
    questionTemplate: story.template,
    questionParams: {
      ...personParams(story.person),
      item: story.item,
      total: useBig ? totalBig : totalSmall,
      bigUnit: useBig ? big.abbreviation : small.abbreviation,
      people,
      smallUnit: small.abbreviation,
    },
    answer: answerPerPerson,
    answerUnit: small.abbreviation,
  };
};

const tier3MultiplyItems: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const ratio = big.factor / small.factor;
  const count = randomInt(2, 8);
  const perItem = randomInt(1, 10);
  const answer = count * perItem * ratio;

  const categoryItems: Record<string, { items: string; person: string }[]> = {
    weight: [
      { items: "item.bag", person: "person.mom" },
      { items: "item.box", person: "person.dad" },
      { items: "item.pack", person: "person.grandma" },
    ],
    volume: [
      { items: "item.bottle", person: "person.mom" },
      { items: "item.box", person: "person.anna" },
      { items: "item.pack", person: "person.dad" },
    ],
    length: [
      { items: "item.pack", person: "person.dad" },
      { items: "item.box", person: "person.peter" },
    ],
    time: [],
  };

  // Time category uses a dedicated template
  if (category === "time") {
    const result: Problem = {
      id: "", level, tier: 3, category,
      questionTemplate: "problem.story.multiplyTime",
      questionParams: {
        ...personParams(pickRandom(["person.anna", "person.peter", "person.mom"])),
        count,
        perItem,
        bigUnit: big.abbreviation,
        smallUnit: small.abbreviation,
      },
      answer,
      answerUnit: small.abbreviation,
    };
    return result;
  }

  const scenario = pickRandom(categoryItems[category] || categoryItems.weight);

  return {
    id: "", level, tier: 3, category,
    questionTemplate: "problem.story.multiplyItems",
    questionParams: {
      ...personParams(scenario.person),
      count,
      items: scenario.items,
      perItem,
      fromUnit: big.abbreviation,
      toUnit: small.abbreviation,
    },
    answer,
    answerUnit: small.abbreviation,
  };
};

const tier3Remainder: ProblemGenerator = (level, category) => {
  const pairs = getEasyPairs(category);
  const [small, big] = pickRandom(pairs);
  const ratio = big.factor / small.factor;

  const totalBig = randomInt(2, 8);
  const totalSmall = totalBig * ratio;
  const usedSmall = randomInt(1, Math.floor(totalSmall / 2));
  const answer = totalSmall - usedSmall;

  // Time category uses a dedicated template without items
  if (category === "time") {
    const result: Problem = {
      id: "", level, tier: 3, category,
      questionTemplate: "problem.story.subtractTime",
      questionParams: {
        ...personParams(pickRandom(["person.anna", "person.peter", "person.mom"])),
        total: totalBig,
        bigUnit: big.abbreviation,
        used: usedSmall,
        smallUnit: small.abbreviation,
      },
      answer,
      answerUnit: small.abbreviation,
    };
    return result;
  }

  const story = pickRandom(getCategoryStories(category));

  return {
    id: "", level, tier: 3, category,
    questionTemplate: "problem.story.remainder",
    questionParams: {
      ...personParams(story.person),
      item: story.item,
      total: totalBig,
      bigUnit: big.abbreviation,
      used: usedSmall,
      smallUnit: small.abbreviation,
    },
    answer,
    answerUnit: small.abbreviation,
  };
};

const tier3Tiles: ProblemGenerator = (level, category) => {
  // Time category: episodes fitting into a marathon
  if (category === "time") {
    const episodeSizes = [15, 20, 30, 45];
    const epSize = pickRandom(episodeSizes);
    const answer = randomInt(3, 12);
    const totalMin = epSize * answer;
    const totalH = totalMin / 60;
    const useBig = totalMin % 60 === 0;
    const result: Problem = {
      id: "", level, tier: 3, category: "time",
      questionTemplate: "problem.story.fitTime",
      questionParams: {
        tileSize: epSize,
        smallUnit: "min",
        total: useBig ? totalH : totalMin,
        bigUnit: useBig ? "h" : "min",
      },
      answer,
      answerUnit: "",
    };
    return result;
  }

  const tileSizes = [20, 25, 30, 50];
  const tileSize = pickRandom(tileSizes);
  const answer = randomInt(5, 20);
  const wallCm = tileSize * answer;
  const wallM = wallCm / 100;

  return {
    id: "", level, tier: 3, category: "length",
    questionTemplate: "problem.story.tiles",
    questionParams: {
      tileSize,
      wallSize: wallCm % 100 === 0 ? wallM : wallCm,
      wallUnit: wallCm % 100 === 0 ? "m" : "cm",
    },
    answer,
    answerUnit: "",
  };
};

// ---------------------------------------------------------------------------
// Tier 4 — Advanced: story-based word problems
// ---------------------------------------------------------------------------

const tier4MovieTime: ProblemGenerator = (level, _category) => {
  const hours = randomInt(1, 3);
  const minutes = randomInt(5, 55);
  const answer = hours * 60 + minutes;

  return {
    id: "", level, tier: 4, category: "time",
    questionTemplate: "problem.story.movieTime",
    questionParams: { hours, minutes },
    answer,
    answerUnit: "min",
  };
};

const tier4RoadTrip: ProblemGenerator = (level, _category) => {
  const story = pickRandom(SPEED_STORIES);
  const speeds = [40, 50, 60, 80, 100, 120];
  const speed = pickRandom(speeds);
  const hours = randomInt(1, 4);
  const answer = speed * hours * 1000;

  return {
    id: "", level, tier: 4, category: "length",
    questionTemplate: story.template,
    questionParams: { vehicle: story.vehicle, speed, hours },
    answer,
    answerUnit: "m",
  };
};

const tier4PetFood: ProblemGenerator = (level, _category) => {
  const pets = [
    { pet: "item.puppy" },
    { pet: "item.cat" },
    { pet: "item.rabbit" },
  ];
  const { pet } = pickRandom(pets);
  const foodG = randomInt(2, 6) * 50;
  const days = randomInt(5, 14);
  const answer = foodG * days;

  return {
    id: "", level, tier: 4, category: "weight",
    questionTemplate: "problem.story.petFood",
    questionParams: { pet, foodG, days },
    answer,
    answerUnit: "g",
  };
};

const tier4GardenFence: ProblemGenerator = (level, _category) => {
  const totalM = randomInt(10, 30);
  const paintedM = randomInt(3, totalM - 3);
  const remainCm = (totalM - paintedM) * 100;
  const workers = randomInt(2, 5);
  // Ensure clean division
  const adjustedRemain = Math.ceil(remainCm / workers) * workers;
  const answer = adjustedRemain / workers;

  return {
    id: "", level, tier: 4, category: "length",
    questionTemplate: "problem.story.gardenFence",
    questionParams: {
      totalM,
      paintedM,
      remainCm: adjustedRemain,
      workers,
    },
    answer,
    answerUnit: "cm",
  };
};

const tier4CompareWeights: ProblemGenerator = (level, _category) => {
  const bigKg = randomInt(3, 10);
  const smallG = randomInt(1, bigKg - 1) * 1000 + randomInt(1, 9) * 100;
  const answer = bigKg * 1000 - smallG;

  return {
    id: "", level, tier: 4, category: "weight",
    questionTemplate: "problem.story.compareWeights",
    questionParams: {
      itemA: pickRandom(["item.watermelon", "item.pumpkin", "item.sack"]),
      weightA: bigKg,
      itemB: pickRandom(["item.melon", "item.cabbage", "item.flourBag"]),
      weightB: smallG,
    },
    answer,
    answerUnit: "g",
  };
};

// ---------------------------------------------------------------------------
// Tier 5 — Expert: complex story-based problems
// ---------------------------------------------------------------------------

const tier5PartyDrinks: ProblemGenerator = (level, _category) => {
  const cups = randomInt(4, 12);
  const mlPerCup = randomInt(1, 5) * 50;
  const totalMl = cups * mlPerCup;
  const totalL = totalMl / 1000;

  const useLiters = totalMl % 1000 === 0;

  return {
    id: "", level, tier: 5, category: "volume",
    questionTemplate: "problem.story.partyDrinks",
    questionParams: {
      ...personParams(pickRandom(["person.anna", "person.mom", "person.peter"])),
      item: pickRandom(["item.lemonade", "item.juice", "item.cocoa"]),
      total: useLiters ? totalL : totalMl,
      totalUnit: useLiters ? "l" : "ml",
      cups,
    },
    answer: mlPerCup,
    answerUnit: "ml",
  };
};

const tier5BakingRecipe: ProblemGenerator = (level, _category) => {
  const story = pickRandom(BAKING_STORIES);
  const servingsOrig = pickRandom([2, 4, 5, 6, 8]);
  const targetServings = pickRandom([3, 6, 9, 10, 12, 15].filter(s => s !== servingsOrig));

  // Ensure integer: amountPerPerson * targetServings = answer
  const amountPerPerson = randomInt(2, 10) * 10;
  const origAmount = amountPerPerson * servingsOrig;
  const answer = amountPerPerson * targetServings;

  return {
    id: "", level, tier: 5, category: "weight",
    questionTemplate: story.template,
    questionParams: {
      ...personParams(story.person),
      item: story.item,
      amount: origAmount,
      unit: "g",
      servings: servingsOrig,
      targetServings,
    },
    answer,
    answerUnit: "g",
  };
};

const tier5TrainJourney: ProblemGenerator = (level, _category) => {
  const days = randomInt(0, 2);
  const hours = randomInt(1, 12);
  const minutes = randomInt(1, 59);
  const answer = days * 24 * 60 + hours * 60 + minutes;

  return {
    id: "", level, tier: 5, category: "time",
    questionTemplate: "problem.story.trainJourney",
    questionParams: {
      destination: pickRandom(["item.seaside", "item.mountains", "item.grandmaHouse", "item.capital"]),
      days, hours, minutes,
    },
    answer,
    answerUnit: "min",
  };
};

const tier5HikingTrail: ProblemGenerator = (level, _category) => {
  const speeds = [50, 60, 75, 80, 100, 125, 200, 250, 500];
  const speed = pickRandom(speeds);
  // pick distKm such that (distKm * 1000) / speed is integer
  const validDist = [];
  for (let d = 1; d <= 10; d++) {
    if ((d * 1000) % speed === 0) validDist.push(d);
  }
  const distKm = validDist.length > 0 ? pickRandom(validDist) : 5;
  const answer = (distKm * 1000) / speed;

  return {
    id: "", level, tier: 5, category: "length",
    questionTemplate: "problem.story.hikingTrail",
    questionParams: {
      ...personParams(pickRandom(["person.peter", "person.dad", "person.anna"])),
      distKm,
      speed,
    },
    answer,
    answerUnit: "min",
  };
};

const tier5FruitShopping: ProblemGenerator = (level, _category) => {
  const item1Kg = randomInt(1, 4);
  const item2Kg = randomInt(1, 4);
  const totalKg = item1Kg + item2Kg;
  const people = randomInt(2, 8);
  // Ensure totalG / people = integer
  const totalG = totalKg * 1000;
  const adjustedTotalG = Math.ceil(totalG / people) * people;
  const answer = adjustedTotalG / people;

  return {
    id: "", level, tier: 5, category: "weight",
    questionTemplate: "problem.story.fruitShopping",
    questionParams: {
      ...personParams(pickRandom(["person.mom", "person.grandma", "person.dad"])),
      item1: pickRandom(["item.apples", "item.oranges", "item.bananas"]),
      item1Kg,
      item2: pickRandom(["item.pears", "item.grapes", "item.plums"]),
      item2Kg,
      people,
    },
    answer,
    answerUnit: "g",
  };
};

// ---------------------------------------------------------------------------
// Tier → generators mapping
// ---------------------------------------------------------------------------

const TIER_GENERATORS: Record<number, ProblemGenerator[]> = {
  1: [tier1DirectConvert, tier1DirectConvertLarger, tier1HowMany],
  2: [tier2FractionConvert, tier2MultiStep, tier2AddSameCategory],
  3: [tier3DivideFood, tier3MultiplyItems, tier3Remainder, tier3Tiles],
  4: [tier4MovieTime, tier4RoadTrip, tier4PetFood, tier4GardenFence, tier4CompareWeights],
  5: [tier5PartyDrinks, tier5BakingRecipe, tier5TrainJourney, tier5HikingTrail, tier5FruitShopping],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
