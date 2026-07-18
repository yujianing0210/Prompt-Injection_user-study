import type { FormalStudySession, StudySession, V2StudySession } from "../types/study";

export const STORAGE_KEY = "promptInjectionStudySession_v1";
export const STORAGE_KEY_V2 = "promptInjectionStudySession_v2";
export const FORMAL_STORAGE_KEY = "llmPromptReviewStudy_v1";

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

export function saveFormalSession(session: FormalStudySession): void {
  window.localStorage.setItem(FORMAL_STORAGE_KEY, JSON.stringify(session));
}

export function loadFormalSession(): FormalStudySession | null {
  const raw = window.localStorage.getItem(FORMAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as FormalStudySession;
    return session?.sessionId && Array.isArray(session.materialOrder) ? session : null;
  } catch {
    return null;
  }
}

export function clearFormalSession(): void {
  window.localStorage.removeItem(FORMAL_STORAGE_KEY);
}

export function hasUnfinishedFormalSession(): boolean {
  const session = loadFormalSession();
  return session !== null && session.completedAt === null;
}
