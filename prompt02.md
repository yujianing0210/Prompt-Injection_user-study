# Prompt Injection User Study Website Iteration Spec

## Version 0.2 / Version 2 Requirements for Claude Code

## 1. 迭代目标

请在现有 user study 网站代码基础上进行迭代，不要覆盖或删除当前已有版本。当前网站应被保留为 **Version 1**。本次新增一个新的实验流程，命名为 **Version 2** 或 **v0.2**。

网站顶部需要增加一个 tab navigation，让研究者可以在两个版本之间切换：

- **Version 1**：保留当前已有网站、交互流程和材料；
- **Version 2**：使用新的JSON材料与新的用户研究流程。

本次迭代的重点不是重写整个项目，而是在已有代码架构上增加一个新的实验版本。

---

# 2. 顶部Tab结构

## 2.1 页面顶部新增版本切换Tab

在网站最上方增加一个清晰的tab bar：

```text
[ Version 1 ] [ Version 2 ]
```

点击 **Version 1**：

- 展示当前已有实验流程；
- 保持当前代码逻辑和UI不变；
- 不要删除旧材料；
- 不要修改旧版数据结构，除非为了兼容tab routing所必须。

点击 **Version 2**：

- 展示新的实验流程；
- 使用新加入的JSON文件；
- 使用新的问题顺序；
- 使用新的布局方式；
- 使用新的AI authorship tag逻辑。

## 2.2 技术实现建议

可以用以下任一方式实现：

### Option A: React state-based tabs

```tsx
const [activeVersion, setActiveVersion] = useState<"v1" | "v2">("v1");
```

### Option B: React Router routes

```text
/study/v1
/study/v2
```

如果当前项目没有router，优先使用state-based tabs，减少改动。

---

# 3. Version 2材料加载

## 3.1 使用新的JSON文件

Version 2需要从新加入的JSON文件中读取材料：

```text
prompt_injection_materials_wave1.json
```

该JSON文件包含：

- metadata；
- materials；
- 每条材料的text；
- scenario；
- authorship_style；
- injection_source；
- injection_strategy；
- language_style；
- attack_objective；
- target_task；
- ground_truth_injection；
- ground_truth_span；
- contains_injection；
- language。

请在Version 2中使用该JSON文件中的 **24条材料** 替换旧版材料。

## 3.2 数据结构兼容

如果当前网站已有Stimulus类型，请新增或扩展Version 2的类型，不要破坏Version 1。

建议新增：

```ts
export type V2Stimulus = {
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
```

注意：Version 2参与者界面不要显示ground truth字段。

---

# 4. Version 2整体实验流程

Version 2不再一开始询问：

```text
你认为这里是否存在prompt injection？
```

也不再要求用户在一开始高亮prompt injection文本范围。

Version 2的核心逻辑是：

1. 展示一条prompt/text；
2. 用户先自然评价这段文本是否合适、安全、可信、可采纳；
3. 用户判断文本更可能由人类还是AI生成；
4. 用户评价自己的判断信心；
5. 如果该条材料带有AI authorship tag，则显示AI tag相关问题；
6. 点击Next后，进入一个open-ended interview prompt页面；
7. 该页面提示研究者让参与者口头解释理由；
8. 再点击Continue进入下一条材料。

---

# 5. Version 2单条材料流程

每条材料分成两个页面/阶段：

## Phase A: Rating Questions

页面显示：

- 顶部进度条；
- 中间固定文本区域；
- 下方可滚动的问题区域；
- Next按钮。

问题如下。

---

## Q1. Appropriateness

问题：

```text
你觉得这段prompt / 文本是否合适？
```

Likert 1–7：

```text
1 = 非常不合适
7 = 非常合适
```

字段：

```ts
appropriatenessRating: number;
```

---

## Q2. Willingness to Use

问题：

```text
如果你在真实场景中看到这段prompt / 文本，你愿意使用、执行或采纳它吗？
```

Likert 1–7：

```text
1 = 完全不愿意
7 = 非常愿意
```

字段：

```ts
willingnessToUse: number;
```

---

## Q3. Perceived Safety

问题：

```text
你认为这段prompt / 文本整体上有多安全？
```

Likert 1–7：

