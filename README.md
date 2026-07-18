# 大语言模型 Prompt 审阅研究

这是一个面向中文参与者的本地用户研究网页。参与者作为第三方审阅者，依次阅读 24 条材料，并评价 prompt 的适当性、使用意愿、安全性、可靠性与作者身份；部分材料会按实验组显示外部 AI 检测标签。

## 运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

终端会显示本地访问地址。生产构建与本地预览：

```bash
npm run build
npm run preview
```

## 实验流程

1. 输入 Participant ID，并选择 Group A 或 Group B。
2. 系统为 24 条材料生成满足约束的随机顺序；未完成的会话保存在浏览器 `localStorage` 中，可以刷新后继续。
3. 每题先查看完整 Prompt，再完成量表与作者身份判断，最后进行口头说明。
4. 最后一题提交后进入完成页，JSON 与 CSV 会自动保存到项目的 `results` 文件夹，无需手动下载。

## 结果文件

每次完成实验会生成以下两个文件：

```text
results/<Participant ID>/
├── llm-prompt-review_<Participant ID>_<Session ID>.json
└── llm-prompt-review_<Participant ID>_<Session ID>.csv
```

自动保存依赖本项目的 Vite 本地服务器，因此请通过 `npm run dev` 或 `npm run preview` 运行网页，不要直接打开构建后的 HTML 文件。若保存失败，完成页会显示错误信息。对同一会话重复进入完成页会覆盖该会话的同名文件，不会生成重复结果。

JSON 保留完整会话、随机材料顺序、逐题回答、计时和附件点击记录；CSV 每行对应一道题，便于后续统计分析。

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # TypeScript 检查并构建
npm run preview  # 本地预览构建结果
npm test         # 运行正式实验逻辑测试
npm run lint     # 运行代码检查
```

## 项目结构

```text
src/
├── components/  # 量表、进度条、标签等可复用组件
├── config/      # 页面文案
├── pages/       # 设置、实验、完成与分析页面
├── types/       # TypeScript 数据结构
├── utils/       # 材料加载、随机化、存储、计时与结果序列化
└── App.tsx      # 正式实验会话与页面流程
public/materials/ # 24 条实验材料及附件
results/          # 完成实验后自动生成的本地结果
tests/            # 正式实验逻辑测试
vite.config.ts    # Vite 配置与本地结果保存 API
```
