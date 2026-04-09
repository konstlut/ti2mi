import { save, load } from './storage';

export interface GameSession {
  themeId: string;
  level: number;
  problemIndex: number;
  answers: { correct: boolean; timeMs: number }[];
  streak: number;
  startedAt: number;
}

const SESSION_KEY = 'current-session';

export function loadSession(): GameSession | null {
  return load<GameSession | null>(SESSION_KEY, null);
}

export function saveSession(session: GameSession): void {
  save(SESSION_KEY, session);
}

export function clearSession(): void {
  save(SESSION_KEY, null);
}

export function createSession(themeId: string, level: number): GameSession {
  const session: GameSession = {
    themeId,
    level,
    problemIndex: 0,
    answers: [],
    streak: 0,
    startedAt: Date.now(),
  };
  saveSession(session);
  return session;
}

export function recordAnswer(session: GameSession, correct: boolean, timeMs: number): GameSession {
  const updated: GameSession = {
    ...session,
    problemIndex: session.problemIndex + 1,
    answers: [...session.answers, { correct, timeMs }],
    streak: correct ? session.streak + 1 : 0,
  };
  saveSession(updated);
  return updated;
}
