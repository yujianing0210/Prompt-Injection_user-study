import { STIMULI_V2 } from "../data/stimuliV2";
import { shuffleArray } from "./randomize";
import type { V2AiAuthorshipTag, V2Stimulus } from "../types/study";

const HIDDEN_TAG: V2AiAuthorshipTag = {
  visible: false,
  label: "uncertain",
  aiProbability: null,
  isConsistentWithAuthorshipStyle: null,
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTagForStimulus(stimulus: V2Stimulus): V2AiAuthorshipTag {
  const isAiWritten = stimulus.authorshipStyle === "ai_written_style";
  const consistentLabel = isAiWritten ? "likely_ai" : "likely_human";
  const consistentRange: [number, number] = isAiWritten ? [75, 95] : [5, 30];
  const inconsistentLabel = isAiWritten ? "likely_human" : "likely_ai";
  const inconsistentRange: [number, number] = isAiWritten ? [10, 35] : [70, 90];

  const roll = Math.random();

  if (roll < 0.7) {
    return {
      visible: true,
      label: consistentLabel,
      aiProbability: randomInt(...consistentRange),
      isConsistentWithAuthorshipStyle: true,
    };
  }

  if (roll < 0.85) {
    return {
      visible: true,
      label: inconsistentLabel,
      aiProbability: randomInt(...inconsistentRange),
      isConsistentWithAuthorshipStyle: false,
    };
  }

  return {
    visible: true,
    label: "uncertain",
    aiProbability: randomInt(45, 55),
    isConsistentWithAuthorshipStyle: false,
  };
}

export function assignAiTags(): {
  taggedStimulusIds: string[];
  aiTagsByStimulusId: Record<string, V2AiAuthorshipTag>;
} {
  const humanItems = STIMULI_V2.filter(
    (item) => item.authorshipStyle === "human_written_style",
  );
  const aiItems = STIMULI_V2.filter(
    (item) => item.authorshipStyle === "ai_written_style",
  );

  const taggedHuman = shuffleArray(humanItems).slice(0, 6);
  const taggedAi = shuffleArray(aiItems).slice(0, 6);
  const taggedStimulusIds = [
    ...taggedHuman.map((item) => item.id),
    ...taggedAi.map((item) => item.id),
  ];
  const taggedIdSet = new Set(taggedStimulusIds);

  const aiTagsByStimulusId: Record<string, V2AiAuthorshipTag> = {};
  for (const stimulus of STIMULI_V2) {
    aiTagsByStimulusId[stimulus.id] = taggedIdSet.has(stimulus.id)
      ? generateTagForStimulus(stimulus)
      : HIDDEN_TAG;
  }

  return { taggedStimulusIds, aiTagsByStimulusId };
}
