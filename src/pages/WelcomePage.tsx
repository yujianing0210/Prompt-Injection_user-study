import { useState, type FormEvent } from "react";
import { hasUnfinishedSession } from "../utils/storage";

type WelcomePageProps = {
  onStart: (participantId: string) => void;
  onResume: () => void;
};

export function WelcomePage({ onStart, onResume }: WelcomePageProps) {
  const [participantId, setParticipantId] = useState("");
  const [error, setError] = useState(false);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const showResumeBanner = !resumeDismissed && hasUnfinishedSession();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = participantId.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    setError(false);
    onStart(trimmed);
  }

  function handleStartOver() {
    const confirmed = window.confirm(
      "确定要放弃未完成的研究进度并重新开始吗？此操作无法撤销。",
    );
    if (confirmed) {
      setResumeDismissed(true);
    }
  }

  return (
    <div className="page welcome-page">
      <div className="card">
        <h1>中文Prompt Injection感知研究</h1>
        <p className="welcome-page__description">
          在本研究中，你将阅读20段文本，并判断其中是否存在可能影响AI行为的额外指令。请根据你的真实判断作答。研究过程中没有唯一的正确答案，请不要使用外部搜索工具。
        </p>
        <p className="welcome-page__estimate">预计用时：15–20 分钟</p>

        {showResumeBanner && (
          <div className="notice-box">
            <p>An unfinished study session was found.</p>
            <div className="notice-box__actions">
              <button type="button" className="primary-button" onClick={onResume}>
                Resume Study
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleStartOver}
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="welcome-page__form">
          <label htmlFor="participantId">Participant ID</label>
          <input
            id="participantId"
            type="text"
            value={participantId}
            onChange={(event) => {
              setParticipantId(event.target.value);
              setError(false);
            }}
            placeholder="例如 P01"
          />
          {error && (
            <p className="field-error">请输入Participant ID后再开始。</p>
          )}
          <button type="submit" className="primary-button">
            Start Study
          </button>
        </form>
      </div>
    </div>
  );
}
