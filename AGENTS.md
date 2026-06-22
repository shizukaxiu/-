# AGENTS.md — 医保经办助手

> 本文面向后续开发/维护的 AI Agent 与开发者，记录项目背景、关键决策与当前任务状态。普通用户说明请见 [`README.md`](README.md)。
>
> 设计上下文补充：[`PRODUCT.md`](PRODUCT.md)（产品定位、品牌调性、设计原则）、[`DESIGN.md`](DESIGN.md)（颜色、字体、组件、响应式策略）、[`.impeccable/audit-report.md`](.impeccable/audit-report.md)（impeccable 审计与 polish 报告）。

---

## Agent 速览

| 项目 | 说明 |
|---|---|
| 名称 | 医保经办助手（`medical-insurance-assistant`） |
| 定位 | 面向参保群众的医保智能服务前端原型 |
| 核心目标 | 让老百姓像聊微信一样办医保 |
| 当前主题 | 南京医保知识库（`raw-policies/` 收录江苏省/南京市政策原文） |
| 技术栈 | React 19 + Vite 8 + TypeScript 6 + TailwindCSS v4 |

**当前重点能力**

- 登录与角色分流（普通用户 / 系统管理员）
- 医保政策智能问答（本地 TF-IDF RAG，离线可用）
- 语音输入、OCR 发票识别、数字人动画
- 异地就医备案、账户看板、附近定点机构等业务 Demo
- 管理员后台：查看已入库文件、上传 PDF/DOC、触发知识库重建

---

## 常用命令

```bash
# Windows 一键启动（自动检查依赖并启动）
./start.bat

# 或手动安装并启动（默认端口 5200）
npm install
npm run dev

# 新增/修改 raw-policies/ 后必须执行
npm run build-kb

# 生产构建与预览
npm run build
npm run preview

# 代码检查
npm run lint
```

**验证检索**

```bash
npx tsx scripts/test-search.ts      # 直接加载 JSON 索引
npx tsx scripts/test-api-search.ts  # 调 /api/search 端点
```

---

## 知识库（RAG）构建与运行

### 构建流程

1. 将政策文件（`.pdf` / `.docx` / `.doc` / `.txt` / `.md`）放入 `raw-policies/`。
   - Markdown 推荐包含 YAML frontmatter：`title`、`source`、`url`、`publishDate`、`category`。
2. 运行 `npm run build-kb`：
   - 解析文档 → **400 字符切片 / 80 字符重叠**
   - 使用 `TfidfEmbeddingProvider` 生成向量
   - 同时写入 `src/kb/nanjing-kb.lance`（LanceDB）和 `src/kb/nanjing-kb-index.json`（JSON）
3. **重启 `npm run dev`**：Vite 的 `/api/search` 中间件会缓存 JSON 索引。

#### 方式二：通过管理员后台（运行时）

1. 使用账号 `222` / 密码 `222` 登录系统。
2. 进入"系统管理后台"，上传新的 PDF / DOC / DOCX / TXT / MD 文件。
3. 点击"开始重建"，等待进度到达 100%。
4. 重建成功后，Vite 开发服务器会自动使 JSON 索引缓存失效，新内容立即可被检索。

### 运行时链路

```
用户输入
  → searchPolicies(query)
    → vectorSearch(query) 调用 POST /api/search
      → vite.config.ts 加载 JSON 索引
      → searchWithIndex() 计算余弦相似度
      → 返回 Top-K 切片
    → 若向量为空，降级 keywordSearchPolicies（mock/policies.json）
  → 结果注入 system prompt / 直接展示 PolicyCard
```

### 当前知识库规模

- **切片总数**：401 条
- 覆盖：异地就医、门诊统筹、住院报销、慢特病、生育保险、个人账户/家庭共济、居民医保缴费、大病保险、医疗救助、长期护理保险、医保关系转移、零星报销、医保电子凭证、南京宁惠保

---

## 关键代码路径

