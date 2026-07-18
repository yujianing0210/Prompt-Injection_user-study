import { QUESTION_TEXT } from "../config/questionText";
import type { FormalStudySession, FormalTrialResponse } from "../types/study";

type Props = { session: FormalStudySession; onBack: () => void };

function rating(value: number | null): string {
  return value === null ? "—" : String(value);
}

function perceivedAuthor(value: "human" | "ai" | "uncertain" | null): string {
  if (value === "human") return "人类";
  if (value === "ai") return "AI";
  if (value === "uncertain") return "不确定";
  return "—";
}

function isAuthorshipCorrect(response: FormalTrialResponse): boolean {
  return (response.actualAuthorship === "human_style" && response.perceivedAuthorship === "human") ||
    (response.actualAuthorship === "ai_style" && response.perceivedAuthorship === "ai");
}

function accuracyStats(responses: FormalTrialResponse[]) {
  const correct = responses.filter(isAuthorshipCorrect).length;
  const total = responses.length;
  return { correct, total, percentage: total === 0 ? 0 : Math.round((correct / total) * 100) };
}

export function FormalAnalysisPage({ session, onBack }: Props) {
  const overallStats = accuracyStats(session.responses);
  const taggedStats = accuracyStats(session.responses.filter((response) => response.hasAiTag));
  const untaggedStats = accuracyStats(session.responses.filter((response) => !response.hasAiTag));

  return (
    <main className="analysis-page">
      <header className="analysis-page__header">
        <div>
          <h1>{QUESTION_TEXT.analysisTitle}</h1>
          <p>Participant ID: {session.participantId} · Group {session.group} · {session.responses.length} 条记录</p>
        </div>
        <button type="button" className="secondary-button" onClick={onBack}>{QUESTION_TEXT.backToCompletion}</button>
      </header>

      <section className="analysis-summary" aria-labelledby="authorship-accuracy-title">
        <h2 id="authorship-accuracy-title">作者身份判断正确率</h2>
        <div className="accuracy-metrics">
          <div className="accuracy-metric">
            <div
              className="accuracy-ring"
              role="img"
              aria-label={`整体正确率 ${overallStats.percentage}%`}
              style={{ background: `conic-gradient(var(--accent) ${overallStats.percentage}%, var(--border) 0)` }}
            >
              <div className="accuracy-ring__center">
                <strong>{overallStats.percentage}%</strong>
                <span>正确率</span>
              </div>
            </div>
            <div className="analysis-summary__copy">
              <h3>整体</h3>
              <p>正确判断 {overallStats.correct} / {overallStats.total} 条</p>
            </div>
          </div>
          <div className="accuracy-metric">
            <div
              className="accuracy-ring"
              role="img"
              aria-label={`有检测标签条件正确率 ${taggedStats.percentage}%`}
              style={{ background: `conic-gradient(var(--accent) ${taggedStats.percentage}%, var(--border) 0)` }}
            >
              <div className="accuracy-ring__center">
                <strong>{taggedStats.percentage}%</strong>
                <span>正确率</span>
              </div>
            </div>
            <div className="analysis-summary__copy">
              <h3>有检测标签</h3>
              <p>正确判断 {taggedStats.correct} / {taggedStats.total} 条</p>
            </div>
          </div>
          <div className="accuracy-metric">
            <div
              className="accuracy-ring"
              role="img"
              aria-label={`无检测标签条件正确率 ${untaggedStats.percentage}%`}
              style={{ background: `conic-gradient(var(--accent) ${untaggedStats.percentage}%, var(--border) 0)` }}
            >
              <div className="accuracy-ring__center">
                <strong>{untaggedStats.percentage}%</strong>
                <span>正确率</span>
              </div>
            </div>
            <div className="analysis-summary__copy">
              <h3>无检测标签</h3>
              <p>正确判断 {untaggedStats.correct} / {untaggedStats.total} 条</p>
            </div>
          </div>
        </div>
        <small className="analysis-summary__note">“人类”或“AI”与真实作者风格一致时计为正确；“不确定”计为错误。</small>
      </section>

      <div className="analysis-table-wrap">
        <table className="analysis-table">
          <thead><tr>
            <th>序号</th><th>Prompt</th><th>场景</th><th>真实作者</th><th>AI 标签</th>
            <th>适合程度</th><th>使用意愿</th><th>安全性</th><th>可靠性</th>
            <th>作者判断</th><th>判断信心</th><th>标签信任</th>
          </tr></thead>
          <tbody>
            {session.responses.map((response) => (
              <tr key={`${response.trialIndex}-${response.stimulusId}`}>
                <td>{response.trialIndex + 1}</td>
                <td><strong>{response.stimulusId}</strong></td>
                <td>{response.scenarioTitle}</td>
                <td>{response.actualAuthorship === "human_style" ? "人类风格" : "AI 风格"}</td>
                <td>{response.hasAiTag ? "有" : "无"}</td>
                <td>{rating(response.appropriateness)}</td>
                <td>{rating(response.willingnessToUse)}</td>
                <td>{rating(response.perceivedSafety)}</td>
                <td>{rating(response.perceivedReliability)}</td>
                <td>{perceivedAuthor(response.perceivedAuthorship)}</td>
                <td>{rating(response.authorshipConfidence)}</td>
                <td>{rating(response.aiTagTrust)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
