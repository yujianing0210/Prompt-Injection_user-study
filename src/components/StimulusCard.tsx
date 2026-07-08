import type { HighlightRange, Stimulus } from "../types/study";
import { ExternalLabelBadge } from "./ExternalLabel";
import { TextHighlighter } from "./TextHighlighter";

type StimulusCardProps = {
  stimulusIndex: number;
  stimulus: Stimulus;
  highlightMode: boolean;
  highlights: HighlightRange[];
  onHighlightsChange: (highlights: HighlightRange[]) => void;
  onFirstInteraction?: () => void;
};

export function StimulusCard({
  stimulusIndex,
  stimulus,
  highlightMode,
  highlights,
  onHighlightsChange,
  onFirstInteraction,
}: StimulusCardProps) {
  return (
    <div className="card stimulus-card">
      <div className="stimulus-card__header">
        <h2>Text {stimulusIndex}</h2>
        <p className="stimulus-card__instruction">
          {highlightMode
            ? "请在下方文本中高亮你认为属于prompt injection的内容。"
            : "请仔细阅读以下文本。"}
        </p>
      </div>
      <ExternalLabelBadge label={stimulus.externalLabel} />
      <TextHighlighter
        text={stimulus.text}
        highlightMode={highlightMode}
        highlights={highlights}
        onHighlightsChange={onHighlightsChange}
        onFirstInteraction={onFirstInteraction}
      />
    </div>
  );
}
