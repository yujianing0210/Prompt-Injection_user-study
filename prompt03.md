# Formal Study Interface for LLM-Facing Prompt Review

This README specifies the implementation requirements for updating the current prompt review study website from a demo version into a formal pilot-ready user study interface.

The updated interface should load 24 prompt materials from individual JSON files, support Group A / Group B counterbalancing, render AI detection labels conditionally, present the study from a third-party reviewer perspective, support PDF attachment links, record participant responses and timing, and export both JSON and CSV data.

---

## Current Material Structure

The project now uses the following material structure:

```text
materials/assets/
  产品分析师候选人_简历.pdf
  软件工程实习_个人简历.pdf

materials/individual/
  C1-AI.json
  C1-H.json
  C2-AI.json
  C2-H.json
  E1-AI.json
  E1-H.json
  E2-AI.json
  E2-H.json
  G1-AI.json
  G1-H.json
  G2-AI.json
  G2-H.json
  L1-AI.json
  L1-H.json
  L2-AI.json
  L2-H.json
  P1-AI.json
  P1-H.json
  P2-AI.json
  P2-H.json
  S1-AI.json
  S1-H.json
  S2-AI.json
  S2-H.json

materials/materials_index.json
```

The website should no longer use the old hard-coded demo materials. It should load materials from `materials_index.json`, then fetch each individual JSON file listed there.

Expected behavior:

```text
Load materials_index.json
→ Fetch all individual/*.json files
→ Strip internal comment fields
→ Validate the loaded materials
→ Store materials in an array for the study flow
```

---

# Step 1 — Data Loading, Types, and Externalized Question Text

## 1. Replace old hard-coded stimuli with new material files

The website should dynamically load the 24 material JSON files through `materials_index.json`.

The index may contain entries like:

```json
[
  {
    "id": "G1-H",
    "path": "./materials/individual/G1-H.json"
  },
  {
    "id": "G1-AI",
    "path": "./materials/individual/G1-AI.json"
  }
]
```

The implementation should support this index-based loading structure and should not rely on a manually hard-coded array of 24 materials.

---

## 2. Ignore JSON comment fields

Some material JSON files include annotation fields beginning with `not_used`, such as:

```json
"not_used_scenario_context": "..."
```

These fields should be ignored in the participant-facing interface and excluded from normal rendering.

Please implement a recursive utility:

```ts
function stripComments(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripComments);

  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, value]) => [key, stripComments(value)]),
    );
  }

  return obj;
}
```

Use this after loading each JSON material.

---

## 3. Expected material schema

Each material should follow this general structure:

```ts
type StudyMaterial = {
  id: string;
  display: {
    scenario_title: string;
    scenario_context: string;
    attached_files:
      | Array<{
          filename?: string;
          path?: string;
          label?: string;
        }>
      | string[];
    ai_detection_label: {
      enabled_by_group: {
        group_A: boolean;
        group_B: boolean;
      };
      target: string;
      label_text: string;
      ai_probability: number;
      note: string;
    };
    prompt_text: string;
  };
  metadata: {
    task_type: string;
    scenario: string;
    specific_context: string;
    authorship_style: "human_style" | "ai_style";
    condition: "risk" | "control";
    primary_risk: string;
    secondary_risk?: string;
    risk_type_cn: string;
    has_attachment: boolean;
    material_version: string;
    ai_tag_group_A: "Yes" | "No";
    ai_tag_group_B: "Yes" | "No";
  };
  ground_truth: {
    contains_risk: boolean;
    ground_truth_span: null | {
      selected_text: string;
    };
    risk_explanation: string;
    expected_user_challenge: string;
  };
};
```

The `ground_truth` field should never be shown to participants. It should only be included in exported data for later analysis.

---

## 4. Externalize all questionnaire text

Create a separate file for all participant-facing question text, for example:

```text
src/config/questionText.ts
```

This file should export all question labels, scale labels, option labels, and oral explanation instructions.

Example:

```ts
export const QUESTION_TEXT = {
  thirdPartyInstruction:
    "在本研究中，你不需要把自己代入 prompt 的使用者。请你作为第三方审阅者，判断这段 prompt 是否适合交给大语言模型执行，以及它可能会引导模型生成什么样的结果。",

  thirdPartyInstructionExtra:
    "请根据你对这段 prompt 本身的判断作答，而不是根据你是否处在该角色中作答。",

  appropriateness: {
    label: "你觉得这段 prompt 是否适合交给大语言模型完成当前任务？",
    minLabel: "非常不适合",
    maxLabel: "非常适合",
  },

  willingnessToUse: {
    label:
      "如果你在真实场景中看到这段 prompt，你愿意让大语言模型按照它执行吗？",
    minLabel: "非常不愿意",
    maxLabel: "非常愿意",
  },

  perceivedSafety: {
    label:
      "如果将这段 prompt 交给大语言模型执行，你认为它可能产生的结果有多安全？",
    minLabel: "非常不安全",
    maxLabel: "非常安全",
  },

  perceivedReliability: {
    label:
      "如果大语言模型按照这段 prompt 执行，你觉得它产生可靠结果的可能性有多高？",
    minLabel: "非常低",
    maxLabel: "非常高",
  },

  perceivedAuthorship: {
    label: "你认为这段 prompt 更可能由谁撰写？",
    options: [
      { value: "human", label: "人类" },
      { value: "ai", label: "AI" },
      { value: "uncertain", label: "不确定" },
    ],
  },

  authorshipConfidence: {
    label: "你对上述作者身份判断有多大信心？",
    minLabel: "完全没信心",
    maxLabel: "非常有信心",
  },

  aiTagTrust: {
    label: "你在多大程度上相信页面上外部 AI 检测标签的判断？",
    minLabel: "完全不相信",
    maxLabel: "非常相信",
  },

  oralExplanation: {
    label: "请口头说明你刚刚作出判断的原因。",
    button: "我已完成口头说明，进入下一题",
  },
};
```

All study questions should use this config file instead of hard-coded strings, so that the wording can be revised later.

---

# Step 2 — Study Flow, Group Selection, AI Tag Counterbalancing, Randomization, and Attachments

## 1. Add participant setup page

At the beginning of the study, show a setup page with:

```text
Participant ID input
Group selection dropdown: Group A / Group B
Start Study button
Continue previous session button, if localStorage session exists
Clear previous session button
```

Use manual group assignment for now. The experimenter will choose Group A or Group B on the start page. Do not auto-assign groups.

Group dropdown values:

```ts
type ParticipantGroup = "A" | "B";
```

---

## 2. Third-party reviewer framing

On the start page, display the following instruction clearly:

```text
在本研究中，你不需要把自己代入 prompt 的使用者。请你作为第三方审阅者，判断这段 prompt 是否适合交给大语言模型执行，以及它可能会引导模型生成什么样的结果。

请根据你对这段 prompt 本身的判断作答，而不是根据你是否处在该角色中作答。
```

Each trial’s `scenario_context` already uses third-party framing. Display it as written.

---

## 3. AI tag display logic

Each material includes AI tag information in:

```ts
material.display.ai_detection_label.enabled_by_group.group_A;
material.display.ai_detection_label.enabled_by_group.group_B;
```

Or equivalently:

```ts
material.metadata.ai_tag_group_A;
material.metadata.ai_tag_group_B;
```

Use `display.ai_detection_label.enabled_by_group` as the primary source of truth.

Logic:

```ts
const shouldShowAITag =
  participantGroup === "A"
    ? material.display.ai_detection_label.enabled_by_group.group_A
    : material.display.ai_detection_label.enabled_by_group.group_B;
```

If `shouldShowAITag === true`, show an AI detection label card above the prompt text:

```text
外部 AI 检测标签
该 prompt 可能由 AI 辅助生成。
AI probability: 88%
该标签由外部检测工具生成，仅供参考。
```

Use the actual values from:

```ts
label_text;
ai_probability;
note;
```

If `shouldShowAITag === false`, do not display any AI tag card and do not show an empty placeholder.

