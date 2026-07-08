import { useEffect, useRef, useState } from "react";
import type { HighlightRange } from "../types/study";

type PendingSelection = {
  start: number;
  end: number;
};

type TextHighlighterProps = {
  text: string;
  highlightMode: boolean;
  highlights: HighlightRange[];
  onHighlightsChange: (highlights: HighlightRange[]) => void;
  onFirstInteraction?: () => void;
};

function resolveOffset(node: Node, offsetInNode: number): number {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    const base = parent?.dataset.offset;
    return base !== undefined ? Number(base) + (offsetInNode > 0 ? 1 : 0) : 0;
  }

  const element = node as HTMLElement;
  const children = element.childNodes;

  if (children.length === 0) {
    const base = (element as HTMLElement).dataset?.offset;
    return base !== undefined ? Number(base) + (offsetInNode > 0 ? 1 : 0) : 0;
  }

  if (offsetInNode <= 0) {
    const first = children[0] as HTMLElement;
    const base = first.dataset?.offset;
    return base !== undefined ? Number(base) : 0;
  }

  if (offsetInNode >= children.length) {
    const last = children[children.length - 1] as HTMLElement;
    const base = last.dataset?.offset;
    return base !== undefined ? Number(base) + 1 : 0;
  }

  const child = children[offsetInNode] as HTMLElement;
  const base = child.dataset?.offset;
  return base !== undefined ? Number(base) : 0;
}

function mergeRanges(ranges: PendingSelection[]): PendingSelection[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: PendingSelection[] = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

function findOffsetElement(target: EventTarget | null): number | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  const withOffset = target.closest<HTMLElement>("[data-offset]");
  if (!withOffset) {
    return null;
  }
  return Number(withOffset.dataset.offset);
}

export function TextHighlighter({
  text,
  highlightMode,
  highlights,
  onHighlightsChange,
  onFirstInteraction,
}: TextHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseDownOffsetRef = useRef<number | null>(null);
  const [pendingSelection, setPendingSelection] =
    useState<PendingSelection | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!highlightMode) {
      setPendingSelection(null);
      setToolbarPosition(null);
    }
  }, [highlightMode]);

  function isHighlighted(index: number): boolean {
    return highlights.some(
      (h) => index >= h.startOffset && index < h.endOffset,
    );
  }

  function handleMouseUp(event: React.MouseEvent<HTMLDivElement>) {
    if (!highlightMode) {
      return;
    }

    const mouseUpOffset = findOffsetElement(event.target);
    const mouseDownOffset = mouseDownOffsetRef.current;
    mouseDownOffsetRef.current = null;

    if (
      mouseDownOffset !== null &&
      mouseUpOffset !== null &&
      mouseDownOffset === mouseUpOffset
    ) {
      const existingIndex = highlights.findIndex(
        (h) => mouseUpOffset >= h.startOffset && mouseUpOffset < h.endOffset,
      );
      if (existingIndex !== -1) {
        window.getSelection()?.removeAllRanges();
        onHighlightsChange(highlights.filter((_, i) => i !== existingIndex));
        setPendingSelection(null);
        setToolbarPosition(null);
        return;
      }
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setPendingSelection(null);
      setToolbarPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    const a = resolveOffset(range.startContainer, range.startOffset);
    const b = resolveOffset(range.endContainer, range.endOffset);
    const start = Math.max(0, Math.min(a, b));
    const end = Math.min(text.length, Math.max(a, b));

    if (end <= start) {
      setPendingSelection(null);
      setToolbarPosition(null);
      return;
    }

    onFirstInteraction?.();

    const rect = range.getBoundingClientRect();
    setToolbarPosition({ top: rect.top, left: rect.left + rect.width / 2 });
    setPendingSelection({ start, end });
  }

  function handleAddHighlight() {
    if (!pendingSelection) {
      return;
    }

    const merged = mergeRanges([
      ...highlights.map((h) => ({ start: h.startOffset, end: h.endOffset })),
      pendingSelection,
    ]);

    onHighlightsChange(
      merged.map((r) => ({
        startOffset: r.start,
        endOffset: r.end,
        selectedText: text.slice(r.start, r.end),
      })),
    );

    window.getSelection()?.removeAllRanges();
    setPendingSelection(null);
    setToolbarPosition(null);
  }

  function handleClearAll() {
    window.getSelection()?.removeAllRanges();
    onHighlightsChange([]);
    setPendingSelection(null);
    setToolbarPosition(null);
  }

  return (
    <div className="text-highlighter">
      <div
        className={
          highlightMode
            ? "stimulus-text stimulus-text--selectable"
            : "stimulus-text"
        }
        ref={containerRef}
        onMouseDown={(event) => {
          mouseDownOffsetRef.current = findOffsetElement(event.target);
        }}
        onMouseUp={handleMouseUp}
      >
        {text.split("").map((character, index) => (
          <span
            key={index}
            data-offset={index}
            className={
              isHighlighted(index)
                ? "stimulus-text__char stimulus-text__char--highlighted"
                : "stimulus-text__char"
            }
          >
            {character}
          </span>
        ))}
      </div>

      {highlightMode && pendingSelection && toolbarPosition && (
        <div
          className="highlight-toolbar"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
          }}
        >
          <button type="button" onClick={handleAddHighlight}>
            Add Highlight
          </button>
        </div>
      )}

      {highlightMode && (
        <div className="text-highlighter__controls">
          <button
            type="button"
            className="link-button"
            onClick={handleClearAll}
            disabled={highlights.length === 0}
          >
            Clear All Highlights
          </button>
          <span className="text-highlighter__hint">
            {highlights.length > 0
              ? `已高亮 ${highlights.length} 处`
              : "请在文本中拖动鼠标以高亮内容"}
          </span>
        </div>
      )}
    </div>
  );
}
