export interface PlayerStats {
  totalProblems: number;
  correctProblems: number;
  bestStreak: number;
  currentStreak: number;
  levelsCompleted: number;
  perfectLevels: number;
  themesCompleted: number;
  tiersCompleted: number[];
  fastestLevelTime: number;
  threeStarLevels: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: PlayerStats) => boolean;
}

export const badges: Badge[] = [
  {
    id: 'first-solve',
    name: 'badges.first-solve',
    description: 'badges.first-solve.desc',
    icon: '👶',
    condition: (stats) => stats.totalProblems >= 1,
  },
  {
    id: 'ten-streak',
    name: 'badges.ten-streak',
    description: 'badges.ten-streak.desc',
    icon: '🔥',
    condition: (stats) => stats.bestStreak >= 10,
  },
  {
    id: 'perfect-level',
    name: 'badges.perfect-level',
    description: 'badges.perfect-level.desc',
    icon: '💯',
    condition: (stats) => stats.perfectLevels >= 1,
  },
  {
    id: 'speed-demon',
    name: 'badges.speed-demon',
    description: 'badges.speed-demon.desc',
    icon: '⚡',
    condition: (stats) => stats.fastestLevelTime > 0 && stats.fastestLevelTime < 60,
  },
  {
    id: 'tier-complete-1',
    name: 'badges.tier-complete-1',
    description: 'badges.tier-complete-1.desc',
    icon: '🥉',
    condition: (stats) => stats.tiersCompleted.includes(1),
  },
  {
    id: 'tier-complete-2',
    name: 'badges.tier-complete-2',
    description: 'badges.tier-complete-2.desc',
    icon: '🥈',
    condition: (stats) => stats.tiersCompleted.includes(2),
  },
  {
    id: 'tier-complete-3',
    name: 'badges.tier-complete-3',
    description: 'badges.tier-complete-3.desc',
    icon: '🥇',
    condition: (stats) => stats.tiersCompleted.includes(3),
  },
  {
    id: 'tier-complete-4',
    name: 'badges.tier-complete-4',
    description: 'badges.tier-complete-4.desc',
    icon: '🎖️',
    condition: (stats) => stats.tiersCompleted.includes(4),
  },
  {
    id: 'tier-complete-5',
    name: 'badges.tier-complete-5',
    description: 'badges.tier-complete-5.desc',
    icon: '🏅',
    condition: (stats) => stats.tiersCompleted.includes(5),
  },
  {
    id: 'theme-complete',
    name: 'badges.theme-complete',
    description: 'badges.theme-complete.desc',
    icon: '🏆',
    condition: (stats) => stats.themesCompleted >= 1,
  },
  {
    id: 'all-themes',
    name: 'badges.all-themes',
    description: 'badges.all-themes.desc',
    icon: '👑',
    condition: (stats) => stats.themesCompleted >= 12,
  },
  {
    id: 'thousand-club',
    name: 'badges.thousand-club',
    description: 'badges.thousand-club.desc',
    icon: '🎯',
    condition: (stats) => stats.totalProblems >= 1000,
  },
  {
    id: 'three-star-level',
    name: 'badges.three-star-level',
    description: 'badges.three-star-level.desc',
    icon: '⭐',
    condition: (stats) => stats.threeStarLevels >= 1,
  },
  {
    id: 'hundred-problems',
    name: 'badges.hundred-problems',
    description: 'badges.hundred-problems.desc',
    icon: '💪',
    condition: (stats) => stats.totalProblems >= 100,
  },
  {
    id: 'five-hundred-problems',
    name: 'badges.five-hundred-problems',
    description: 'badges.five-hundred-problems.desc',
    icon: '🦾',
    condition: (stats) => stats.totalProblems >= 500,
  },
];
