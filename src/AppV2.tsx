import { useState } from "react";
import { V2WelcomePage } from "./pages/V2WelcomePage";
import { V2StudyPage } from "./pages/V2StudyPage";
import { V2CompletionPage } from "./pages/V2CompletionPage";
import { STIMULI_V2 } from "./data/stimuliV2";
import { shuffleArray } from "./utils/randomize";
import { assignAiTags } from "./utils/aiTagAssignment";
import { nowIso } from "./utils/timing";
import {
  clearSessionV2,
  loadSessionV2,
  saveSessionV2,
} from "./utils/storage";
import type { V2StudySession, V2TrialResponse } from "./types/study";

type AppScreen = "welcome" | "study" | "completion";

function createSessionV2(participantId: string): V2StudySession {
  const { taggedStimulusIds, aiTagsByStimulusId } = assignAiTags();

  return {
    participantId,
    sessionId: crypto.randomUUID(),
    version: "v2",
    studyStartedAt: nowIso(),
    studyCompletedAt: null,
    randomizedStimulusIds: shuffleArray(STIMULI_V2.map((s) => s.id)),
    taggedStimulusIds,
    aiTagsByStimulusId,
    currentTrialIndex: 0,
    currentPhase: "rating",
    responses: [],
  };
}

export function AppV2() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [session, setSession] = useState<V2StudySession | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  function handleStart(participantId: string) {
    const newSession = createSessionV2(participantId);
    setIsPreview(false);
    saveSessionV2(newSession);
    setSession(newSession);
    setScreen("study");
  }

  function handlePreview(participantId: string) {
    const newSession = createSessionV2(participantId);
    setIsPreview(true);
    saveSessionV2(newSession);
    setSession(newSession);
    setScreen("study");
  }

  function handleResume() {
    const existing = loadSessionV2();
    if (existing) {
      setSession(existing);
      setScreen("study");
    }
  }

  function handleTrialSubmit(response: V2TrialResponse) {
    if (!session) {
      return;
    }

    const updatedResponses = [...session.responses, response];
    const isLastTrial =
      session.currentTrialIndex >= session.randomizedStimulusIds.length - 1;

    const updatedSession: V2StudySession = {
      ...session,
      responses: updatedResponses,
      currentTrialIndex: session.currentTrialIndex + 1,
      currentPhase: isLastTrial ? "completed" : "rating",
      studyCompletedAt: isLastTrial ? nowIso() : null,
    };

    saveSessionV2(updatedSession);
    setSession(updatedSession);

    if (isLastTrial) {
      setScreen("completion");
    }
  }

  function handleRestart() {
    clearSessionV2();
    setSession(null);
    setIsPreview(false);
    setScreen("welcome");
  }

  if (screen === "study" && session) {
    return (
      <V2StudyPage
        session={session}
        onTrialSubmit={handleTrialSubmit}
        previewMode={isPreview}
      />
    );
  }

  if (screen === "completion" && session) {
    return <V2CompletionPage session={session} onRestart={handleRestart} />;
  }

  return (
    <V2WelcomePage
      onStart={handleStart}
      onPreview={handlePreview}
      onResume={handleResume}
    />
  );
}
