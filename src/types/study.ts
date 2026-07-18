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

// ---------------------------------------------------------------------------
// Formal study types
// ---------------------------------------------------------------------------

export type ParticipantGroup = "A" | "B";

export type MaterialAttachment = {
  file_id?: string;
  filename?: string;
  display_name?: string;
  path?: string;
  file_path?: string;
  label?: string;
  file_type?: string;
  is_required_to_open?: boolean;
};

export type StudyMaterial = {
  id: string;
  display: {
    scenario_title: string;
    scenario_context: string;
    attached_files?: MaterialAttachment[] | string[];
    ai_detection_label: {
      enabled_by_group: { group_A: boolean; group_B: boolean };
      target: string;
      label_text: string;
      ai_probability: number;
      note: string;
    };
    prompt_text: string;
  };
  metadata: {
    task_type: string;
    scenario: string;
    specific_context: string;
    authorship_style: "human_style" | "ai_style";
    condition: "risk" | "control";
    primary_risk: string;
    secondary_risk?: string;
    risk_type_cn: string;
    has_attachment: boolean;
    material_version: string;
    ai_tag_group_A: "Yes" | "No";
    ai_tag_group_B: "Yes" | "No";
  };
  ground_truth: {
    contains_risk: boolean;
    ground_truth_span: null | { selected_text: string };
    risk_explanation: string;
    expected_user_challenge: string;
  };
};

export type AttachmentClick = { filename: string; clickedAt: string };

export type AttachmentClickEvent = AttachmentClick & {
  materialId: string;
  trialIndex: number;
};

export type FormalTrialResponse = {
  participantId: string;
  group: ParticipantGroup;
  sessionId: string;
  trialIndex: number;
  stimulusId: string;
  scenarioTitle: string;
  taskType: string;
  scenario: string;
  specificContext: string;
  actualAuthorship: "human_style" | "ai_style";
  condition: "risk" | "control";
  primaryRisk: string;
  secondaryRisk?: string;
  riskTypeCN: string;
  hasAiTag: boolean;
  aiTagLabel: string | null;
  aiProbability: number | null;
  appropriateness: number | null;
  willingnessToUse: number | null;
  perceivedSafety: number | null;
  perceivedReliability: number | null;
  perceivedAuthorship: "human" | "ai" | "uncertain" | null;
  authorshipConfidence: number | null;
  aiTagTrust: number | null;
  attachmentClicks: AttachmentClick[];
  trialStartedAt: string;
  promptRevealedAt: string | null;
  trialSubmittedAt: string | null;
  timeBeforePromptRevealMs: number | null;
  timeAfterPromptRevealMs: number | null;
  totalTrialDurationMs: number | null;
  researcherMaterial: StudyMaterial;
};

export type FormalStudySession = {
  participantId: string;
  group: ParticipantGroup;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  materialOrder: string[];
  currentTrialIndex: number;
  currentTrialStartedAt: string;
  currentPromptRevealedAt: string | null;
  currentPromptIsRevealed: boolean;
  responses: FormalTrialResponse[];
  attachmentClickEvents: AttachmentClickEvent[];
};
