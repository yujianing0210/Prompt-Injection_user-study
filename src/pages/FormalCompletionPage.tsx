import { useEffect, useState } from "react";
import { QUESTION_TEXT } from "../config/questionText";
import type { FormalStudySession } from "../types/study";
import { saveFormalSession } from "../utils/exportData";
import { durationMs } from "../utils/timing";

type Props = { session: FormalStudySession; onAnalyze: () => void; onRestart: () => void };

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)} 分 ${String(seconds % 60).padStart(2, "0")} 秒`;
}

export function FormalCompletionPage({ session, onAnalyze, onRestart }: Props) {
  const elapsed = session.completedAt ? durationMs(session.startedAt, session.completedAt) : 0;
  const [saveStatus, setSaveStatus] = useState("正在保存 JSON 和 CSV 结果…");

  useEffect(() => {
    let cancelled = false;
    saveFormalSession(session)
      .then((directory) => {
        if (!cancelled) setSaveStatus(`结果已自动保存至 ${directory}/`);
      })
      .catch((error: unknown) => {
        if (!cancelled) setSaveStatus(`自动保存失败：${error instanceof Error ? error.message : "未知错误"}`);
      });
    return () => { cancelled = true; };
  }, [session]);

  function restart() {
    if (window.confirm("确定要清除本次浏览器记录并重新开始吗？已保存到 results 文件夹的结果不会被删除。")) onRestart();
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
        <p role="status">{saveStatus}</p>
        <div className="completion-screen__actions">
          <button type="button" className="secondary-button" onClick={onAnalyze}>{QUESTION_TEXT.viewAnalysis}</button>
          <button type="button" className="secondary-button" onClick={restart}>{QUESTION_TEXT.restart}</button>
        </div>
      </section>
    </main>
  );
}
