type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="progress-bar">
      <div className="progress-bar__label">
        <span>
          Prompt {Math.min(current + 1, total)} of {total}
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
