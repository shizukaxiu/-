# 南京医保政策原始文档

把南京市医保政策文件放在这个目录下，支持以下格式：

- `.pdf` — PDF 文档
- `.docx` / `.doc` — Word 文档
- `.txt` / `.md` — 文本文件

> 当前目录下的 `南京市_异地就医备案指南_示例.txt` 是一个示例文件，仅用于演示向量检索效果。放入真实政策文档后可删除。

## 命名建议

```
南京市_门诊统筹办法_2024.pdf
南京市_异地就医备案指南_2025.docx
南京市_慢特病管理办法_2023.pdf
...
```

## 放入文件后执行

```bash
npm run build-kb
```

脚本会自动：
1. 解析所有文档
2. 切分成知识片段
3. 用本地 TF-IDF 模型生成向量
4. 保存到 `src/kb/nanjing-kb.lance` 和 `src/kb/nanjing-kb-index.json`

然后启动开发服务器即可体验基于南京医保政策的智能问答：

```bash
npm run dev
```

## 切换 Embedding 模型（可选）

默认使用本地 TF-IDF，无需联网和 API Key。如果你希望使用更强的语义向量模型，可以：

1. 配置 OpenAI 兼容的 Embedding API（在 `.env` 中填写 `VITE_OPENAI_API_KEY` 等）
2. 修改 `scripts/build-kb.ts` 和 `vite.config.ts` 中的 provider 类型
