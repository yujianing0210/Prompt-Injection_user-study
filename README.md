# Prompt Injection Perception Study Demo

面向中文用户研究的网页原型。页面顶部提供 **Version 1** 和 **Version 2** 两个研究流程的切换Tab。

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Version 1

原始demo：参与者依次阅读20段模拟材料，判断其中是否存在prompt injection、高亮injection文本范围，并对严重程度、安全感、作者身份、采纳意愿等维度作答。

1. 20条材料全部包含prompt injection，未包含negative control等正式实验所需的对照材料；
2. 页面开头会直接询问“是否存在prompt injection”，并要求用户高亮injection文本范围；
3. 外部AI检测标签为模拟数据；
4. 数据仅保存在本地浏览器（`localStorage` key: `promptInjectionStudySession_v1`）；
5. 使用旧的静态材料（`src/data/stimuli.ts`）和旧的问题流程。

## Version 2

新的研究流程：使用 `prompt_injection_materials_wave1.json`（24条人写/AI写两种风格的材料）替换旧材料。

1. 使用 `src/data/promptInjectionMaterialsWave1.json`（`prompt_injection_materials_wave1.json` 的副本）作为材料来源，通过 `src/data/stimuliV2.ts` 转换为 `V2Stimulus`；
2. 不再询问“是否存在prompt injection”，也不要求用户高亮injection文本范围；
3. 关注：合理性（appropriateness）、安全性（safety）、可信度（trustworthiness）、采纳意愿（willingness to use）以及作者身份判断（human / AI / 不确定）；
4. 每个session开始时，会从24条材料中随机抽取12条（6条human风格 + 6条AI风格）显示外部AI检测标签，抽样结果在session内固定，刷新页面不会重新抽样；
5. 每条材料完成评分（Phase A）后，进入一个不含输入框的口头访谈提示页面（Phase B），并记录该页面的展示与停留时长；
6. 数据仅保存在本地浏览器（`localStorage` key: `promptInjectionStudySession_v2`），与Version 1相互独立；
7. 支持导出JSON / CSV（文件名前缀 `prompt-injection-study-v2_`）；
8. 当前仍为formative prototype，不是正式实验平台。

## 项目结构

```text
src/
├── components/     # 可复用UI组件（进度条、高亮、量表、AI标签等）
├── data/           # Version 1 / Version 2 的刺激材料
├── pages/          # Version 1 / Version 2 各自的 Welcome / Study / Completion 页面
├── types/          # TypeScript数据结构（Version 1 / Version 2）
├── utils/          # 计时、随机化、本地存储、AI标签分配、数据导出
├── AppV1.tsx        # Version 1 的会话逻辑
├── AppV2.tsx        # Version 2 的会话逻辑
└── App.tsx          # 顶部Tab导航，负责在AppV1 / AppV2之间切换
```
