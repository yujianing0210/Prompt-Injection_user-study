import type { V2AiAuthorshipTag } from "../types/study";

const LABEL_TEXT: Record<V2AiAuthorshipTag["label"], string> = {
  likely_ai: "该文本可能由AI生成。",
  likely_human: "该文本可能由人类撰写。",
  uncertain: "外部工具无法确定该文本作者。",
};

type AiTagBadgeProps = {
  tag: V2AiAuthorshipTag;
};

export function AiTagBadge({ tag }: AiTagBadgeProps) {
  if (!tag.visible) {
    return null;
  }

  return (
    <div className="ai-tag-badge">
      <div className="ai-tag-badge__title">外部AI检测标签</div>
      <div className="ai-tag-badge__body">
        <span>{LABEL_TEXT[tag.label]}</span>
        {tag.aiProbability !== null && (
          <span>AI生成概率：{tag.aiProbability}%</span>
        )}
        <span className="ai-tag-badge__disclaimer">
          该标签由外部检测工具生成，仅供参考。
        </span>
      </div>
    </div>
  );
}
