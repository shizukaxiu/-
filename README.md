# 医保经办助手 —— 项目开发路线图

## 一、项目定位

面向参保群众的医保智能经办服务 Agent。通过大模型 + RAG + OCR + 语音交互，实现医保政策问答、办事导航、发票识别报销、异地就医备案等高频服务的智能化办理。

> 一句话卖点：让老百姓像聊微信一样办医保。

---

## 二、核心功能模块

| 模块 | 功能 | Demo 效果 |
|---|---|---|
| 数字人对话 | 医保政策智能问答，支持多轮对话 | 聊天界面 + 数字人头像 |
| 语音输入 | 语音问政策，自动转文字 | 麦克风动画 + 语音识别 |
| OCR 识票 | 上传发票/病历，自动提取信息 | 上传图片 → 高亮关键字段 |
| 异地就医备案 | 模拟办理备案，生成凭证 | 表单自动填充 + 成功弹窗 |
| 个人账户看板 | 展示余额、消费趋势、报销记录 | 数据卡片 + 趋势图 |
| 定点机构推荐 | 推荐附近医院/药店 | 列表 + 地图标记 |

---

## 三、开发任务清单

### Phase 1：项目骨架搭建
- [x] 1.1 初始化 React 项目（Vite + React + TypeScript）
- [x] 1.2 配置 TailwindCSS + 基础样式主题（医保蓝绿色系）
- [x] 1.3 设计整体布局：左侧对话区 + 右侧工具面板
- [x] 1.4 配置 ESLint + Prettier 代码规范
- [x] 1.5 引入状态管理（Zustand）

### Phase 2：对话核心能力
- [x] 2.1 实现消息列表组件（用户/助手气泡）
- [x] 2.2 实现输入框 + 发送按钮 + 打字机效果
- [x] 2.3 接入 LLM API（DeepSeek）
- [x] 2.4 构建 RAG 知识库：mock 医保政策 QA 数据
- [x] 2.5 实现 RAG 检索逻辑（关键词匹配）
- [x] 2.6 系统 Prompt 设计：让模型以医保客服口吻回答
- [x] 2.7 实现对话历史保存（localStorage）

### Phase 3：多模态交互增强
- [x] 3.1 实现 Web Speech API 语音输入
- [x] 3.2 添加数字人头像 + 语音播放时嘴型动画
- [x] 3.3 实现文件上传组件（图片发票）
- [x] 3.4 集成 OCR：Tesseract.js
- [x] 3.5 发票信息解析 + 高亮展示（金额、医院、项目）
- [x] 3.6 模拟报销金额计算 + 动画展示

### Phase 4：业务场景 Demo
- [x] 4.1 异地就医备案对话流程
- [x] 4.2 备案表单自动回填
- [x] 4.3 备案成功页面 + 二维码凭证（mock）
- [x] 4.4 个人账户看板页面
- [x] 4.5 消费趋势 Recharts 面积图
- [x] 4.6 附近定点医院/药店推荐页面

### Phase 5：Mock 数据与 polish
- [x] 5.1 编写 `mock/policies.json`（20+ 医保高频问题）
- [x] 5.2 编写 `mock/user.json`（个人医保档案）
- [x] 5.3 编写 `mock/hospitals.json`（定点医院列表）
- [x] 5.4 编写 `mock/invoices.json`（测试用发票识别结果）
- [x] 5.5 添加加载动画、空状态、错误提示
- [ ] 5.6 移动端响应式适配（基础适配已完成）
- [ ] 5.7 录制 Demo 演示视频 / 准备答辩 PPT

---

## 四、推荐技术栈

| 用途 | 选型 |
|---|---|
| 前端框架 | React 19 + Vite + TypeScript |
| UI 样式 | TailwindCSS v4 |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 图表 | Recharts |
| 状态管理 | Zustand |
| 大模型 | DeepSeek API |
| OCR | Tesseract.js |
| 语音 | Web Speech API |
| 地图 | Mock 地图示意 |

---

## 五、目录结构

