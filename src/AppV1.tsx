import { useState } from "react";
import { WelcomePage } from "./pages/WelcomePage";
import { StudyPage } from "./pages/StudyPage";
import { CompletionPage } from "./pages/CompletionPage";
import { STIMULI } from "./data/stimuli";
import { shuffleArray } from "./utils/randomize";
import { nowIso } from "./utils/timing";
import { clearSession, loadSession, saveSession } from "./utils/storage";
import type { StudySession, TrialResponse } from "./types/study";

type AppScreen = "welcome" | "study" | "completion";

function createSession(participantId: string): StudySession {
  return {
    participantId,
    sessionId: crypto.randomUUID(),
    studyStartedAt: nowIso(),
    studyCompletedAt: null,
    randomizedStimulusIds: shuffleArray(STIMULI.map((s) => s.id)),
    currentTrialIndex: 0,
    responses: [],
  };
}

export function AppV1() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [session, setSession] = useState<StudySession | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  function handleStart(participantId: string) {
    const newSession = createSession(participantId);
    setIsPreview(false);
    saveSession(newSession);
    setSession(newSession);
    setScreen("study");
  }

  function handlePreview(participantId: string) {
    const newSession = createSession(participantId);
    setIsPreview(true);
    saveSession(newSession);
    setSession(newSession);
    setScreen("study");
  }

  function handleResume() {
    const existing = loadSession();
    if (existing) {
      setSession(existing);
      setScreen("study");
    }
  }

  function handleTrialSubmit(response: TrialResponse) {
    if (!session) {
      return;
    }

    const updatedResponses = [...session.responses, response];
    const isLastTrial =
      session.currentTrialIndex >= session.randomizedStimulusIds.length - 1;

    const updatedSession: StudySession = {
      ...session,
      responses: updatedResponses,
      currentTrialIndex: session.currentTrialIndex + 1,
      studyCompletedAt: isLastTrial ? nowIso() : null,
    };

    saveSession(updatedSession);
    setSession(updatedSession);

    if (isLastTrial) {
      setScreen("completion");
    }
  }

  function handleRestart() {
    clearSession();
    setSession(null);
    setIsPreview(false);
    setScreen("welcome");
  }

  if (screen === "study" && session) {
    return (
      <StudyPage
        session={session}
        onTrialSubmit={handleTrialSubmit}
        previewMode={isPreview}
      />
    );
  }

  if (screen === "completion" && session) {
    return <CompletionPage session={session} onRestart={handleRestart} />;
  }

  return (
    <WelcomePage
      onStart={handleStart}
      onPreview={handlePreview}
      onResume={handleResume}
    />
  );
}
