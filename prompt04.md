# Trial Page Two-Column Layout & Prompt Reveal Update

This document specifies the next interaction update for the formal study interface.

The current study interface uses a vertical layout. This creates a problem: when the prompt text is long, participants need to scroll far down to answer the questionnaire and cannot easily refer back to the prompt. We want to redesign the trial page into a two-column layout and add a prompt reveal button for better timing and usability.

Please implement the following changes.

---

## 1. Two-Column Trial Layout

Update the trial page to use a left-right split layout.

### Left column: material reading panel

The left column should display the study material:

- Progress, e.g. `7 / 24`
- `scenario_title`
- `scenario_context`
- AI detection label card, only if assigned to show
- Attachment links, if any
- Prompt reveal button
- Full `prompt_text`, only after the participant clicks the reveal button

### Right column: questionnaire panel

The right column should display:

- All rating questions
- Perceived authorship question
- Authorship confidence question
- AI tag trust question, only when AI tag is visible
- Oral explanation instruction
- Next / Submit button

The right column should not contain the full prompt text.

---

## 2. Independent Scrolling Behavior

The trial page should fit within the browser viewport height.

The left material panel and the right questionnaire panel should each be independently scrollable.

Suggested layout behavior:

```css
.study-trial-layout {
  height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  gap: 24px;
  overflow: hidden;
}

.material-panel {
  height: 100%;
  overflow-y: auto;
}

.question-panel {
  height: 100%;
  overflow-y: auto;
}
```

Please adjust exact sizes according to the existing design system.

The key requirement is:

- When participants scroll through the questions on the right, the material on the left remains visible.
- When the prompt is long, participants can scroll the left panel without affecting the question panel.
- Avoid a single long full-page scroll.

For narrower screens, it is acceptable to stack the panels vertically, but desktop use should prioritize the two-column layout.

---

## 3. Prompt Reveal Interaction

At the start of each new trial, do not immediately show the full prompt text.

Initially show only:

- Progress
- Scenario title
- Scenario context
- AI detection label, if visible for this trial
- Attachment links, if any
- A button labeled: `查看完整 Prompt`

Before the participant clicks this button, the full `prompt_text` should be hidden.

After clicking the button:

- Record the prompt reveal timestamp.
- Replace or supplement the button with a visible prompt text block.
- The prompt text should remain visible for the rest of the trial.
- The participant should be able to scroll within the left panel to review the prompt while answering questions.

Suggested button text:

```text
查看完整 Prompt
```

After reveal, optional status text:

```text
Prompt 已展开
```

---

## 4. Disable Questionnaire Before Prompt Reveal

Participants should not be able to answer the questionnaire before viewing the prompt.

Before the prompt is revealed:

- Disable all question inputs on the right panel.
- Disable the Next button.
- Show a short instruction at the top of the question panel:

```text
请先点击左侧的“查看完整 Prompt”按钮，阅读完整 prompt 后再回答问题。
```

After the participant clicks `查看完整 Prompt`:

- Enable all questionnaire inputs.
- Enable normal response flow.

This ensures that every trial has a valid `promptRevealTime`.

---

## 5. Timing Updates

Please update trial-level timing.

Currently the study records trial start and submit time. Add prompt reveal timing.

For each trial, record:

```ts
trialStartedAt: string;
promptRevealedAt: string | null;
trialSubmittedAt: string | null;

timeBeforePromptRevealMs: number | null;
timeAfterPromptRevealMs: number | null;
totalTrialDurationMs: number | null;
```

Definitions:

```ts
timeBeforePromptRevealMs =
  promptRevealedAt - trialStartedAt

timeAfterPromptRevealMs =
  trialSubmittedAt - promptRevealedAt

totalTrialDurationMs =
  trialSubmittedAt - trialStartedAt
```

Use ISO strings for timestamps and milliseconds for durations.

If prompt reveal is required before answering, `promptRevealedAt` should never be null for completed trials.

---

## 6. Attachment Click Logging Should Remain

Keep the existing attachment link behavior:

