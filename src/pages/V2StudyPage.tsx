import { useEffect, useState } from "react";
import { V2ProgressBar } from "../components/V2ProgressBar";
import { AiTagBadge } from "../components/AiTagBadge";
import { AuthorshipChoice } from "../components/AuthorshipChoice";
import { LikertScale } from "../components/LikertScale";
import { STIMULI_V2 } from "../data/stimuliV2";
import { nowIso, durationMs } from "../utils/timing";
import type { V2StudySession, V2TrialResponse } from "../types/study";

type V2StudyPageProps = {
  session: V2StudySession;
  onTrialSubmit: (response: V2TrialResponse) => void;
  previewMode: boolean;
};

type V2TrialViewProps = {
  session: V2StudySession;
  trialIndex: number;
  onSubmit: (response: V2TrialResponse) => void;
  previewMode: boolean;
};

type AuthorshipValue = "human" | "ai" | "uncertain";

function V2TrialView({
  session,
  trialIndex,
  onSubmit,
  previewMode,
}: V2TrialViewProps) {
  const stimulusId = session.randomizedStimulusIds[trialIndex];
  const stimulus = STIMULI_V2.find((s) => s.id === stimulusId);
  const aiTag = session.aiTagsByStimulusId[stimulusId];

  const [phase, setPhase] = useState<"rating" | "reflection">("rating");

  const [textDisplayedAt] = useState(() => nowIso());
  const [firstQuestionAnsweredAt, setFirstQuestionAnsweredAt] = useState<
    string | null
  >(null);

  const [appropriateness, setAppropriateness] = useState<number | null>(null);
  const [willingness, setWillingness] = useState<number | null>(null);
  const [safety, setSafety] = useState<number | null>(null);
  const [trustworthiness, setTrustworthiness] = useState<number | null>(null);
  const [authorship, setAuthorship] = useState<AuthorshipValue | null>(null);
  const [authorshipConfidence, setAuthorshipConfidence] = useState<
    number | null
  >(null);
  const [aiTagTrust, setAiTagTrust] = useState<number | null>(null);

  const [ratingSubmittedAt, setRatingSubmittedAt] = useState<string | null>(
    null,
  );
  const [openEndedPromptDisplayedAt, setOpenEndedPromptDisplayedAt] =
    useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  if (!stimulus || !aiTag) {
    return null;
  }

  function markFirstAnswer() {
    setFirstQuestionAnsweredAt((prev) => prev ?? nowIso());
  }

  const canProceedToReflection =
    previewMode ||
    (appropriateness !== null &&
      willingness !== null &&
      safety !== null &&
      trustworthiness !== null &&
      authorship !== null &&
      authorshipConfidence !== null &&
      (!aiTag.visible || aiTagTrust !== null));

  function handleNext() {
    if (!canProceedToReflection) {
      return;
    }
    const submittedAt = nowIso();
    setRatingSubmittedAt(submittedAt);
    setOpenEndedPromptDisplayedAt(submittedAt);
    setPhase("reflection");
  }

  function handleContinue() {
    if (!stimulus || ratingSubmittedAt === null || openEndedPromptDisplayedAt === null) {
      return;
    }

    const continuedAt = nowIso();

    const response: V2TrialResponse = {
      participantId: session.participantId,
      sessionId: session.sessionId,
      version: "v2",
      trialIndex,
      stimulusId: stimulus.id,
      stimulusOrder: trialIndex,
      category: stimulus.category,
      scenario: stimulus.scenario,
      authorshipStyle: stimulus.authorshipStyle,
      injectionSource: stimulus.injectionSource,
      injectionStrategy: stimulus.injectionStrategy,
      languageStyle: stimulus.languageStyle,
      attackObjective: stimulus.attackObjective,
      targetTask: stimulus.targetTask,
      aiTag,
      aiTagTrust: aiTag.visible ? aiTagTrust : null,
      appropriatenessRating: appropriateness,
      willingnessToUse: willingness,
      perceivedSafety: safety,
      perceivedTrustworthiness: trustworthiness,
      perceivedAuthorship: authorship,
      authorshipConfidence,
      textDisplayedAt,
      firstQuestionAnsweredAt,
      ratingSubmittedAt,
      openEndedPromptDisplayedAt,
      openEndedPromptContinuedAt: continuedAt,
      ratingDurationMs: durationMs(textDisplayedAt, ratingSubmittedAt),
      openEndedPromptDurationMs: durationMs(
        openEndedPromptDisplayedAt,
        continuedAt,
      ),
      totalTrialDurationMs: durationMs(textDisplayedAt, continuedAt),
    };

    onSubmit(response);
  }

  const isLastTrial = trialIndex === session.randomizedStimulusIds.length - 1;

  return (
    <div className="v2-study-layout">
      <div className="v2-progress-section">
        <V2ProgressBar
          completedCount={session.currentTrialIndex}
          total={session.randomizedStimulusIds.length}
          phase={phase}
        />
      </div>

      <div className="v2-text-section">
        <div className="card stimulus-card">
          <AiTagBadge tag={aiTag} />
          <div className="stimulus-text">{stimulus.text}</div>
        </div>
      </div>

      <div className="v2-question-section">
        {phase === "rating" && (
          <div className="card">
            <LikertScale
              name="appropriatenessRating"
              legend="你觉得这段prompt / 文本是否合适？"
              lowLabel="非常不合适"
              highLabel="非常合适"
              value={appropriateness}
              onChange={(v) => {
                markFirstAnswer();
                setAppropriateness(v);
              }}
            />

            <LikertScale
              name="willingnessToUse"
              legend="如果你在真实场景中见到这段prompt / 文本，你愿意使用、执行或采纳它吗？"
              lowLabel="完全不愿意"
              highLabel="非常愿意"
              value={willingness}
              onChange={(v) => {
                markFirstAnswer();
                setWillingness(v);
              }}
            />

            <LikertScale
              name="perceivedSafety"
              legend="你认为这段prompt / 文本整体上有多安全？"
              lowLabel="非常不安全"
              highLabel="非常安全"
              value={safety}
              onChange={(v) => {
                markFirstAnswer();
                setSafety(v);
              }}
            />

            <LikertScale
              name="perceivedTrustworthiness"
              legend="你觉得这段prompt / 文本有多可信？"
              lowLabel="完全不可信"
              highLabel="非常可信"
              value={trustworthiness}
              onChange={(v) => {
                markFirstAnswer();
                setTrustworthiness(v);
              }}
            />

            <AuthorshipChoice
              name="perceivedAuthorship"
              legend="你认为这段prompt / 文本更可能由谁撰写？"
              value={authorship}
              onChange={(v) => {
                markFirstAnswer();
                setAuthorship(v);
              }}
            />

            <LikertScale
              name="authorshipConfidence"
              legend="你对上述作者身份判断有多大信心？"
              lowLabel="完全没有信心"
              highLabel="非常有信心"
              value={authorshipConfidence}
              onChange={(v) => {
                markFirstAnswer();
                setAuthorshipConfidence(v);
              }}
            />

            {aiTag.visible && (
              <LikertScale
                name="aiTagTrust"
                legend="你在多大程度上相信上方外部AI检测标签的判断？"
                lowLabel="完全不相信"
                highLabel="完全相信"
                value={aiTagTrust}
                onChange={(v) => {
                  markFirstAnswer();
                  setAiTagTrust(v);
                }}
              />
            )}

            <div className="trial__next">
              <button
                type="button"
                className="primary-button"
                disabled={!canProceedToReflection}
                onClick={handleNext}
              >
                Next: Explain Your Reasoning
              </button>
              {!canProceedToReflection && (
                <p className="inline-hint">
                  请完成当前页面所有问题后继续。
                </p>
              )}
            </div>
          </div>
        )}

        {phase === "reflection" && (
          <div className="card v2-reflection-card">
            <h2>请口头说明你做出上述判断的原因。</h2>
            <p className="v2-reflection-card__hint">你可以重点谈谈：</p>
            <ul className="v2-reflection-card__list">
              <li>这段文本中有哪些地方让你觉得合适或不合适？</li>
              <li>哪些地方影响了你是否愿意使用它？</li>
              <li>哪些地方影响了你对安全性和可信度的判断？</li>
              <li>你为什么认为它更像人类写的、AI写的，或不确定？</li>
              <li>
                如果页面上显示了AI检测标签，它是否影响了你的判断？为什么？
              </li>
            </ul>
            <div className="trial__next">
              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                {isLastTrial ? "Finish Study" : "Continue to Next Text"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function V2StudyPage({
  session,
  onTrialSubmit,
  previewMode,
}: V2StudyPageProps) {
  return (
    <V2TrialView
      key={session.currentTrialIndex}
      session={session}
      trialIndex={session.currentTrialIndex}
      onSubmit={onTrialSubmit}
      previewMode={previewMode}
    />
  );
}
