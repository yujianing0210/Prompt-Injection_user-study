type V2ProgressBarProps = {
  completedCount: number;
  total: number;
  phase: "rating" | "reflection";
};

export function V2ProgressBar({ completedCount, total, phase }: V2ProgressBarProps) {
  const percent = Math.round((completedCount / total) * 100);
  const displayIndex = Math.min(completedCount + 1, total);

  return (
    <div className="progress-bar v2-progress-bar">
      <div className="progress-bar__label">
        <span>
          Text {displayIndex} of {total}
          {phase === "reflection" ? " — Reflection" : ""}
        </span>
        <span>{percent}% completed</span>
      </div>
      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