- Attachments open in a new browser tab.
- Do not embed PDFs.
- Record attachment click events.

Attachment links should appear in the left material panel before the prompt reveal button.

If a material has attachments, show them like this:

```text
附件：
- 软件工程实习_个人简历.pdf（点击在新标签页打开）
```

---

## 7. AI Detection Label Location

The AI detection label should appear in the left material panel, above the prompt reveal button.

It should still follow the existing Group A / Group B counterbalancing logic.

If the AI label is not assigned to the current trial:

- Do not show any AI label placeholder.
- Do not show AI tag trust question on the right.

If the AI label is assigned:

- Show the AI label card on the left.
- Show the AI tag trust question on the right.

---

## 8. Response Schema Update

Please update the `TrialResponse` type to include prompt reveal timing:

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
  promptRevealedAt: string | null;
  trialSubmittedAt: string | null;

  timeBeforePromptRevealMs: number | null;
  timeAfterPromptRevealMs: number | null;
  totalTrialDurationMs: number | null;
};
```

---

## 9. CSV Export Update

Update the CSV export to include the new timing fields:

```text
trialStartedAt
promptRevealedAt
trialSubmittedAt
timeBeforePromptRevealMs
timeAfterPromptRevealMs
totalTrialDurationMs
```

Please keep all previously specified metadata and response fields.

---

## 10. LocalStorage Update

The study should continue saving session progress to localStorage after every trial.

For in-progress trials, it is okay to store:

```ts
currentTrialStartedAt
currentPromptRevealedAt
currentPromptIsRevealed
```

If the participant refreshes during a trial:

- Preserve the current trial.
- Preserve whether the prompt was already revealed.
- Do not regenerate the randomized order.
- Do not reset the participant group.

---

## 11. UI Expectations

Please keep the design clean and readable.

Suggested visual hierarchy:

### Left panel

1. Progress and title
2. Scenario context card
3. AI detection card, if visible
4. Attachment card, if any
5. Prompt reveal button
6. Prompt text block

### Right panel

1. Short instruction or question group title
2. Rating questions
3. Authorship questions
4. AI tag trust question, if applicable
5. Oral explanation prompt
6. Next button

The prompt text should be displayed in a readable block that preserves line breaks. It can use a light gray background and monospace or semi-monospace styling if that matches the current design.

---

## 12. Do Not Change Unrelated Logic

Please do not change the following unless necessary:

- Material loading from `materials_index.json`
- Group A / Group B counterbalancing logic
- AI tag assignment logic
- Constrained randomization
- Attachment click recording
- JSON/CSV export structure except for the new timing fields
- Question text externalization

Prioritize correctness and pilot stability over visual redesign.

---

## 13. Testing Checklist

After implementation, test the following:

1. Start a new study as Group A.
2. Enter the first trial.
3. Confirm only scenario context, AI label if applicable, attachments, and the `查看完整 Prompt` button are visible on the left.
4. Confirm the questionnaire is disabled before clicking `查看完整 Prompt`.
5. Click `查看完整 Prompt`.
6. Confirm the full prompt appears in the left panel.
7. Confirm questionnaire inputs become enabled.
8. Complete the trial.
9. Confirm exported JSON includes:
   - `trialStartedAt`
   - `promptRevealedAt`
   - `trialSubmittedAt`
   - `timeBeforePromptRevealMs`
   - `timeAfterPromptRevealMs`
   - `totalTrialDurationMs`
10. Confirm exported CSV includes the same timing fields.
11. Test a material with attachment links and confirm clicks are recorded.
12. Refresh during a trial and confirm the trial order, participant group, and prompt reveal state are preserved.

---

## Claude Code Instruction

Please implement this update on top of the existing formal study interface. This task should only change the trial page interaction, layout, prompt reveal behavior, and timing fields. Do not rewrite the entire app unless necessary.

After finishing, summarize:

- What files were changed
- What new state fields were added
- How prompt reveal timing is recorded
- How to test the two-column layout and timing export locally
