import type { ParticipantGroup, StudyMaterial } from "../types/study.ts";
import { shouldShowAiTag } from "./materials.ts";

export function getPairId(id: string): string {
  return id.replace(/-(H|AI)$/i, "");
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function orderViolations(
  order: StudyMaterial[],
  group: ParticipantGroup,
  requireFourApart = true,
): string[] {
  const violations: string[] = [];
  for (let i = 0; i < order.length; i += 1) {
    for (let j = i + 1; j < order.length; j += 1) {
      if (getPairId(order[i].id) === getPairId(order[j].id)) {
        const distance = j - i;
        if (distance === 1 || (requireFourApart && distance < 4)) {
          violations.push(`pair:${order[i].id}:${order[j].id}:${distance}`);
        }
      }
    }
    if (i >= 2) {
      const three = order.slice(i - 2, i + 1);
      if (three.every((item) => item.metadata.task_type === three[0].metadata.task_type)) {
        violations.push(`task-run:${i}`);
      }
      if (three.every((item) => shouldShowAiTag(item, group) === shouldShowAiTag(three[0], group))) {
        violations.push(`tag-run:${i}`);
      }
    }
  }
  const half = Math.floor(order.length / 2);
  if (!order.slice(0, half).some((item) => item.metadata.condition === "control") ||
      !order.slice(half).some((item) => item.metadata.condition === "control")) {
    violations.push("control-spread");
  }
  const firstThree = order.slice(0, 3);
  if (firstThree.length === 3 && firstThree.every((item) => item.metadata.condition === firstThree[0].metadata.condition)) {
    violations.push("first-three-condition");
  }
  return violations;
}

export function generateValidOrder(
  materials: StudyMaterial[],
  group: ParticipantGroup,
  random: () => number = Math.random,
): StudyMaterial[] {
  let best = shuffle(materials, random);
  let bestViolations = orderViolations(best, group);
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const remaining = shuffle(materials, random);
    const candidate: StudyMaterial[] = [];
    while (remaining.length > 0) {
      const choices = shuffle(remaining, random).filter((item) => {
        const index = candidate.length;
        const pairIndex = candidate.findIndex((placed) => getPairId(placed.id) === getPairId(item.id));
        if (pairIndex >= 0 && index - pairIndex < 4) return false;
        if (index >= 2) {
          const previousTwo = candidate.slice(-2);
          if (previousTwo.every((placed) => placed.metadata.task_type === item.metadata.task_type)) return false;
          const tagged = shouldShowAiTag(item, group);
          if (previousTwo.every((placed) => shouldShowAiTag(placed, group) === tagged)) return false;
          if (index === 2 && previousTwo.every((placed) => placed.metadata.condition === item.metadata.condition)) return false;
        }
        if (index === Math.floor(materials.length / 2) - 1 &&
            item.metadata.condition !== "control" &&
            !candidate.some((placed) => placed.metadata.condition === "control")) return false;
        return true;
      });
      if (choices.length === 0) break;
      const chosen = choices[0];
      candidate.push(chosen);
      remaining.splice(remaining.indexOf(chosen), 1);
    }
    if (candidate.length !== materials.length) continue;
    const violations = orderViolations(candidate, group);
    if (violations.length === 0) return candidate;
    if (violations.length < bestViolations.length) {
      best = candidate;
      bestViolations = violations;
    }
  }
  console.warn("Could not find a fully constrained order; using best candidate.", bestViolations);
  return best;
}
