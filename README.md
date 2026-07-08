# Prompt Injection Perception Study Demo

面向中文用户研究的基础网页原型：参与者依次阅读20段模拟材料，判断其中是否存在prompt injection，并对严重程度、安全感、作者身份、采纳意愿等维度作答。

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

## Notes

1. 20条材料全部包含prompt injection，未包含negative control等正式实验所需的对照材料；
2. 外部AI检测标签为模拟数据；
3. 数据仅保存在本地浏览器（localStorage），刷新或清除浏览器数据会丢失未导出的记录；
4. 未连接正式数据库或后端服务；
5. 当前版本仅用于验证交互流程，不可直接用于正式数据采集。

## 项目结构

```text
src/
├── components/   # 可复用UI组件（进度条、高亮、量表等）
├── data/         # 20条demo刺激材料
├── pages/        # Welcome / Study / Completion 三个页面
├── types/        # TypeScript数据结构
└── utils/        # 计时、随机化、本地存储、数据导出
```
