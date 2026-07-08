type CompletionScreenProps = {
  participantId: string;
  totalDurationMs: number;
  onDownloadJson: () => void;
  onDownloadCsv: () => void;
  onRestart: () => void;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} 分 ${seconds.toString().padStart(2, "0")} 秒`;
}

export function CompletionScreen({
  participantId,
  totalDurationMs,
  onDownloadJson,
  onDownloadCsv,
  onRestart,
}: CompletionScreenProps) {
  return (
    <div className="card completion-screen">
      <h1>研究已完成，感谢你的参与！</h1>
      <dl className="completion-screen__summary">
        <div>
          <dt>Participant ID</dt>
          <dd>{participantId}</dd>
        </div>
        <div>
          <dt>总耗时</dt>
          <dd>{formatDuration(totalDurationMs)}</dd>
        </div>
      </dl>
      <div className="completion-screen__actions">
        <button type="button" className="primary-button" onClick={onDownloadJson}>
          Download JSON
        </button>
        <button type="button" className="primary-button" onClick={onDownloadCsv}>
          Download CSV
        </button>
        <button type="button" className="secondary-button" onClick={onRestart}>
          Restart Demo
        </button>
      </div>
    </div>
  );
}
