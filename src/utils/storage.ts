import type { StudySession, V2StudySession } from "../types/study";

export const STORAGE_KEY = "promptInjectionStudySession_v1";
export const STORAGE_KEY_V2 = "promptInjectionStudySession_v2";

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

export function saveSessionV2(session: V2StudySession): void {
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(session));
}

export function loadSessionV2(): V2StudySession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY_V2);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as V2StudySession;
  } catch {
    return null;
  }
}

export function clearSessionV2(): void {
  window.localStorage.removeItem(STORAGE_KEY_V2);
}

export function hasUnfinishedSessionV2(): boolean {
  const session = loadSessionV2();
  return session !== null && session.studyCompletedAt === null;
}
