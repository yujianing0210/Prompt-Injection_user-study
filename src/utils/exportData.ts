import { STIMULI } from "../data/stimuli";
import type { StudySession, TrialResponse, V2StudySession, V2TrialResponse } from "../types/study";

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

const NA = "NA";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? NA : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function naJsonReplacer(_key: string, value: unknown): unknown {
  return value === null ? NA : value;
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
    JSON.stringify(session, naJsonReplacer, 2),
    filenameFor(session, "json"),
    "application/json",
  );
}

export function downloadSessionCsv(session: StudySession): void {
  downloadBlob(sessionToCsv(session), filenameFor(session, "csv"), "text/csv");
}

// ---------------------------------------------------------------------------
// Version 2
// ---------------------------------------------------------------------------

const CSV_COLUMNS_V2 = [
  "participantId",
  "sessionId",
  "version",
  "trialIndex",
  "stimulusId",
  "category",
  "scenario",
  "authorshipStyle",
  "injectionSource",
  "injectionStrategy",
  "languageStyle",
  "attackObjective",
  "targetTask",
  "aiTagVisible",
  "aiTagLabel",
  "aiTagAiProbability",
  "aiTagConsistentWithAuthorshipStyle",
  "appropriatenessRating",
  "willingnessToUse",
  "perceivedSafety",
  "perceivedTrustworthiness",
  "perceivedAuthorship",
  "authorshipConfidence",
  "aiTagTrust",
  "textDisplayedAt",
  "ratingSubmittedAt",
  "openEndedPromptDisplayedAt",
  "openEndedPromptContinuedAt",
  "ratingDurationMs",
  "openEndedPromptDurationMs",
  "totalTrialDurationMs",
] as const;

function trialToCsvRowV2(trial: V2TrialResponse): string {
  const values: Record<(typeof CSV_COLUMNS_V2)[number], unknown> = {
    participantId: trial.participantId,
    sessionId: trial.sessionId,
    version: trial.version,
    trialIndex: trial.trialIndex,
    stimulusId: trial.stimulusId,
    category: trial.category,
    scenario: trial.scenario,
    authorshipStyle: trial.authorshipStyle,
    injectionSource: trial.injectionSource,
    injectionStrategy: trial.injectionStrategy,
    languageStyle: trial.languageStyle,
    attackObjective: trial.attackObjective,
    targetTask: trial.targetTask,
    aiTagVisible: trial.aiTag.visible,
    aiTagLabel: trial.aiTag.visible ? trial.aiTag.label : null,
    aiTagAiProbability: trial.aiTag.aiProbability,
    aiTagConsistentWithAuthorshipStyle: trial.aiTag.isConsistentWithAuthorshipStyle,
    appropriatenessRating: trial.appropriatenessRating,
    willingnessToUse: trial.willingnessToUse,
    perceivedSafety: trial.perceivedSafety,
    perceivedTrustworthiness: trial.perceivedTrustworthiness,
    perceivedAuthorship: trial.perceivedAuthorship,
    authorshipConfidence: trial.authorshipConfidence,
    aiTagTrust: trial.aiTagTrust,
    textDisplayedAt: trial.textDisplayedAt,
    ratingSubmittedAt: trial.ratingSubmittedAt,
    openEndedPromptDisplayedAt: trial.openEndedPromptDisplayedAt,
    openEndedPromptContinuedAt: trial.openEndedPromptContinuedAt,
    ratingDurationMs: trial.ratingDurationMs,
    openEndedPromptDurationMs: trial.openEndedPromptDurationMs,
    totalTrialDurationMs: trial.totalTrialDurationMs,
  };

  return CSV_COLUMNS_V2.map((column) => csvEscape(values[column])).join(",");
}

export function sessionToCsvV2(session: V2StudySession): string {
  const header = CSV_COLUMNS_V2.join(",");
  const rows = session.responses.map(trialToCsvRowV2);
  return [header, ...rows].join("\n");
}

function filenameForV2(session: V2StudySession, extension: string): string {
  return `prompt-injection-study-v2_${session.participantId}_${session.sessionId}.${extension}`;
}

export function downloadSessionJsonV2(session: V2StudySession): void {
  downloadBlob(
    JSON.stringify(session, naJsonReplacer, 2),
    filenameForV2(session, "json"),
    "application/json",
  );
}

export function downloadSessionCsvV2(session: V2StudySession): void {
  downloadBlob(
    sessionToCsvV2(session),
    filenameForV2(session, "csv"),
    "text/csv",
  );
}
