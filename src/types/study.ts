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

  injectionPresentAnswer: "yes" | "no";
  injectionAnswerChangeCount: number;
  participantHighlights: HighlightRange[];

  injectionSeverity: number | null;
  perceivedSafety: number;
  perceivedAuthorship: "human" | "ai";
  authorshipConfidence: number;
  willingnessToUse: number;
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
