import { save, load } from './storage';

export interface ThemeProgress {
  currentLevel: number;
  stars: Record<number, number>;
  completed: boolean;
}

export interface PlayerStats {
  totalProblems: number;
  totalCorrect: number;
  longestStreak: number;
  currentStreak: number;
  fastestLevelMs: number;
  levelsCompleted: number;
  themesCompleted: number;
  perfectLevels: number;
  threeStarLevels: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarId: string;
  createdAt: number;
  themes: Record<string, ThemeProgress>;
  stats: PlayerStats;
  earnedBadges: string[];
  selectedLanguage: string;
  soundEnabled: boolean;
  colorScheme: string;
}

const DEFAULT_STATS: PlayerStats = {
  totalProblems: 0,
  totalCorrect: 0,
  longestStreak: 0,
  currentStreak: 0,
  fastestLevelMs: Infinity,
  levelsCompleted: 0,
  themesCompleted: 0,
  perfectLevels: 0,
  threeStarLevels: 0,
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createDefaultProfile(): PlayerProfile {
  return {
    id: generateId(),
    name: '',
    avatarId: 'default',
    createdAt: Date.now(),
    themes: {},
    stats: { ...DEFAULT_STATS },
    earnedBadges: [],
    selectedLanguage: 'en',
    soundEnabled: true,
    colorScheme: 'sunset',
  };
}

// --- Multi-profile management ---

const PROFILES_KEY = 'profiles';
const ACTIVE_KEY = 'active-profile';

export function listProfiles(): PlayerProfile[] {
  return load<PlayerProfile[]>(PROFILES_KEY, []);
}

function saveAllProfiles(profiles: PlayerProfile[]): void {
  save(PROFILES_KEY, profiles);
}

export function getActiveProfileId(): string | null {
  return load<string | null>(ACTIVE_KEY, null);
}

export function setActiveProfileId(id: string): void {
  save(ACTIVE_KEY, id);
}

export function loadProfile(): PlayerProfile {
  const profiles = listProfiles();
  const activeId = getActiveProfileId();

  if (activeId) {
    const found = profiles.find(p => p.id === activeId);
    if (found) return found;
  }

  // No profiles yet — create default
  if (profiles.length === 0) {
    const fresh = createDefaultProfile();
    saveAllProfiles([fresh]);
    setActiveProfileId(fresh.id);
    return fresh;
  }

  // Active ID invalid — use first profile
  setActiveProfileId(profiles[0].id);
  return profiles[0];
}

export function saveProfile(profile: PlayerProfile): void {
  const profiles = listProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  saveAllProfiles(profiles);
}

export function createProfile(name: string, avatarId = 'default'): PlayerProfile {
  const profile = createDefaultProfile();
  profile.name = name;
  profile.avatarId = avatarId;
  const profiles = listProfiles();
  profiles.push(profile);
  saveAllProfiles(profiles);
  setActiveProfileId(profile.id);
  return profile;
}

export function switchProfile(id: string): PlayerProfile | null {
  const profiles = listProfiles();
  const found = profiles.find(p => p.id === id);
  if (!found) return null;
  setActiveProfileId(id);
  return found;
}

export function deleteProfile(id: string): void {
  let profiles = listProfiles();
  profiles = profiles.filter(p => p.id !== id);
  saveAllProfiles(profiles);

  const activeId = getActiveProfileId();
  if (activeId === id) {
    if (profiles.length > 0) {
      setActiveProfileId(profiles[0].id);
    } else {
      const fresh = createDefaultProfile();
      saveAllProfiles([fresh]);
      setActiveProfileId(fresh.id);
    }
  }
}

// --- Profile data helpers ---

export function getThemeProgress(profile: PlayerProfile, themeId: string): ThemeProgress {
  return profile.themes[themeId] ?? { currentLevel: 1, stars: {}, completed: false };
}

export function updateThemeProgress(
  profile: PlayerProfile,
  themeId: string,
  level: number,
  stars: number,
  passed: boolean
): PlayerProfile {
  const existing = getThemeProgress(profile, themeId);
  const prevStars = existing.stars[level] ?? 0;

  const updated: ThemeProgress = {
    ...existing,
    stars: { ...existing.stars, [level]: Math.max(prevStars, stars) },
    currentLevel: passed ? Math.max(existing.currentLevel, level + 1) : existing.currentLevel,
    completed: passed && level >= 15 ? true : existing.completed,
  };

  return {
    ...profile,
    themes: { ...profile.themes, [themeId]: updated },
  };
}

export function updateStats(
  profile: PlayerProfile,
  correct: number,
  total: number,
  streak: number,
  timeMs: number,
  passed: boolean,
  stars: number
): PlayerProfile {
  const stats = { ...profile.stats };
  stats.totalProblems += total;
  stats.totalCorrect += correct;
  stats.longestStreak = Math.max(stats.longestStreak, streak);
  if (passed) {
    stats.levelsCompleted += 1;
    if (timeMs < stats.fastestLevelMs) stats.fastestLevelMs = timeMs;
  }
  if (correct === total) stats.perfectLevels += 1;
  if (stars >= 3) stats.threeStarLevels += 1;

  const completedThemes = Object.values(profile.themes).filter(t => t.completed).length;
  stats.themesCompleted = completedThemes;

  return { ...profile, stats };
}

export function resetProfile(): PlayerProfile {
  const current = loadProfile();
  const fresh = createDefaultProfile();
  fresh.id = current.id;
  fresh.name = current.name;
  fresh.avatarId = current.avatarId;
  saveProfile(fresh);
  return fresh;
}
