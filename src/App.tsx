import { useEffect, useMemo, useState } from "react";
import { FormalAnalysisPage } from "./pages/FormalAnalysisPage";
import { FormalCompletionPage } from "./pages/FormalCompletionPage";
import { FormalSetupPage } from "./pages/FormalSetupPage";
import { FormalStudyPage } from "./pages/FormalStudyPage";
import type {
  AttachmentClickEvent,
  FormalStudySession,
  FormalTrialResponse,
  ParticipantGroup,
  StudyMaterial,
} from "./types/study";
import { generateValidOrder } from "./utils/constrainedRandomize";
import { loadMaterials, validateMaterials } from "./utils/materials";
import {
  clearFormalSession,
  loadFormalSession,
  saveFormalSession,
} from "./utils/storage";
import { nowIso } from "./utils/timing";

type Screen = "setup" | "study" | "completion" | "analysis";

function App() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<FormalStudySession | null>(null);
  const [resumableSession, setResumableSession] = useState<FormalStudySession | null>(() => {
    const existing = loadFormalSession();
    return existing?.completedAt === null ? existing : null;
  });
  const [screen, setScreen] = useState<Screen>("setup");

  useEffect(() => {
    let cancelled = false;
    loadMaterials()
      .then((loaded) => {
        if (!cancelled) {
          setMaterials(loaded);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "材料加载失败。");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const validationErrors = useMemo(
    () => (loading || loadError ? [] : validateMaterials(materials)),
    [loading, loadError, materials],
  );
  const materialById = useMemo(() => new Map(materials.map((material) => [material.id, material])), [materials]);

  function start(participantId: string, group: ParticipantGroup) {
    if (resumableSession && !window.confirm("开始新研究将覆盖当前未完成记录。确定继续吗？")) return;
    const order = generateValidOrder(materials, group);
    const created: FormalStudySession = {
      participantId,
      group,
      sessionId: crypto.randomUUID(),
      startedAt: nowIso(),
      completedAt: null,
      materialOrder: order.map((material) => material.id),
      currentTrialIndex: 0,
      currentTrialStartedAt: nowIso(),
      currentPromptRevealedAt: null,
      currentPromptIsRevealed: false,
      responses: [],
      attachmentClickEvents: [],
    };
    saveFormalSession(created);
    setSession(created);
    setResumableSession(created);
    setScreen("study");
  }

  function resume() {
    const existing = loadFormalSession();
    if (existing && existing.completedAt === null) {
      const resumed: FormalStudySession = {
        ...existing,
        currentTrialStartedAt: existing.currentTrialStartedAt ?? nowIso(),
        currentPromptRevealedAt: existing.currentPromptRevealedAt ?? null,
        currentPromptIsRevealed: existing.currentPromptIsRevealed ?? false,
      };
      saveFormalSession(resumed);
      setSession(resumed);
      setScreen("study");
    }
  }

  function clear() {
    clearFormalSession();
    setSession(null);
    setResumableSession(null);
    setScreen("setup");
  }

  function recordAttachment(event: AttachmentClickEvent) {
    setSession((current) => {
      if (!current) return current;
      const updated = { ...current, attachmentClickEvents: [...current.attachmentClickEvents, event] };
      saveFormalSession(updated);
      return updated;
    });
  }

  function revealPrompt(revealedAt: string) {
    setSession((current) => {
      if (!current || current.currentPromptIsRevealed) return current;
      const updated = {
        ...current,
        currentPromptRevealedAt: revealedAt,
        currentPromptIsRevealed: true,
      };
      saveFormalSession(updated);
      return updated;
    });
  }

  function submitTrial(response: FormalTrialResponse) {
    setSession((current) => {
      if (!current) return current;
      const isLast = current.currentTrialIndex === current.materialOrder.length - 1;
      const updated: FormalStudySession = {
        ...current,
        responses: [...current.responses, response],
        currentTrialIndex: current.currentTrialIndex + 1,
        currentTrialStartedAt: isLast ? current.currentTrialStartedAt : nowIso(),
        currentPromptRevealedAt: null,
        currentPromptIsRevealed: false,
        completedAt: isLast ? nowIso() : null,
      };
      saveFormalSession(updated);
      setResumableSession(isLast ? null : updated);
      if (isLast) setScreen("completion");
      return updated;
    });
  }

  if (screen === "study" && session) {
    const materialId = session.materialOrder[session.currentTrialIndex];
    const material = materialById.get(materialId);
    if (!material) {
      return <FormalSetupPage loading={false} loadError={`无法找到当前材料：${materialId}`} validationErrors={[]} resumableSession={session} onStart={start} onResume={resume} onClear={clear} />;
    }
    return <FormalStudyPage key={`${session.sessionId}-${session.currentTrialIndex}`} session={session} material={material} onAttachmentClick={recordAttachment} onPromptReveal={revealPrompt} onSubmit={submitTrial} />;
  }

  if (screen === "completion" && session) {
    return <FormalCompletionPage session={session} onAnalyze={() => setScreen("analysis")} onRestart={clear} />;
  }

  if (screen === "analysis" && session) {
    return <FormalAnalysisPage session={session} onBack={() => setScreen("completion")} />;
  }

  return <FormalSetupPage loading={loading} loadError={loadError} validationErrors={validationErrors} resumableSession={resumableSession} onStart={start} onResume={resume} onClear={clear} />;
}

export default App;
