# Changelog

所有重要变更都会记录在此文件。

## [Unreleased]

### Added

- 新增登录页 `LoginPage`，作为应用首屏入口。
- 新增基于本地静态凭证的角色判断：
  - 用户名 `111` / 密码 `111` → 普通用户界面
  - 用户名 `222` / 密码 `222` → 系统管理员界面
- 新增 `src/store/authStore.ts`（Zustand + persist），持久化登录状态与角色信息。
- 新增系统管理员后台 `src/pages/AdminPage.tsx`，支持：
  - 查看当前 `raw-policies/` 已收录文件列表与切片统计。
  - 拖拽或点击上传 PDF / DOC / DOCX / TXT / MD 文件。
  - 触发知识库重建，实时展示重建进度与结果。
- 新增管理员后台组件：
  - `src/components/admin/StatCard.tsx`
  - `src/components/admin/FileList.tsx`
  - `src/components/admin/UploadZone.tsx`
  - `src/components/admin/RebuildPanel.tsx`
- 新增 `src/services/adminApi.ts` 统一封装管理员接口。
- 新增 `src/services/kbBuilder.ts`，将知识库构建逻辑从 `scripts/build-kb.ts` 抽离为可复用服务，供后端 API 调用。
- 扩展 `vite.config.ts` 开发服务器中间件，新增管理员 API：
  - `POST /api/admin/login`
  - `GET /api/admin/files`
  - `POST /api/admin/upload`
  - `POST /api/admin/rebuild`
  - `GET /api/admin/rebuild-status`

### Changed

- `src/App.tsx` 改为根据登录状态与角色渲染登录页 / 用户界面 / 管理员界面。
- `src/components/Layout.tsx` Header 增加退出登录按钮。
- `index.html` 的 `lang` 改为 `zh-CN`，`<title>` 改为"医保经办助手"。
- `scripts/build-kb.ts` 改为调用 `src/services/kbBuilder.ts`，保持 CLI 行为一致。

### Notes

- 管理员 API 仅在 Vite 开发服务器（`npm run dev`）可用，生产构建后需单独后端承载。
- 登录页与管理员界面 UI 使用 `taste-skill`（design-taste-frontend）设计方向：政务可信、低方差、低动效、中等密度。