| 文件 | 作用 |
|---|---|
| `scripts/build-kb.ts` | 扫描原材料、解析、切片、生成 TF-IDF 向量、保存双索引 |
| `src/services/documentParser.ts` | PDF / Word / Markdown / TXT 统一解析 |
| `src/services/tfidf.ts` | 本地 TF-IDF 实现（中文 n-gram 切分） |
| `src/services/embedding.ts` | TF-IDF / Xenova / OpenAI 三种 Embedding Provider 工厂 |
| `src/services/vectorStore.ts` | LanceDB 写入/查询封装 |
| `src/services/searchIndex.ts` | 加载 JSON 索引、还原 TF-IDF、余弦相似度检索 |
| `src/services/rag.ts` | `searchPolicies(query)`：优先向量检索，失败降级关键词匹配 |
| `src/services/llm.ts` | DeepSeek LLM 调用 + system prompt |
| `src/types/kb.ts` | `DocumentChunk`、`SearchIndex`、`SearchResult` 等类型 |
| `vite.config.ts` | 开发服务器 `/api/search` 与 `/api/admin/*` 端点 |
| `src/services/kbBuilder.ts` | 可复用的知识库扫描/解析/切片/向量化/保存服务 |
| `src/services/adminApi.ts` | 管理员后台前端 API 封装 |
| `src/store/authStore.ts` | 登录状态与角色（Zustand + persist） |
| `src/pages/LoginPage.tsx` | 登录页 |
| `src/pages/AdminPage.tsx` | 系统管理员后台 |
| `src/components/PolicyCard.tsx` | 检索结果来源卡片 |

---

## 架构要点

### Embedding 切换

当前默认 **TF-IDF**，零依赖、离线可用。如需更强语义：

1. 在 `scripts/build-kb.ts` 中把 `TfidfEmbeddingProvider` 替换为 `createEmbeddingProvider('xenova')` 或 `'openai'`。
2. 在 `src/services/searchIndex.ts` 中确保检索端使用同一 Provider 还原向量。
3. 重新运行 `npm run build-kb`。

### 生产部署注意

- `/api/search` 与 `/api/admin/*` 仅 Vite 开发服务器提供，**生产构建后不可用**。
- 生产环境需要：
  - 单独后端（Node/Express/Fastify）承载 `/api/search` 与管理员接口，或
  - 将 JSON 索引作为静态资源部署，并在浏览器直接计算相似度（当前 `searchIndex.ts` 已支持）。

---

## 开发规范

- **模块类型**：`"type": "module"`，统一使用 ESM。
- **语言**：TypeScript，严格模式。
- **样式**：TailwindCSS v4，使用语义化色板（`primary` / `accent` / `neutral` / `success` / `error` / `warning`），详见 [`DESIGN.md`](DESIGN.md)。新增组件请优先使用语义 token，避免直接引入 `teal-*` / `cyan-*` / `slate-*` 等别名。
- **代码风格**：遵循项目 `.prettierrc` 与 `eslint.config.js`。
- **最小改动**：修复 bug / 添加功能时尽量只改必要文件，保持现有接口稳定。
- **测试优先**：修改 RAG 相关代码后，务必运行 `npm run build-kb`、`scripts/test-search.ts`、`scripts/test-api-search.ts`。

---

## 环境变量

参考 [`.env.example`](.env.example)：

```bash
VITE_DEEPSEEK_API_KEY=          # DeepSeek 真实大模型调用（可选）
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

VITE_QIANWEN_API_KEY=           # 千问/Qwen-VL 图片 OCR 识别（可选）
VITE_QIANWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
VITE_QIANWEN_VL_MODEL=qwen-vl-plus

# 可选：用 OpenAI/智谱 Embedding 替换本地 TF-IDF
# VITE_OPENAI_API_KEY=
# VITE_OPENAI_API_URL=
# VITE_EMBEDDING_MODEL=
```

未配置 `VITE_DEEPSEEK_API_KEY` 时，对话会 fallback 到 RAG 离线结果；未配置 `VITE_QIANWEN_API_KEY` 时，图片识别会 fallback 到本地 Tesseract OCR。

---

## 当前任务状态

### 已完成

