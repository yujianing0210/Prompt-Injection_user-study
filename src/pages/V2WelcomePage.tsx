import { useState, type FormEvent } from "react";
import { hasUnfinishedSessionV2 } from "../utils/storage";

type V2WelcomePageProps = {
  onStart: (participantId: string) => void;
  onPreview: (participantId: string) => void;
  onResume: () => void;
};

export function V2WelcomePage({ onStart, onPreview, onResume }: V2WelcomePageProps) {
  const [participantId, setParticipantId] = useState("");
  const [error, setError] = useState(false);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const showResumeBanner = !resumeDismissed && hasUnfinishedSessionV2();

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

  function handlePreview() {
    onPreview(participantId.trim() || "PREVIEW");
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
        <h1>Version 2: Text Evaluation Study</h1>
        <p className="welcome-page__description">
          在本研究中，你将阅读一系列面向AI应用的文本或prompt，并评价它们是否合理、安全、可信，以及你是否愿意使用或采纳它们。
        </p>
        <p className="welcome-page__description">
          请根据你的第一反应作答。部分页面可能会显示外部AI检测标签，该标签仅供参考。
        </p>
        <p className="welcome-page__description">
          每条文本之后，你将看到一个简短的口头解释提示，请根据主持人的要求，说明你做出判断的原因。
        </p>
        <p className="welcome-page__estimate">预计用时：30 分钟</p>

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
          <label htmlFor="participantIdV2">Participant ID</label>
          <input
            id="participantIdV2"
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
            Start Version 2 Study
          </button>
          <button
            type="button"
            className="link-button welcome-page__preview-button"
            onClick={handlePreview}
          >
            Preview
          </button>
        </form>
      </div>
    </div>
  );
}
