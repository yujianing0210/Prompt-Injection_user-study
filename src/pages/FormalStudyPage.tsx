import { useState } from "react";
import { AuthorshipChoice } from "../components/AuthorshipChoice";
import { LikertScale } from "../components/LikertScale";
import { QUESTION_TEXT } from "../config/questionText";
import type {
  AttachmentClickEvent,
  FormalStudySession,
  FormalTrialResponse,
  StudyMaterial,
} from "../types/study";
import { normalizeAttachments, shouldShowAiTag } from "../utils/materials";
import { durationMs, nowIso } from "../utils/timing";

type Props = {
  session: FormalStudySession;
  material: StudyMaterial;
  onAttachmentClick: (event: AttachmentClickEvent) => void;
  onPromptReveal: (revealedAt: string) => void;
  onSubmit: (response: FormalTrialResponse) => void;
};

export function FormalStudyPage({
  session,
  material,
  onAttachmentClick,
  onPromptReveal,
  onSubmit,
}: Props) {
  const [phase, setPhase] = useState<"rating" | "oral">("rating");
  const [appropriateness, setAppropriateness] = useState<number | null>(null);
  const [willingnessToUse, setWillingnessToUse] = useState<number | null>(null);
  const [perceivedSafety, setPerceivedSafety] = useState<number | null>(null);
  const [perceivedReliability, setPerceivedReliability] = useState<number | null>(null);
  const [perceivedAuthorship, setPerceivedAuthorship] = useState<"human" | "ai" | "uncertain" | null>(null);
  const [authorshipConfidence, setAuthorshipConfidence] = useState<number | null>(null);
  const [aiTagTrust, setAiTagTrust] = useState<number | null>(null);

  const hasAiTag = shouldShowAiTag(material, session.group);
  const attachments = normalizeAttachments(material);
  const trialIndex = session.currentTrialIndex;
  const promptIsRevealed = session.currentPromptIsRevealed;
  const isLast = trialIndex === session.materialOrder.length - 1;
  const complete = appropriateness !== null && willingnessToUse !== null &&
    perceivedSafety !== null && perceivedReliability !== null &&
    perceivedAuthorship !== null && authorshipConfidence !== null &&
    (!hasAiTag || aiTagTrust !== null);

  function recordAttachment(filename: string) {
    onAttachmentClick({ materialId: material.id, trialIndex, filename, clickedAt: nowIso() });
  }

  function revealPrompt() {
    if (!promptIsRevealed) onPromptReveal(nowIso());
  }

  function finishTrial() {
    const promptRevealedAt = session.currentPromptRevealedAt;
    if (!promptRevealedAt) return;
    const trialSubmittedAt = nowIso();
    const attachmentClicks = session.attachmentClickEvents
      .filter((event) => event.materialId === material.id && event.trialIndex === trialIndex)
      .map(({ filename, clickedAt }) => ({ filename, clickedAt }));
    onSubmit({
      participantId: session.participantId,
      group: session.group,
      sessionId: session.sessionId,
      trialIndex,
      stimulusId: material.id,
      scenarioTitle: material.display.scenario_title,
      taskType: material.metadata.task_type,
      scenario: material.metadata.scenario,
      specificContext: material.metadata.specific_context,
      actualAuthorship: material.metadata.authorship_style,
      condition: material.metadata.condition,
      primaryRisk: material.metadata.primary_risk,
      secondaryRisk: material.metadata.secondary_risk,
      riskTypeCN: material.metadata.risk_type_cn,
      hasAiTag,
      aiTagLabel: hasAiTag ? material.display.ai_detection_label.label_text : null,
      aiProbability: hasAiTag ? material.display.ai_detection_label.ai_probability : null,
      appropriateness,
      willingnessToUse,
      perceivedSafety,
      perceivedReliability,
      perceivedAuthorship,
      authorshipConfidence,
      aiTagTrust: hasAiTag ? aiTagTrust : null,
      attachmentClicks,
      trialStartedAt: session.currentTrialStartedAt,
      promptRevealedAt,
      trialSubmittedAt,
      timeBeforePromptRevealMs: durationMs(session.currentTrialStartedAt, promptRevealedAt),
      timeAfterPromptRevealMs: durationMs(promptRevealedAt, trialSubmittedAt),
      totalTrialDurationMs: durationMs(session.currentTrialStartedAt, trialSubmittedAt),
      researcherMaterial: material,
    });
  }

  return (
    <main className="study-trial-layout">
      <section className="material-panel" aria-label="研究材料">
        <div className="formal-progress" aria-label={`进度 ${trialIndex + 1} / ${session.materialOrder.length}`}>
          <div className="progress-bar__label"><span>进度</span><span>{trialIndex + 1} / {session.materialOrder.length}</span></div>
          <div className="progress-bar__track"><div className="progress-bar__fill" style={{ width: `${((trialIndex + 1) / session.materialOrder.length) * 100}%` }} /></div>
        </div>

        <h1>{material.display.scenario_title}</h1>
        <div className="scenario-context-card">{material.display.scenario_context}</div>

        {!promptIsRevealed ? (
          <button type="button" className="primary-button prompt-reveal-button" onClick={revealPrompt}>
            {QUESTION_TEXT.revealPrompt}
          </button>
        ) : (
          <>
            <p className="prompt-revealed-status" role="status">{QUESTION_TEXT.promptRevealed}</p>
            <div className="prompt-panel">
              <div className="prompt-panel__label">Prompt</div>
              <div className="stimulus-text">{material.display.prompt_text}</div>
              {attachments.length > 0 && (
                <div className="attachments prompt-panel__attachments">
                  <strong>{QUESTION_TEXT.attachments}</strong>
                  <ul>{attachments.map((attachment) => (
                    <li key={`${attachment.path}-${attachment.filename}`}>
                      <a href={attachment.path} target="_blank" rel="noopener noreferrer" onClick={() => recordAttachment(attachment.filename)}>
                        {attachment.filename}（{QUESTION_TEXT.attachmentHint}）
                      </a>
                    </li>
                  ))}</ul>
                </div>
              )}
              {hasAiTag && (
                <aside className="ai-tag-card prompt-panel__ai-tag" aria-label={QUESTION_TEXT.aiTagTitle}>
                  <strong>{QUESTION_TEXT.aiTagTitle}</strong>
                  <p>{material.display.ai_detection_label.label_text}</p>
                  <p>AI probability: {material.display.ai_detection_label.ai_probability}%</p>
                  <small>{material.display.ai_detection_label.note}</small>
                </aside>
              )}
            </div>
          </>
        )}
      </section>

      <section className="question-panel" aria-label="问卷问题">
        {phase === "rating" ? (
          <>
            {!promptIsRevealed ? (
              <div className="reveal-required-notice" role="status">{QUESTION_TEXT.revealRequired}</div>
            ) : (
              <>
                <h2>{QUESTION_TEXT.questionnaireTitle}</h2>
                <LikertScale name={`appropriateness-${trialIndex}`} legend={QUESTION_TEXT.appropriateness.label} lowLabel={QUESTION_TEXT.appropriateness.minLabel} highLabel={QUESTION_TEXT.appropriateness.maxLabel} value={appropriateness} onChange={setAppropriateness} />
                <LikertScale name={`willingness-${trialIndex}`} legend={QUESTION_TEXT.willingnessToUse.label} lowLabel={QUESTION_TEXT.willingnessToUse.minLabel} highLabel={QUESTION_TEXT.willingnessToUse.maxLabel} value={willingnessToUse} onChange={setWillingnessToUse} />
                <LikertScale name={`safety-${trialIndex}`} legend={QUESTION_TEXT.perceivedSafety.label} lowLabel={QUESTION_TEXT.perceivedSafety.minLabel} highLabel={QUESTION_TEXT.perceivedSafety.maxLabel} value={perceivedSafety} onChange={setPerceivedSafety} />
                <LikertScale name={`reliability-${trialIndex}`} legend={QUESTION_TEXT.perceivedReliability.label} lowLabel={QUESTION_TEXT.perceivedReliability.minLabel} highLabel={QUESTION_TEXT.perceivedReliability.maxLabel} value={perceivedReliability} onChange={setPerceivedReliability} />
                <AuthorshipChoice name={`authorship-${trialIndex}`} legend={QUESTION_TEXT.perceivedAuthorship.label} options={QUESTION_TEXT.perceivedAuthorship.options} value={perceivedAuthorship} onChange={setPerceivedAuthorship} />
                <LikertScale name={`confidence-${trialIndex}`} legend={QUESTION_TEXT.authorshipConfidence.label} lowLabel={QUESTION_TEXT.authorshipConfidence.minLabel} highLabel={QUESTION_TEXT.authorshipConfidence.maxLabel} value={authorshipConfidence} onChange={setAuthorshipConfidence} />
                {hasAiTag && <LikertScale name={`tag-trust-${trialIndex}`} legend={QUESTION_TEXT.aiTagTrust.label} lowLabel={QUESTION_TEXT.aiTagTrust.minLabel} highLabel={QUESTION_TEXT.aiTagTrust.maxLabel} value={aiTagTrust} onChange={setAiTagTrust} />}
              </>
            )}
            <div className="question-panel__footer">
              <button
                type="button"
                className="primary-button"
                disabled={!promptIsRevealed}
                onClick={() => {
                  if (!complete) {
                    window.alert(QUESTION_TEXT.completeAll);
                    return;
                  }
                  setPhase("oral");
                }}
              >
                {QUESTION_TEXT.next}
              </button>
            </div>
          </>
        ) : (
          <div className="oral-card">
            <h2>{QUESTION_TEXT.oralExplanation.label}</h2>
            <p>{QUESTION_TEXT.oralExplanation.instruction}</p>
            <div className="question-panel__footer">
              <button type="button" className="primary-button" onClick={finishTrial}>{isLast ? QUESTION_TEXT.oralExplanation.finishButton : QUESTION_TEXT.oralExplanation.button}</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