- [x] 搭建南京医保 RAG 知识库（TF-IDF + LanceDB/JSON 双索引）
- [x] 抓取并入库江苏省/南京市核心医保政策文档
- [x] 修复 `/api/search` 默认阈值及阈值可配置
- [x] 补充住院、生育、居民医保、大病、救助、长护险、转移接续等政策
- [x] 补充门诊特殊病、家庭共济、零星报销、医保电子凭证、南京宁惠保
- [x] 重建知识库索引并验证检索效果
- [x] 编写 `AGENTS.md` 整理项目背景、规范与任务状态

### 待完成（按优先级）

- [x] **移动端响应式适配完善** — 已添加移动端快捷提问条、侧边栏图标 title 提示、触控目标 ≥ 44px
- [x] **无障碍与动效优化** — 已支持 `prefers-reduced-motion`、提升文本对比度、统一焦点环、skip link、live region
- [x] **界面反模式清理** — 已移除 dashboard hero-metric 四宫格、 eyebrow 标签、过度渐变装饰，主色改为 solid teal-600
- [x] **空状态与错误恢复** — 已补充报销记录/附近机构空状态、OCR 识别失败重试
- [x] **Bundle 体积优化** — `AccountDashboard`/`InvoiceUploader`/`NearbyPage` 懒加载，`tesseract.js` 动态引入，主包从 718 KB 降至 350 KB
- [x] **语义化颜色 token 体系** — `src/index.css` 增加 `primary` / `accent` / `neutral` / `success` / `error` / `warning` 六级色阶，组件类名统一迁移到语义 token；保留 `teal/cyan/slate` 作为向后兼容别名
- [x] **登录与管理员后台** — 新增登录页、角色分流、`authStore`、管理员文件上传与知识库重建 UI、`/api/admin/*` 接口
- [ ] **接入真实 LLM API 并替换 RAG 离线兜底** — 已有 DeepSeek 接入，需优化 fallback 策略与错误处理
- [ ] **录制 Demo 演示视频 / 准备答辩 PPT**

---

## 已知问题与限制

| 问题 | 说明 |
|---|---|
| TF-IDF 语义召回有限 | 表格类内容（如医疗服务价格目录）直接问价格得分偏低，更适合按项目编码/关键词定位 |
| PDF 解析警告 | 价格目录 PDF 解析时会出现 `standardFontDataUrl` 警告，文本仍可正常提取 |
| OCR 首次加载慢 | Tesseract.js 需下载中文训练模型，首次使用等待数秒 |
| 开发服务器索引缓存 | 修改 `src/kb/*.json` 后需重启 `npm run dev` |
| 部分日期/来源为推断值 | TXT 或未提供 frontmatter 的文档依赖文件名推断 |

---

## 修改后验证清单

每次修改知识库或 RAG 代码后，按以下顺序验证：

1. `npm run build-kb` 成功，切片数符合预期
2. `npx tsx scripts/test-search.ts` 返回合理 Top-K
3. `npx tsx scripts/test-api-search.ts` 200 且结果非空
4. 浏览器打开 `http://localhost:5200`，聊天中提问政策问题，`PolicyCard` 展示正确来源

---

> 最后更新：2026-06-22
>
> 变更记录：
> - 2026-06-22 新增登录页、角色分流与系统管理员后台；支持上传 PDF/DOC 并触发知识库重建；使用 `taste-skill` 设计登录与管理后台 UI；`CHANGELOG.md` / `AGENTS.md` / `README.md` 同步更新，lint 与 build 通过。
> - 2026-06-19 重构 `AGENTS.md` 结构；新增 `PRODUCT.md`、`DESIGN.md`；优化聊天页移动端体验、焦点可见性、动效无障碍与文本对比度；修复 ESLint 严格模式下的状态同步问题。
> - 2026-06-19 完成 `impeccable audit + polish`：skip link、触控目标、空状态、active 状态、调色板专业化；主包 code-splitting 后体积减半；开发服务器已启动在 `http://localhost:5200`。
> - 2026-06-19 完成语义化颜色 token 迁移：`DESIGN.md` / `AGENTS.md` 同步更新，lint 与 build 通过，代码推送至 GitHub。
