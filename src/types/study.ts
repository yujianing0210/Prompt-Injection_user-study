export type HighlightRange = {
  startOffset: number;
  endOffset: number;
  selectedText: string;
};

export type ExternalLabelCategory =
  | "very_likely_ai"
  | "likely_ai"
  | "uncertain"
  | "likely_human";

export type ExternalLabel = {
  visible: boolean;
  aiProbability: number | null;
  category: ExternalLabelCategory | null;
};

export type Stimulus = {
  id: string;
  scenario: string;
  text: string;

  // Researcher-only fields; never display in participant UI.
  containsInjection: boolean;
  injectionCategory: string;
  groundTruthHighlights: HighlightRange[];
  intendedInjectedAction: string;
  actualAuthorship: "human" | "ai";

  externalLabel: ExternalLabel;
};

export type TrialResponse = {
  participantId: string;
  sessionId: string;
  trialIndex: number;
  stimulusId: string;
  stimulusOrder: number;

  injectionPresentAnswer: "yes" | "no" | null;
  injectionAnswerChangeCount: number;
  participantHighlights: HighlightRange[];

  injectionSeverity: number | null;
  perceivedSafety: number | null;
  perceivedAuthorship: "human" | "ai" | null;
  authorshipConfidence: number | null;
  willingnessToUse: number | null;
  externalLabelTrust: number | null;

  textDisplayedAt: string;
  injectionDecisionAt: string;
  highlightStartedAt: string | null;
  highlightCompletedAt: string | null;
  trialSubmittedAt: string;

  readingDecisionDurationMs: number;
  highlightDurationMs: number | null;
  totalTrialDurationMs: number;

  externalLabelVisible: boolean;
  externalLabelAiProbability: number | null;
};

export type StudySession = {
  participantId: string;
  sessionId: string;
  studyStartedAt: string;
  studyCompletedAt: string | null;
  randomizedStimulusIds: string[];
  currentTrialIndex: number;
  responses: TrialResponse[];
};

// ---------------------------------------------------------------------------
// Version 2 types
// ---------------------------------------------------------------------------

export type V2Stimulus = {
  id: string;
  category: string;
  scenario: string;
  authorshipStyle: "human_written_style" | "ai_written_style";
  injectionSource: "direct" | "indirect";
  injectionStrategy: string;
  languageStyle: string;
  attackObjective: string;
  targetTask: string;
  text: string;

  // Researcher-only fields; never display in participant UI.
  groundTruthInjection: string;
  groundTruthSpan: HighlightRange;
  expectedInjectedOutput: string;
  containsInjection: boolean;
  language: string;
};

export type V2AiAuthorshipTag = {
  visible: boolean;
  label: "likely_ai" | "likely_human" | "uncertain";
  aiProbability: number | null;
  isConsistentWithAuthorshipStyle: boolean | null;
};

export type V2TrialResponse = {
  participantId: string;
  sessionId: string;
  version: "v2";

  trialIndex: number;
  stimulusId: string;
  stimulusOrder: number;

  // Stimulus metadata
  category: string;
  scenario: string;
  authorshipStyle: "human_written_style" | "ai_written_style";
  injectionSource: "direct" | "indirect";
  injectionStrategy: string;
  languageStyle: string;
  attackObjective: string;
  targetTask: string;

  // AI tag condition
  aiTag: V2AiAuthorshipTag;
  aiTagTrust: number | null;

  // User ratings
  appropriatenessRating: number | null;
  willingnessToUse: number | null;
  perceivedSafety: number | null;
  perceivedTrustworthiness: number | null;
  perceivedAuthorship: "human" | "ai" | "uncertain" | null;
  authorshipConfidence: number | null;

  // Timing
  textDisplayedAt: string;
  firstQuestionAnsweredAt: string | null;
  ratingSubmittedAt: string;
  openEndedPromptDisplayedAt: string;
  openEndedPromptContinuedAt: string;

  ratingDurationMs: number;
  openEndedPromptDurationMs: number;
  totalTrialDurationMs: number;
};

export type V2StudySession = {
  participantId: string;
  sessionId: string;
  version: "v2";
  studyStartedAt: string;
  studyCompletedAt: string | null;
  randomizedStimulusIds: string[];
  taggedStimulusIds: string[];
  aiTagsByStimulusId: Record<string, V2AiAuthorshipTag>;
  currentTrialIndex: number;
  currentPhase: "rating" | "reflection" | "completed";
  responses: V2TrialResponse[];
};
