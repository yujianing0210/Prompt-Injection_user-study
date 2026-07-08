import type { ExternalLabel as ExternalLabelType } from "../types/study";

const CATEGORY_TEXT: Record<
  NonNullable<ExternalLabelType["category"]>,
  string
> = {
  very_likely_ai: "极有可能为AI生成",
  likely_ai: "可能为AI生成",
  uncertain: "作者身份不确定",
  likely_human: "可能为人类撰写",
};

type ExternalLabelProps = {
  label: ExternalLabelType;
};

export function ExternalLabelBadge({ label }: ExternalLabelProps) {
  if (!label.visible || label.category === null) {
    return null;
  }

  return (
    <div className="external-label">
      <div className="external-label__title">外部AI检测结果</div>
      <div className="external-label__body">
        <span>{CATEGORY_TEXT[label.category]}</span>
        {label.aiProbability !== null && (
          <span>预估AI生成概率：{label.aiProbability}%</span>
        )}
      </div>
    </div>
  );
}
