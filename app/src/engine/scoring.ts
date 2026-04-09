import { getLevelConfig } from "./levels";

export interface AnswerResult {
  correct: boolean;
  timeMs: number;
}

export interface LevelResult {
  level: number;
  correct: number;
  total: number;
  longestStreak: number;
  timeMs: number;
  passed: boolean;
  stars: number;
}

export function calculateStars(
  correct: number,
  total: number,
  longestStreak: number,
): number {
  if (correct === total && longestStreak === total) return 3;
  if (correct === total) return 2;
  if (correct >= total - 1) return 1;
  return 0;
}

export function calculateResult(
  answers: AnswerResult[],
  level: number,
): LevelResult {
  const config = getLevelConfig(level);
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const timeMs = answers.reduce((sum, a) => sum + a.timeMs, 0);
  const longestStreak = computeLongestStreak(answers);
  const passed = correct >= config.requiredCorrect;
  const stars = passed ? calculateStars(correct, total, longestStreak) : 0;

  return { level, correct, total, longestStreak, timeMs, passed, stars };
}

function computeLongestStreak(answers: AnswerResult[]): number {
  let max = 0;
  let current = 0;
  for (const a of answers) {
    if (a.correct) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}
