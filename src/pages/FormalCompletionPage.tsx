import { QUESTION_TEXT } from "../config/questionText";
import type { FormalStudySession } from "../types/study";
import { downloadFormalSessionCsv, downloadFormalSessionJson } from "../utils/exportData";
import { durationMs } from "../utils/timing";

type Props = { session: FormalStudySession; onAnalyze: () => void; onRestart: () => void };

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)} 分 ${String(seconds % 60).padStart(2, "0")} 秒`;
}

export function FormalCompletionPage({ session, onAnalyze, onRestart }: Props) {
  const elapsed = session.completedAt ? durationMs(session.startedAt, session.completedAt) : 0;
  function restart() {
    if (window.confirm("确定已下载研究数据，并清除本次记录重新开始吗？")) onRestart();
  }
  return (
    <main className="page completion-page">
      <section className="card completion-screen">
        <h1>{QUESTION_TEXT.completedTitle}</h1>
        <p>{QUESTION_TEXT.completedThanks}</p>
        <dl className="completion-screen__summary">
          <div><dt>Participant ID</dt><dd>{session.participantId}</dd></div>
          <div><dt>Group</dt><dd>{session.group}</dd></div>
          <div><dt>完成条目</dt><dd>{session.responses.length}</dd></div>
          <div><dt>总耗时</dt><dd>{formatDuration(elapsed)}</dd></div>
        </dl>
        <div className="completion-screen__actions">
          <button type="button" className="primary-button" onClick={() => downloadFormalSessionJson(session)}>{QUESTION_TEXT.downloadJson}</button>
          <button type="button" className="primary-button" onClick={() => downloadFormalSessionCsv(session)}>{QUESTION_TEXT.downloadCsv}</button>
          <button type="button" className="secondary-button" onClick={onAnalyze}>{QUESTION_TEXT.viewAnalysis}</button>
          <button type="button" className="secondary-button" onClick={restart}>{QUESTION_TEXT.restart}</button>
        </div>
      </section>
    </main>
  );
}
