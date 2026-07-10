import type { V2Stimulus } from "../types/study";
import raw from "./promptInjectionMaterialsWave1.json";

type RawMaterial = {
  id: string;
  category: string;
  scenario: string;
  authorship_style: "human_written_style" | "ai_written_style";
  injection_source: "direct" | "indirect";
  injection_strategy: string;
  language_style: string;
  attack_objective: string;
  target_task: string;
  text: string;
  ground_truth_injection: string;
  ground_truth_span: {
    startOffset: number;
    endOffset: number;
    selectedText: string;
  };
  expected_injected_output: string;
  contains_injection: boolean;
  language: string;
};

const materials = raw.materials as RawMaterial[];

export const STIMULI_V2: V2Stimulus[] = materials.map((item) => ({
  id: item.id,
  category: item.category,
  scenario: item.scenario,
  authorshipStyle: item.authorship_style,
  injectionSource: item.injection_source,
  injectionStrategy: item.injection_strategy,
  languageStyle: item.language_style,
  attackObjective: item.attack_objective,
  targetTask: item.target_task,
  text: item.text,
  groundTruthInjection: item.ground_truth_injection,
  groundTruthSpan: item.ground_truth_span,
  expectedInjectedOutput: item.expected_injected_output,
  containsInjection: item.contains_injection,
  language: item.language,
}));