```text
1 = 非常不安全
7 = 非常安全
```

字段：

```ts
perceivedSafety: number;
```

---

## Q4. Perceived Trustworthiness

问题：

```text
你觉得这段prompt / 文本有多可信？
```

Likert 1–7：

```text
1 = 完全不可信
7 = 非常可信
```

字段：

```ts
perceivedTrustworthiness: number;
```

---

## Q5. Perceived Authorship

问题：

```text
你认为这段prompt / 文本更可能由谁写成？
```

选项：

```text
人类
AI
不确定
```

字段：

```ts
perceivedAuthorship: "human" | "ai" | "uncertain";
```

---

## Q6. Authorship Confidence

问题：

```text
你对上述作者身份判断有多大信心？
```

Likert 1–7：

```text
1 = 完全没有信心
7 = 非常有信心
```

字段：

```ts
authorshipConfidence: number;
```

---

## Q7. AI Tag Trust

只有当当前材料显示AI authorship tag时，才显示这个问题。

问题：

```text
你在多大程度上相信上方外部AI检测标签的判断？
```

Likert 1–7：

```text
1 = 完全不相信
7 = 完全相信
```

字段：

```ts
aiTagTrust: number | null;
```

如果当前材料没有AI tag：

```ts
aiTagTrust = null;
```

---

# 6. Phase B: Open-ended Interview Prompt

用户完成Phase A并点击Next后，不要立刻进入下一条材料。先进入一个单独的open-ended prompt页面。

这个页面不需要文本输入框。它只是用于提醒主持人进行口头追问，或提醒参与者口头解释。

页面内容：

```text
请口头说明你刚刚作出判断的原因。

你可以重点谈谈：
- 这段文本中有哪些地方让你觉得合适或不合适？
- 哪些地方影响了你是否愿意使用它？
- 哪些地方影响了你对安全性和可信度的判断？
- 你为什么认为它更像人写的、AI写的，或不确定？
- 如果页面上显示了AI检测标签，它是否影响了你的判断？为什么？
```

按钮：

```text
Continue to Next Text
```

点击后进入下一条材料。

## 6.1 数据记录

虽然这个页面没有输入框，但需要记录：

```ts
openEndedPromptDisplayedAt: string;
openEndedPromptContinuedAt: string;
openEndedPromptDurationMs: number;
```

这样后续如果Zoom录音或主持人记录，可以知道每条材料对应的口头解释时间段。

---

# 7. Version 2页面布局要求

当前Version 1页面滚动时，进度条、文本和问题区会一起滚动。Version 2需要改成固定上方区域，仅问题区滚动。

## 7.1 结构

Version 2页面应分为三个区域：

```text
┌─────────────────────────────┐
│ 固定区域1：进度条 / trial信息 │
├─────────────────────────────┤
│ 固定区域2：当前prompt文本      │
├─────────────────────────────┤
│ 可滚动区域3：问题和按钮        │
└─────────────────────────────┘
```

## 7.2 固定区域

进度条和文本区域在当前trial内应保持固定，用户回答问题时始终能看到上方文本。

实现方式可以使用：

```css
.v2-study-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.v2-progress-section {
  flex: 0 0 auto;
}

.v2-text-section {
  flex: 0 0 auto;
  max-height: 40vh;
  overflow-y: auto;
}

.v2-question-section {
  flex: 1 1 auto;
  overflow-y: auto;
}
```

注意：文本区本身如果太长，也可以内部滚动，但它不应该随着问题区一起滚走。

## 7.3 问题区域

问题区域需要独立滚动：

- 包含所有Likert问题；
- 包含作者身份选择；
- 包含AI tag trust问题；
- 包含Next按钮；
- 如果问题较多，用户只滚动问题区域；
- 顶部进度和文本保持可见。

---

# 8. Version 2进度条

Version 2共有24条材料，每条材料包括：

- Phase A rating page；
- Phase B open-ended prompt page。

进度条建议按材料完成数计算，而不是按页面数计算。

例如：

```text
Text 5 of 24
Progress: 16.7%
```

当用户完成Phase A但还在Phase B时，可以显示：

```text
Text 5 of 24 – Reflection
```

只有点击“Continue to Next Text”后，才算完成当前文本，进度进入下一条。

