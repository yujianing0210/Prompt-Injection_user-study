import { useState, type FormEvent } from "react";
import { QUESTION_TEXT } from "../config/questionText";
import type { FormalStudySession, ParticipantGroup } from "../types/study";

type Props = {
  loading: boolean;
  loadError: string | null;
  validationErrors: string[];
  resumableSession: FormalStudySession | null;
  onStart: (participantId: string, group: ParticipantGroup) => void;
  onResume: () => void;
  onClear: () => void;
};

export function FormalSetupPage({
  loading,
  loadError,
  validationErrors,
  resumableSession,
  onStart,
  onResume,
  onClear,
}: Props) {
  const [participantId, setParticipantId] = useState("");
  const [group, setGroup] = useState<ParticipantGroup | "">("");
  const [formError, setFormError] = useState("");
  const blocked = loading || loadError !== null || validationErrors.length > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    const id = participantId.trim();
    if (!id || !group) {
      setFormError("请输入 Participant ID 并选择实验组别。");
      return;
    }
    setFormError("");
    onStart(id, group);
  }

  function clear() {
    if (window.confirm("确定要清除上次研究记录吗？此操作无法撤销。")) onClear();
  }

  return (
    <main className="page welcome-page formal-setup">
      <section className="card">
        <h1>{QUESTION_TEXT.title}</h1>
        <div className="instruction-box">
          <p>{QUESTION_TEXT.thirdPartyInstruction}</p>
          <p>{QUESTION_TEXT.thirdPartyInstructionExtra}</p>
        </div>
        <p className="welcome-page__estimate">{QUESTION_TEXT.estimate}</p>

        {loading && <div className="notice-box" role="status">正在加载研究材料……</div>}
        {(loadError || validationErrors.length > 0) && (
          <div className="validation-errors" role="alert">
            <strong>Material validation failed:</strong>
            <ul>
              {loadError && <li>{loadError}</li>}
              {validationErrors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </div>
        )}

        {resumableSession && (
          <div className="notice-box">
            <p>
              找到 {resumableSession.participantId}（Group {resumableSession.group}）的未完成记录，
              已完成 {resumableSession.responses.length} / {resumableSession.materialOrder.length} 条。
            </p>
            <div className="notice-box__actions">
              <button type="button" className="primary-button" onClick={onResume} disabled={blocked}>
                {QUESTION_TEXT.resume}
              </button>
              <button type="button" className="secondary-button" onClick={clear}>
                {QUESTION_TEXT.clear}
              </button>
            </div>
          </div>
        )}

        <form className="welcome-page__form" onSubmit={submit}>
          <label htmlFor="participant-id">{QUESTION_TEXT.participantId}</label>
          <input id="participant-id" value={participantId} onChange={(event) => setParticipantId(event.target.value)} placeholder="例如 TEST_A" />
          <label htmlFor="participant-group">{QUESTION_TEXT.group}</label>
          <select id="participant-group" value={group} onChange={(event) => setGroup(event.target.value as ParticipantGroup | "")}>
            <option value="">{QUESTION_TEXT.groupPlaceholder}</option>
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
          {formError && <p className="field-error" role="alert">{formError}</p>}
          <button className="primary-button" type="submit" disabled={blocked}>{QUESTION_TEXT.start}</button>
        </form>
      </section>
    </main>
  );
}
