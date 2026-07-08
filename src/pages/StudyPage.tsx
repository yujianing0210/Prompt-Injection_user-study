import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { StimulusCard } from "../components/StimulusCard";
import { BinaryQuestion } from "../components/BinaryQuestion";
import { LikertScale } from "../components/LikertScale";
import { STIMULI } from "../data/stimuli";
import { nowIso, durationMs } from "../utils/timing";
import type { HighlightRange, StudySession, TrialResponse } from "../types/study";

type StudyPageProps = {
  session: StudySession;
  onTrialSubmit: (response: TrialResponse) => void;
};

type TrialViewProps = {
  session: StudySession;
  trialIndex: number;
  onSubmit: (response: TrialResponse) => void;
};

function TrialView({ session, trialIndex, onSubmit }: TrialViewProps) {
  const stimulusId = session.randomizedStimulusIds[trialIndex];
  const stimulus = STIMULI.find((s) => s.id === stimulusId);

  const [textDisplayedAt] = useState(() => nowIso());
  const [injectionPresentAnswer, setInjectionPresentAnswer] = useState<
    "yes" | "no" | null
  >(null);
  const [firstDecisionAt, setFirstDecisionAt] = useState<string | null>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [showClearedHint, setShowClearedHint] = useState(false);

  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [highlightStartedAt, setHighlightStartedAt] = useState<string | null>(
    null,
  );
  const [highlightConfirmed, setHighlightConfirmed] = useState(false);
  const [highlightCompletedAt, setHighlightCompletedAt] = useState<
    string | null
  >(null);

  const [severity, setSeverity] = useState<number | null>(null);
  const [safety, setSafety] = useState<number | null>(null);
  const [authorship, setAuthorship] = useState<"human" | "ai" | null>(null);
  const [authorshipConfidence, setAuthorshipConfidence] = useState<
    number | null
  >(null);
  const [willingness, setWillingness] = useState<number | null>(null);
  const [labelTrust, setLabelTrust] = useState<number | null>(null);

  const clearedHintTimeout = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    return () => {
      if (clearedHintTimeout.current !== null) {
        window.clearTimeout(clearedHintTimeout.current);
      }
    };
  }, []);

  if (!stimulus) {
    return null;
  }

  const highlightingActive = injectionPresentAnswer === "yes" && !highlightConfirmed;
  const phase3Visible =
    injectionPresentAnswer === "no" ||
    (injectionPresentAnswer === "yes" && highlightConfirmed);

  function handleAnswerChange(newValue: "yes" | "no") {
    if (injectionPresentAnswer !== null && injectionPresentAnswer !== newValue) {
      setChangeCount((c) => c + 1);
    }
    if (firstDecisionAt === null) {
      setFirstDecisionAt(nowIso());
    }

    if (newValue === "no" && injectionPresentAnswer === "yes") {
      setHighlights([]);
      setHighlightConfirmed(false);
      setHighlightStartedAt(null);
      setHighlightCompletedAt(null);
      setSeverity(null);
      setShowClearedHint(true);
      if (clearedHintTimeout.current !== null) {
        window.clearTimeout(clearedHintTimeout.current);
      }
      clearedHintTimeout.current = window.setTimeout(() => {
        setShowClearedHint(false);
      }, 4000);
    }

    if (newValue === "yes" && injectionPresentAnswer !== "yes") {
      setHighlightConfirmed(false);
    }

    setInjectionPresentAnswer(newValue);
  }

  function handleFirstHighlightInteraction() {
    setHighlightStartedAt((prev) => prev ?? nowIso());
  }

  function handleContinue() {
    setHighlightCompletedAt(nowIso());
    setHighlightConfirmed(true);
  }

  const canSubmit =
    phase3Visible &&
    injectionPresentAnswer !== null &&
    (injectionPresentAnswer === "no" || severity !== null) &&
    safety !== null &&
    authorship !== null &&
    authorshipConfidence !== null &&
    willingness !== null &&
    (!stimulus.externalLabel.visible || labelTrust !== null);

  function handleNext() {
    if (!canSubmit || !injectionPresentAnswer) {
      return;
    }

    const trialSubmittedAt = nowIso();
    const decisionAt = firstDecisionAt ?? trialSubmittedAt;

    const response: TrialResponse = {
      participantId: session.participantId,
      sessionId: session.sessionId,
      trialIndex,
      stimulusId: stimulus.id,
      stimulusOrder: trialIndex,
      injectionPresentAnswer,
      injectionAnswerChangeCount: changeCount,
      participantHighlights: highlights,
      injectionSeverity: injectionPresentAnswer === "yes" ? severity : null,
      perceivedSafety: safety as number,
      perceivedAuthorship: authorship as "human" | "ai",
      authorshipConfidence: authorshipConfidence as number,
      willingnessToUse: willingness as number,
      externalLabelTrust: stimulus.externalLabel.visible ? labelTrust : null,
      textDisplayedAt,
      injectionDecisionAt: decisionAt,
      highlightStartedAt,
      highlightCompletedAt,
      trialSubmittedAt,
      readingDecisionDurationMs: durationMs(textDisplayedAt, decisionAt),
      highlightDurationMs: highlightCompletedAt
        ? durationMs(decisionAt, highlightCompletedAt)
        : null,
      totalTrialDurationMs: durationMs(textDisplayedAt, trialSubmittedAt),
      externalLabelVisible: stimulus.externalLabel.visible,
      externalLabelAiProbability: stimulus.externalLabel.aiProbability,
    };

    onSubmit(response);
  }

  const isLastTrial = trialIndex === session.randomizedStimulusIds.length - 1;

  return (
    <div className="trial">
      <StimulusCard
        stimulusIndex={trialIndex + 1}
        stimulus={stimulus}
        highlightMode={highlightingActive}
        highlights={highlights}
        onHighlightsChange={setHighlights}
        onFirstInteraction={handleFirstHighlightInteraction}
      />

      <div className="card">
        <BinaryQuestion
          name="injectionPresent"
          legend="你认为这段文本中是否存在prompt injection？"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={injectionPresentAnswer}
          onChange={(value) => handleAnswerChange(value as "yes" | "no")}
        />

        {showClearedHint && (
          <p className="inline-hint">
            Your previous highlights were cleared because you selected “No.”
          </p>
        )}

        {highlightingActive && (
          <div className="phase-continue">
            <button
              type="button"
              className="primary-button"
              disabled={highlights.length === 0}
              onClick={handleContinue}
            >
              Continue
            </button>
            {highlights.length === 0 && (
              <p className="inline-hint">请至少高亮一处内容后再继续。</p>
            )}
          </div>
        )}

        {phase3Visible && (
          <div className="phase3-questions">
            {injectionPresentAnswer === "yes" && (
              <LikertScale
                name="injectionSeverity"
                legend="你认为这段文本中的prompt injection有多严重？"
                lowLabel="完全不严重"
                highLabel="非常严重"
                value={severity}
                onChange={setSeverity}
              />
            )}

            <LikertScale
              name="perceivedSafety"
              legend="你认为这段文本整体上有多安全？"
              lowLabel="非常不安全"
              highLabel="非常安全"
              value={safety}
              onChange={setSafety}
            />

            <BinaryQuestion
              name="perceivedAuthorship"
              legend="你认为这段文本更可能由谁撰写？"
              options={[
                { value: "human", label: "Human" },
                { value: "ai", label: "AI" },
              ]}
              value={authorship}
              onChange={(value) => setAuthorship(value as "human" | "ai")}
            />

            <LikertScale
              name="authorshipConfidence"
              legend="你对上述作者身份判断有多大信心？"
              lowLabel="完全没有信心"
              highLabel="非常有信心"
              value={authorshipConfidence}
              onChange={setAuthorshipConfidence}
            />

            <LikertScale
              name="willingnessToUse"
              legend="如果你在真实场景中看到这段prompt，你愿意使用、执行或采纳它吗？"
              lowLabel="完全不愿意"
              highLabel="非常愿意"
              value={willingness}
              onChange={setWillingness}
            />

            {stimulus.externalLabel.visible && (
              <LikertScale
                name="externalLabelTrust"
                legend="你在多大程度上相信上方外部工具对文本作者身份的判断？"
                lowLabel="完全不相信"
                highLabel="完全相信"
                value={labelTrust}
                onChange={setLabelTrust}
              />
            )}
          </div>
        )}

        <div className="trial__next">
          <button
            type="button"
            className="primary-button"
            disabled={!canSubmit}
            onClick={handleNext}
          >
            {isLastTrial ? "Finish Study" : "Next"}
          </button>
          {!canSubmit && (
            <p className="inline-hint">
              Please answer all required questions before continuing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudyPage({ session, onTrialSubmit }: StudyPageProps) {
  return (
    <div className="page study-page">
      <ProgressBar
        current={session.currentTrialIndex}
        total={session.randomizedStimulusIds.length}
      />
      <TrialView
        key={session.currentTrialIndex}
        session={session}
        trialIndex={session.currentTrialIndex}
        onSubmit={onTrialSubmit}
      />
    </div>
  );
}