---

# 9. AI Authorship Tag逻辑

## 9.1 总体规则

Version 2共有24条材料。每次实验session开始时，系统需要随机选择12条材料显示AI authorship tag。

这12条材料需要满足：

- 6条来自 human_written_style；
- 6条来自 ai_written_style。

其余12条不显示AI tag。

## 9.2 实现要求

session开始时：

1. 从24条材料中分出human style和AI style；
2. 从human style中随机抽取6条；
3. 从AI style中随机抽取6条；
4. 合并成`taggedStimulusIds`；
5. 保存到session/localStorage；
6. 刷新页面后不要重新抽样。

伪代码：

```ts
const humanItems = materials.filter(
  (item) => item.authorship_style === "human_written_style",
);

const aiItems = materials.filter(
  (item) => item.authorship_style === "ai_written_style",
);

const taggedHuman = shuffle(humanItems).slice(0, 6);
const taggedAI = shuffle(aiItems).slice(0, 6);

const taggedStimulusIds = [
  ...taggedHuman.map((item) => item.id),
  ...taggedAI.map((item) => item.id),
];
```

## 9.3 AI tag内容

对于被选中的12条材料，在文本上方或文本下方显示一个外部检测标签。

示例：

```text
外部AI检测标签：
该文本可能由AI生成。AI生成概率：82%
```

或：

```text
外部AI检测标签：
该文本可能由人类撰写。AI生成概率：28%
```

## 9.4 标签生成逻辑

需要为每条tagged材料生成一个`aiTag`对象：

```ts
type AiAuthorshipTag = {
  visible: boolean;
  label: "likely_ai" | "likely_human" | "uncertain";
  aiProbability: number;
  isConsistentWithAuthorshipStyle: boolean;
};
```

暂时可以用以下规则：

### 对AI-written style材料

70%概率给出consistent标签：

```text
likely_ai, aiProbability between 75 and 95
```

30%概率给出inconsistent或uncertain标签：

```text
likely_human, aiProbability between 10 and 35
```

或：

```text
uncertain, aiProbability between 45 and 55
```

### 对Human-written style材料

70%概率给出consistent标签：

```text
likely_human, aiProbability between 5 and 30
```

30%概率给出inconsistent或uncertain标签：

```text
likely_ai, aiProbability between 70 and 90
```

或：

```text
uncertain, aiProbability between 45 and 55
```

这个逻辑可以之后调整。当前版本只要能生成并保存即可。

## 9.5 UI要求

AI tag应显示在文本区域附近，但不要过于像真实权威结果。

建议样式：

- 灰蓝色信息框；
- 标题为“外部AI检测标签”；
- 小字说明“此标签由外部检测工具生成，仅供参考”；
- 不要使用红色警告图标；
- 不要写“真实结果”或“正确答案”。

示例UI文案：

```text
外部AI检测标签
该文本可能由AI生成。
AI生成概率：82%
该标签由外部检测工具生成，仅供参考。
```

如果标签是likely_human：

```text
外部AI检测标签
该文本可能由人类撰写。
AI生成概率：18%
该标签由外部检测工具生成，仅供参考。
```

如果标签是uncertain：

```text
外部AI检测标签
外部工具无法确定该文本作者。
AI生成概率：52%
该标签由外部检测工具生成，仅供参考。
```

---

# 10. Version 2数据结构

新增Version 2 session和response类型，不要破坏Version 1。

```ts
export type V2AiAuthorshipTag = {
  visible: boolean;
  label: "likely_ai" | "likely_human" | "uncertain";
  aiProbability: number | null;
  isConsistentWithAuthorshipStyle: boolean | null;
};

export type V2TrialResponse = {
  participantId: string;
  sessionId: string;
  version: "v2";

  trialIndex: number;
  stimulusId: string;
  stimulusOrder: number;

  // Stimulus metadata
  category: string;
  scenario: string;
  authorshipStyle: "human_written_style" | "ai_written_style";
  injectionSource: "direct" | "indirect";
  injectionStrategy: string;
  languageStyle: string;
  attackObjective: string;
  targetTask: string;

  // AI tag condition
  aiTag: V2AiAuthorshipTag;
  aiTagTrust: number | null;

  // User ratings
  appropriatenessRating: number;
  willingnessToUse: number;
  perceivedSafety: number;
  perceivedTrustworthiness: number;
  perceivedAuthorship: "human" | "ai" | "uncertain";
  authorshipConfidence: number;

  // Timing
  textDisplayedAt: string;
  firstQuestionAnsweredAt: string | null;
  ratingSubmittedAt: string;
  openEndedPromptDisplayedAt: string;
  openEndedPromptContinuedAt: string;

  ratingDurationMs: number;
  openEndedPromptDurationMs: number;
  totalTrialDurationMs: number;
};
```

