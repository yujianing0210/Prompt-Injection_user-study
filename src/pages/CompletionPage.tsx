import { CompletionScreen } from "../components/CompletionScreen";
import { downloadSessionCsv, downloadSessionJson } from "../utils/exportData";
import { durationMs } from "../utils/timing";
import type { StudySession } from "../types/study";

type CompletionPageProps = {
  session: StudySession;
  onRestart: () => void;
};

export function CompletionPage({ session, onRestart }: CompletionPageProps) {
  const totalDurationMs = session.studyCompletedAt
    ? durationMs(session.studyStartedAt, session.studyCompletedAt)
    : 0;

  function handleRestart() {
    const confirmed = window.confirm(
      "确定要清空本次研究数据并重新开始demo吗？此操作无法撤销。",
    );
    if (confirmed) {
      onRestart();
    }
  }

  return (
    <div className="page completion-page">
      <CompletionScreen
        participantId={session.participantId}
        totalDurationMs={totalDurationMs}
        onDownloadJson={() => downloadSessionJson(session)}
        onDownloadCsv={() => downloadSessionCsv(session)}
        onRestart={handleRestart}
      />
    </div>
  );
}
