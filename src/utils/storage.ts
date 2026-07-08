import type { StudySession } from "../types/study";

export const STORAGE_KEY = "promptInjectionStudySession";

export function saveSession(session: StudySession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): StudySession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StudySession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function hasUnfinishedSession(): boolean {
  const session = loadSession();
  return session !== null && session.studyCompletedAt === null;
}