Session:

```ts
export type V2StudySession = {
  participantId: string;
  sessionId: string;
  version: "v2";
  studyStartedAt: string;
  studyCompletedAt: string | null;
  randomizedStimulusIds: string[];
  taggedStimulusIds: string[];
  aiTagsByStimulusId: Record<string, V2AiAuthorshipTag>;
  currentTrialIndex: number;
  currentPhase: "rating" | "reflection" | "completed";
  responses: V2TrialResponse[];
};
```

---

# 11. 数据保存和导出

## 11.1 LocalStorage key

Version 1和Version 2必须使用不同的localStorage key，避免互相覆盖。

建议：

```text
promptInjectionStudySession_v1
promptInjectionStudySession_v2
```

## 11.2 JSON导出

Version 2完成后，应支持导出完整JSON。

文件名：

```text
prompt-injection-study-v2_[participantId]_[sessionId].json
```

JSON中应包含：

- session metadata；
- randomizedStimulusIds；
- taggedStimulusIds；
- aiTagsByStimulusId；
- all responses；
- timestamps；
- all ratings；
- stimulus metadata。

## 11.3 CSV导出

CSV每一行是一条trial response。

至少包含：

```text
participantId
sessionId
version
trialIndex
stimulusId
category
scenario
authorshipStyle
injectionSource
injectionStrategy
languageStyle
attackObjective
targetTask
aiTagVisible
aiTagLabel
aiTagAiProbability
aiTagConsistentWithAuthorshipStyle
appropriatenessRating
willingnessToUse
perceivedSafety
perceivedTrustworthiness
perceivedAuthorship
authorshipConfidence
aiTagTrust
textDisplayedAt
ratingSubmittedAt
openEndedPromptDisplayedAt
openEndedPromptContinuedAt
ratingDurationMs
openEndedPromptDurationMs
totalTrialDurationMs
```

---

# 12. Timing记录

Version 2需要记录以下时间：

## Trial开始

当文本和AI tag渲染完成时：

```ts
textDisplayedAt;
textDisplayedAtMs;
```

## 第一个问题被回答

记录：

```ts
firstQuestionAnsweredAt;
firstQuestionAnsweredAtMs;
```

无论第一个被回答的是哪个问题，只记录第一次。

## Phase A提交

点击Next进入open-ended prompt页面时：

```ts
ratingSubmittedAt;
ratingSubmittedAtMs;
ratingDurationMs = ratingSubmittedAtMs - textDisplayedAtMs;
```

## Phase B显示

open-ended prompt页面显示时：

```ts
openEndedPromptDisplayedAt;
openEndedPromptDisplayedAtMs;
```

通常和ratingSubmittedAt接近，但仍单独记录。

## Phase B继续

点击Continue to Next Text时：

```ts
openEndedPromptContinuedAt;
openEndedPromptContinuedAtMs;
openEndedPromptDurationMs =
  openEndedPromptContinuedAtMs - openEndedPromptDisplayedAtMs;
```

## 总trial时间

```ts
totalTrialDurationMs = openEndedPromptContinuedAtMs - textDisplayedAtMs;
```

---

# 13. 表单验证

Phase A所有可见问题必须回答后才能点击Next。

```ts
const canProceedToReflection =
  appropriatenessRating !== null &&
  willingnessToUse !== null &&
  perceivedSafety !== null &&
  perceivedTrustworthiness !== null &&
  perceivedAuthorship !== null &&
  authorshipConfidence !== null &&
  (!aiTag.visible || aiTagTrust !== null);
```

如果未完成：

- Next按钮disabled；
- 显示提示：