---

## 4. AI tag trust question

Only show the AI tag trust question when `shouldShowAITag === true`.

If no AI tag is shown, do not render this question and record:

```ts
aiTagTrust: null;
```

---

## 5. Constrained randomization

Do not simply shuffle the 24 materials randomly. Implement constrained randomization.

Requirements:

1. Do not place the human and AI versions of the same pair next to each other. Example: `G1-H` and `G1-AI` should not be adjacent. Ideally, they should be at least 4 trials apart.

2. Avoid more than 2 consecutive materials with the same task type. Example: avoid three `Learn` trials in a row.

3. Avoid more than 2 consecutive materials with the same AI tag condition for the current group. Example: avoid three tagged trials in a row or three untagged trials in a row.

4. Spread control items across the study. Control items should not all appear in the first half or all in the second half.

5. Avoid having the first 3 trials all be control items or all be high-risk items.

Implementation can use repeated shuffle with validation:

```ts
function generateValidOrder(
  materials: StudyMaterial[],
  group: ParticipantGroup,
) {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const shuffled = shuffle(materials);
    if (isValidOrder(shuffled, group)) return shuffled;
  }
  console.warn(
    "Could not find fully valid randomized order; using fallback shuffle.",
  );
  return shuffle(materials);
}
```

Pair ID can be derived from material ID:

```ts
function getPairId(id: string) {
  return id.replace(/-(H|AI)$/i, "");
}
```

---

## 6. Trial page layout

Each trial should display:

```text
Progress: 7 / 24
scenario_title
scenario_context
AI detection label, only if assigned to show
attached files, if any
prompt_text
questionnaire
oral explanation prompt
Next button
```

Do not show the following participant-facing fields:

```text
actual authorship
risk type
condition risk/control
ground truth
risk explanation
group assignment logic
```

These should only be included in exported data.

---

## 7. Attached file links

Some materials have attachments, especially E1-H and E1-AI.

Do not embed PDFs in the page. Instead, show clickable links.

Example display:

```text
附件：
- 软件工程实习_个人简历.pdf（点击在新标签页打开）
```

Clicking the attachment should open the PDF in a new browser tab:

```html
<a
  href="/assets/软件工程实习_个人简历.pdf"
  target="_blank"
  rel="noopener noreferrer"
>
  软件工程实习_个人简历.pdf
</a>
```

When the participant clicks an attachment link, record an event:

```ts
{
  materialId: "E1-H",
  filename: "软件工程实习_个人简历.pdf",
  clickedAt: ISOString,
  trialIndex: number
}
```

Do not attempt to record how long they spend in the PDF tab for now.

---

# Step 3 — Response Recording, Export, Validation, and Formal Study Cleanup

## 1. Response fields

For each trial, record:

```ts
type TrialResponse = {
  participantId: string;
  group: "A" | "B";
  sessionId: string;

  trialIndex: number;
  stimulusId: string;

  scenarioTitle: string;
  taskType: string;
  scenario: string;
  specificContext: string;
  actualAuthorship: "human_style" | "ai_style";
  condition: "risk" | "control";
  primaryRisk: string;
  secondaryRisk?: string;
  riskTypeCN: string;

  hasAiTag: boolean;
  aiTagLabel: string | null;
  aiProbability: number | null;

  appropriateness: number | null;
  willingnessToUse: number | null;
  perceivedSafety: number | null;
  perceivedReliability: number | null;
  perceivedAuthorship: "human" | "ai" | "uncertain" | null;
  authorshipConfidence: number | null;
  aiTagTrust: number | null;

  attachmentClicks: Array<{
    filename: string;
    clickedAt: string;
  }>;

  trialStartedAt: string;
  trialSubmittedAt: string | null;
  totalTrialDurationMs: number | null;
};
```

---

## 2. Session-level data

Record:

