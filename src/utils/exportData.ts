import { STIMULI } from "../data/stimuli";
import type { StudySession, TrialResponse } from "../types/study";

const CSV_COLUMNS = [
  "participantId",
  "sessionId",
  "trialIndex",
  "stimulusId",
  "scenario",
  "injectionPresentAnswer",
  "participantHighlightTexts",
  "participantHighlightOffsets",
  "injectionSeverity",
  "perceivedSafety",
  "perceivedAuthorship",
  "authorshipConfidence",
  "willingnessToUse",
  "externalLabelVisible",
  "externalLabelAiProbability",
  "externalLabelTrust",
  "textDisplayedAt",
  "injectionDecisionAt",
  "trialSubmittedAt",
  "readingDecisionDurationMs",
  "highlightDurationMs",
  "totalTrialDurationMs",
] as const;

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function trialToCsvRow(trial: TrialResponse): string {
  const scenario = STIMULI.find((s) => s.id === trial.stimulusId)?.scenario ?? "";

  const values: Record<(typeof CSV_COLUMNS)[number], unknown> = {
    participantId: trial.participantId,
    sessionId: trial.sessionId,
    trialIndex: trial.trialIndex,
    stimulusId: trial.stimulusId,
    scenario,
    injectionPresentAnswer: trial.injectionPresentAnswer,
    participantHighlightTexts: JSON.stringify(
      trial.participantHighlights.map((h) => h.selectedText),
    ),
    participantHighlightOffsets: JSON.stringify(trial.participantHighlights),
    injectionSeverity: trial.injectionSeverity,
    perceivedSafety: trial.perceivedSafety,
    perceivedAuthorship: trial.perceivedAuthorship,
    authorshipConfidence: trial.authorshipConfidence,
    willingnessToUse: trial.willingnessToUse,
    externalLabelVisible: trial.externalLabelVisible,
    externalLabelAiProbability: trial.externalLabelAiProbability,
    externalLabelTrust: trial.externalLabelTrust,
    textDisplayedAt: trial.textDisplayedAt,
    injectionDecisionAt: trial.injectionDecisionAt,
    trialSubmittedAt: trial.trialSubmittedAt,
    readingDecisionDurationMs: trial.readingDecisionDurationMs,
    highlightDurationMs: trial.highlightDurationMs,
    totalTrialDurationMs: trial.totalTrialDurationMs,
  };

  return CSV_COLUMNS.map((column) => csvEscape(values[column])).join(",");
}

export function sessionToCsv(session: StudySession): string {
  const header = CSV_COLUMNS.join(",");
  const rows = session.responses.map(trialToCsvRow);
  return [header, ...rows].join("\n");
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function filenameFor(session: StudySession, extension: string): string {
  return `prompt-injection-study_${session.participantId}_${session.sessionId}.${extension}`;
}

export function downloadSessionJson(session: StudySession): void {
  downloadBlob(
    JSON.stringify(session, null, 2),
    filenameFor(session, "json"),
    "application/json",
  );
}

export function downloadSessionCsv(session: StudySession): void {
  downloadBlob(sessionToCsv(session), filenameFor(session, "csv"), "text/csv");
}