```
医保经办助手/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env
├── .env.example
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── DigitalHuman.tsx
│   │   ├── InvoiceUploader.tsx
│   │   ├── PolicyCard.tsx
│   │   └── AccountDashboard.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ChatPage.tsx
│   │   └── NearbyPage.tsx
│   ├── hooks/
│   │   ├── useSpeech.ts
│   │   ├── useLLM.ts
│   │   └── useOCR.ts
│   ├── store/
│   │   └── chatStore.ts
│   ├── mock/
│   │   ├── policies.json
│   │   ├── user.json
│   │   ├── hospitals.json
│   │   └── invoices.json
│   ├── services/
│   │   ├── llm.ts
│   │   ├── rag.ts
│   │   └── ocr.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
```

---

## 六、Mock 数据核心字段

### 1. 医保政策 QA（policies.json）
```json
[
  {
    "id": "p001",
    "question": "异地就医怎么备案？",
    "keywords": ["异地", "备案", "外地", "看病"],
    "answer": "您可以通过国家医保服务平台APP、国家异地就医备案微信小程序或参保地医保经办机构办理。备案成功后，可在就医地直接结算。"
  }
]
```

### 2. 用户档案（user.json）
```json
{
  "name": "张三",
  "idCard": "110101********1234",
  "insuredCity": "北京市",
  "insuranceType": "城镇职工医保",
  "balance": 2840.50,
  "thisYearSpent": 3420.00,
  "reimbursementRecords": [
    {"date": "2026-05-20", "hospital": "北京协和医院", "amount": 580.00, "reimbursed": 420.00}
  ]
}
```

### 3. 发票识别结果（invoices.json）
```json
{
  "invoiceNo": "0012345678",
  "hospital": "北京朝阳医院",
  "date": "2026-06-10",
  "items": [
    {"name": "血常规检查", "amount": 120.00, "category": "检查费"},
    {"name": "头孢克肟胶囊", "amount": 85.50, "category": "药品费"}
  ],
  "total": 205.50,
  "estimatedReimbursement": 143.85
}
```

---

## 七、5 分钟 Demo 演示脚本

1. **开场**：打开页面，数字人主动问候："您好，我是您的医保小助手，请问有什么可以帮您？"
2. **语音提问**：按住麦克风说"我想去上海看病，怎么备案？"
3. **政策回答**：Agent 给出备案流程卡片，并提示"是否立即办理？"
4. **模拟办理**：点击"立即办理"，系统自动填充个人信息，用户确认后显示"备案成功"+二维码
5. **发票报销**：切换到"发票报销"，上传 mock 发票图片
6. **OCR 识别**：展示识别出的医院、项目、金额，自动计算可报销金额
7. **账户看板**：展示个人账户余额、年度消费趋势、最近报销记录

---

## 八、本地运行说明

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

默认打开：http://localhost:5200/

### 构建南京医保知识库（可选）

项目已集成基于南京医保政策文档的向量检索 RAG。要启用：

1. 把南京医保政策 PDF/Word/TXT 文件放入 `raw-policies/` 目录
2. 运行构建脚本：

```bash
npm run build-kb
```

3. 启动开发服务器后，聊天中的政策回答将优先基于这些文档

> 默认使用本地 TF-IDF 向量模型，无需联网和 API Key。如需更强的语义向量效果，可配置 OpenAI/智谱等 Embedding API。

### 接入 DeepSeek API（可选）
1. 访问 https://platform.deepseek.com/ 获取 API Key。
2. 将 `.env` 文件中的 `VITE_DEEPSEEK_API_KEY` 填入你的 Key。
3. 重新启动开发服务器。

> 若不配置 API Key，系统会自动切换为 **RAG 离线兜底模式**，保证 Demo 稳定可控。

### 打包构建
```bash
npm run build
```

---

## 九、风险提示

- LLM API 可能存在延迟，Demo 时建议提前准备 **固定回复兜底**
- OCR 识别效果依赖图片质量，准备 **2-3 张清晰测试图**
- 所有涉及个人信息的内容必须打码处理，并注明"数据均为模拟"