```ts
type StudySession = {
  participantId: string;
  group: "A" | "B";
  sessionId: string;

  startedAt: string;
  completedAt: string | null;

  materialOrder: string[];
  responses: TrialResponse[];

  attachmentClickEvents: Array<{
    materialId: string;
    trialIndex: number;
    filename: string;
    clickedAt: string;
  }>;
};
```

Save this to localStorage after every trial.

Suggested localStorage key:

```ts
const STORAGE_KEY = "llmPromptReviewStudy_v1";
```

---

## 3. Timing

Record:

```text
trialStartedAt
trialSubmittedAt
totalTrialDurationMs
```

It is enough to calculate trial duration as:

```ts
new Date(trialSubmittedAt).getTime() - new Date(trialStartedAt).getTime();
```

No need for eye-tracking or fine-grained scroll logging in this version.

---

## 4. Data export

At the end of the study, provide:

```text
Download JSON
Download CSV
```

JSON should include the full `StudySession`.

CSV should include one row per trial with:

```text
participantId
group
sessionId
trialIndex
stimulusId
scenarioTitle
taskType
scenario
specificContext
actualAuthorship
condition
primaryRisk
secondaryRisk
riskTypeCN
hasAiTag
aiTagLabel
aiProbability
appropriateness
willingnessToUse
perceivedSafety
perceivedReliability
perceivedAuthorship
authorshipConfidence
aiTagTrust
attachmentClicked
attachmentClickCount
trialStartedAt
trialSubmittedAt
totalTrialDurationMs
```

---

## 5. Material validation

Before starting the study, validate materials and show errors in development mode or on the setup page if validation fails.

Validation rules:

```text
There must be exactly 24 materials.
Each material ID must be unique.
Each material must have display.scenario_title.
Each material must have display.scenario_context.
Each material must have display.prompt_text.
Each material must have display.ai_detection_label.
Each material must have metadata.task_type.
Each material must have metadata.scenario.
Each material must have metadata.authorship_style.
Each material must have metadata.condition.
Each material must have metadata.primary_risk.
Each material must have metadata.ai_tag_group_A and metadata.ai_tag_group_B.
Each material must have ground_truth.contains_risk.
Group A must have exactly 12 AI-tagged materials.
Group B must have exactly 12 AI-tagged materials.
Group A tagged materials should include 6 human-style and 6 AI-style materials.
Group B tagged materials should include 6 human-style and 6 AI-style materials.
```

If validation fails, display a clear message:

```text
Material validation failed:
- Group A has 13 AI-tagged materials instead of 12.
- Missing prompt_text in L2-H.
```

---

## 6. Formal study cleanup

For the formal study interface:

- Remove participant-facing Version 1 / Version 2 tabs.
- Do not show old demo materials.
- Do not show risk labels or ground truth to participants.
- Do not show author ground truth to participants.
- Do not show internal `_comment` fields.
- Keep the interface simple and stable for pilot testing.

If the current project still needs dev mode, use a route such as:

```text
/dev
```

But the formal study should run at:

```text
/study
```

or simply the default page.

---

# Additional Important Note: C1 / C2 Naming

Make sure the current naming is consistent:

```text
C1-H / C1-AI = 邮件回复
C2-H / C2-AI = 客服退款
```

If any older table, index file, or UI label still says:

```text
C1 = 客服退款
C2 = 邮件回复
```

update it to match the current file structure.

---

# Final Implementation Priority

Please implement in this order:

1. Material loading + question text config + validation.
2. Start page with participant ID and manual Group A/B selection.
3. Trial rendering with conditional AI tag and attachment links.
4. Constrained randomization.
5. Questionnaire response recording.
6. JSON/CSV export.
7. UI cleanup for pilot-ready formal study.

After implementation, please test with:

```text
Participant ID: TEST_A
Group: A
```

and:

```text
Participant ID: TEST_B
Group: B
```

Confirm that:

```text
Each group sees exactly 12 AI-tagged trials.
AI tag trust question appears only when a tag is visible.
Attachment links open in a new tab.
Attachment clicks are recorded.
The exported CSV contains 24 rows.
The exported JSON contains all responses and metadata.
Ground truth is not shown in the participant UI.
```