```text
请完成当前页面所有问题后继续。
```

---

# 14. Version 2完成页面

完成所有24条材料后，显示：

```text
Version 2 Study Completed
感谢你完成本轮用户研究。
```

显示：

- Participant ID；
- total duration；
- number of completed trials；
- Download JSON；
- Download CSV；
- Restart Version 2。

Restart只清空Version 2 localStorage，不影响Version 1。

---

# 15. 需要从Version 1移除/改变的内容

仅在Version 2中进行以下改变：

## 移除

- 一开始的“是否存在prompt injection？”问题；
- Yes/No判断；
- prompt injection高亮交互；
- injection severity问题；
- 与高亮相关的必答逻辑。

## 保留或改造

- 进度条；
- 文本展示；
- Likert量表组件；
- 作者身份判断；
- AI tag trust；
- localStorage；
- JSON/CSV导出。

---

# 16. UI文案建议

## Version 2 Welcome Page

```text
Version 2: Text Evaluation Study

在本研究中，你将阅读一系列面向AI应用的文本或prompt，并评价它们是否合适、安全、可信，以及你是否愿意使用或采纳它们。

请根据你的第一反应作答。部分页面可能会显示外部AI检测标签，该标签仅供参考。

每条文本之后，你将看到一个简短的口头解释提示。请根据主持人的要求，说明你刚刚作出判断的原因。
```

Start button:

```text
Start Version 2 Study
```

## Phase A Next button

```text
Next: Explain Your Reasoning
```

## Phase B Continue button

```text
Continue to Next Text
```

---

# 17. 验收标准

完成后请确保：

- [ ] 页面顶部有Version 1 / Version 2 tab；
- [ ] Version 1功能保持不变；
- [ ] Version 2使用`prompt_injection_materials_wave1.json`中的24条材料；
- [ ] Version 2不再显示prompt injection yes/no问题；
- [ ] Version 2不再显示高亮交互；
- [ ] Version 2显示appropriateness、willingness、safety、trustworthiness、authorship、confidence问题；
- [ ] Version 2随机选择12条材料显示AI tag；
- [ ] AI tag中包含6条human style和6条AI style材料；
- [ ] AI tag分配在session开始后固定，刷新不变；
- [ ] 有AI tag时显示aiTagTrust问题；
- [ ] 无AI tag时不显示aiTagTrust问题；
- [ ] 进度条和文本区域固定；
- [ ] 问题区域可以独立滚动；
- [ ] Phase A完成后进入open-ended prompt页面；
- [ ] open-ended prompt页面没有输入框；
- [ ] open-ended prompt页面记录显示和继续时间；
- [ ] 完成24条后进入Version 2完成页；
- [ ] Version 2可以导出JSON；
- [ ] Version 2可以导出CSV；
- [ ] Version 1和Version 2 localStorage互不覆盖；
- [ ] TypeScript无报错；
- [ ] 浏览器控制台无明显runtime error；
- [ ] README更新，说明Version 1和Version 2的区别。

---

# 18. README更新要求

请在README中新增：

## Version 1

说明：

- 原始demo；
- 包含prompt injection判断和高亮；
- 使用旧材料和旧流程。

## Version 2

说明：

- 使用`prompt_injection_materials_wave1.json`；
- 取消直接prompt injection判断；
- 关注合适性、安全性、可信度、采纳意愿和作者身份判断；
- 12/24条材料显示外部AI检测标签；
- 记录rating时间和口头解释时间；
- 当前仍为formative prototype，不是正式实验平台。

---

# 19. 实现优先级

请按以下顺序实现：

1. 增加Version 1 / Version 2 tab；
2. 保证Version 1仍可正常运行；
3. 读取Version 2 JSON材料；
4. 实现Version 2 session初始化；
5. 实现24条材料随机顺序；
6. 实现12条AI tag随机分配；
7. 实现Version 2 rating页面；
8. 实现固定进度条和文本区域、问题区独立滚动；
9. 实现Phase B open-ended prompt页面；
10. 实现Version 2数据保存；
11. 实现Version 2导出；
12. 测试刷新恢复；
13. 更新README。

请优先保证数据记录、随机化、AI tag分配和页面流程正确。
