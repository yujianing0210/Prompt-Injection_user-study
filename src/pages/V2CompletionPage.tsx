import { downloadSessionCsvV2, downloadSessionJsonV2 } from "../utils/exportData";
import { durationMs } from "../utils/timing";
import type { V2StudySession } from "../types/study";

type V2CompletionPageProps = {
  session: V2StudySession;
  onRestart: () => void;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} 分 ${seconds.toString().padStart(2, "0")} 秒`;
}

export function V2CompletionPage({ session, onRestart }: V2CompletionPageProps) {
  const totalDurationMs = session.studyCompletedAt
    ? durationMs(session.studyStartedAt, session.studyCompletedAt)
    : 0;

  function handleRestart() {
    const confirmed = window.confirm(
      "确定要清空Version 2研究数据并重新开始吗？此操作无法撤销，且不会影响Version 1的数据。",
    );
    if (confirmed) {
      onRestart();
    }
  }

  return (
    <div className="page completion-page">
      <div className="card completion-screen">
        <h1>Version 2 Study Completed</h1>
        <p>感谢你完成本轮用户研究。</p>
        <dl className="completion-screen__summary">
          <div>
            <dt>Participant ID</dt>
            <dd>{session.participantId}</dd>
          </div>
          <div>
            <dt>总耗时</dt>
            <dd>{formatDuration(totalDurationMs)}</dd>
          </div>
          <div>
            <dt>已完成条目数</dt>
            <dd>{session.responses.length}</dd>
          </div>
        </dl>
        <div className="completion-screen__actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => downloadSessionJsonV2(session)}
          >
            Download JSON
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => downloadSessionCsvV2(session)}
          >
            Download CSV
          </button>
          <button type="button" className="secondary-button" onClick={handleRestart}>
            Restart Version 2
          </button>
        </div>
      </div>
    </div>
  );
}
