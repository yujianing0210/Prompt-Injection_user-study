import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formalSessionToCsv } from "../src/utils/exportData.ts";
import {
  generateValidOrder,
  getPairId,
  orderViolations,
} from "../src/utils/constrainedRandomize.ts";
import {
  normalizeAttachments,
  shouldShowAiTag,
  stripComments,
  validateMaterials,
} from "../src/utils/materials.ts";
import type {
  FormalStudySession,
  FormalTrialResponse,
  ParticipantGroup,
  StudyMaterial,
} from "../src/types/study.ts";

function loadFixtureMaterials(): StudyMaterial[] {
  const index = JSON.parse(readFileSync("public/materials/materials_index.json", "utf8")) as { materials: string[] };
  return index.materials.map((path) =>
    stripComments(JSON.parse(readFileSync(`public${path}`, "utf8"))) as StudyMaterial,
  );
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const materials = loadFixtureMaterials();

test("formal material files validate and internal annotations are stripped", () => {
  assert.deepEqual(validateMaterials(materials), []);
  assert.equal(materials.length, 24);
  assert.equal(JSON.stringify(materials).includes("not_used"), false);
  assert.equal(getPairId("C1-AI"), "C1");
});

test("both groups receive 12 balanced AI tags", () => {
  for (const group of ["A", "B"] as ParticipantGroup[]) {
    const tagged = materials.filter((material) => shouldShowAiTag(material, group));
    assert.equal(tagged.length, 12);
    assert.equal(tagged.filter((material) => material.metadata.authorship_style === "human_style").length, 6);
    assert.equal(tagged.filter((material) => material.metadata.authorship_style === "ai_style").length, 6);
  }
});

test("attachment records normalize to public links", () => {
  const material = materials.find((item) => item.id === "E1-H");
  assert.ok(material);
  assert.deepEqual(normalizeAttachments(material), [{
    filename: "软件工程实习_个人简历.pdf",
    path: "/materials/assets/软件工程实习_个人简历.pdf",
  }]);
});

test("seeded orders satisfy every constraint for both groups", () => {
  for (const group of ["A", "B"] as ParticipantGroup[]) {
    for (let seed = 1; seed <= 25; seed += 1) {
      const order = generateValidOrder(materials, group, seededRandom(seed));
      assert.equal(new Set(order.map((material) => material.id)).size, 24);
      assert.deepEqual(orderViolations(order, group), []);
    }
  }
});

test("formal CSV contains one escaped row per trial", () => {
  const material = materials[0];
  const base: FormalTrialResponse = {
    participantId: "TEST_A",
    group: "A",
    sessionId: "session",
    trialIndex: 0,
    stimulusId: material.id,
    scenarioTitle: '标题, 包含"引号"',
    taskType: material.metadata.task_type,
    scenario: material.metadata.scenario,
    specificContext: material.metadata.specific_context,
    actualAuthorship: material.metadata.authorship_style,
    condition: material.metadata.condition,
    primaryRisk: material.metadata.primary_risk,
    secondaryRisk: material.metadata.secondary_risk,
    riskTypeCN: material.metadata.risk_type_cn,
    hasAiTag: false,
    aiTagLabel: null,
    aiProbability: null,
    appropriateness: 4,
    willingnessToUse: 4,
    perceivedSafety: 4,
    perceivedReliability: 4,
    perceivedAuthorship: "uncertain",
    authorshipConfidence: 4,
    aiTagTrust: null,
    attachmentClicks: [],
    trialStartedAt: "2026-01-01T00:00:00.000Z",
    promptRevealedAt: "2026-01-01T00:00:00.250Z",
    trialSubmittedAt: "2026-01-01T00:00:01.000Z",
    timeBeforePromptRevealMs: 250,
    timeAfterPromptRevealMs: 750,
    totalTrialDurationMs: 1000,
    researcherMaterial: material,
  };
  const responses = Array.from({ length: 24 }, (_, trialIndex) => ({
    ...base,
    trialIndex,
    stimulusId: materials[trialIndex].id,
    researcherMaterial: materials[trialIndex],
  }));
  const session: FormalStudySession = {
    participantId: "TEST_A",
    group: "A",
    sessionId: "session",
    startedAt: base.trialStartedAt,
    completedAt: base.trialSubmittedAt,
    materialOrder: materials.map((materialItem) => materialItem.id),
    currentTrialIndex: 24,
    currentTrialStartedAt: base.trialStartedAt,
    currentPromptRevealedAt: base.promptRevealedAt,
    currentPromptIsRevealed: true,
    responses,
    attachmentClickEvents: [],
  };
  const csv = formalSessionToCsv(session);
  assert.equal(csv.split("\n").length, 25);
  assert.match(csv, /"标题, 包含""引号"""/);
  assert.match(csv.split("\n")[0], /promptRevealedAt/);
  assert.match(csv.split("\n")[0], /timeBeforePromptRevealMs/);
  assert.match(csv.split("\n")[0], /timeAfterPromptRevealMs/);
});
