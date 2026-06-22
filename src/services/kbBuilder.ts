import fs from 'node:fs/promises'
import path from 'node:path'
import { parseDocument, splitIntoChunks } from './documentParser'
import { TfidfEmbeddingProvider } from './embedding'
import { createVectorStore } from './vectorStore'
import type { DocumentChunk, KnowledgeItem, SearchIndex } from '../types/kb'

export interface BuildKbOptions {
  rawDir: string
  kbDir: string
  chunkSize?: number
  overlap?: number
  onProgress?: (message: string, percent: number) => void | Promise<void>
}

export interface BuildKbResult {
  fileCount: number
  chunkCount: number
  indexPath: string
  dbPath: string
  builtAt: string
}

const DEFAULT_CHUNK_SIZE = 400
const DEFAULT_OVERLAP = 80

function inferCategory(text: string): string {
  const keywords: Record<string, string[]> = {
    异地就医: ['异地', '备案', '跨省', '跨市', '转诊'],
    门诊统筹: ['门诊统筹', '门诊报销', '门诊费用'],
    住院报销: ['住院', '起付线', '报销比例', '封顶线'],
    慢特病: ['慢特病', '门诊慢性病', '特殊病种', '病种'],
    生育保险: ['生育', '产检', '生育津贴', '产假'],
    个人账户: ['个人账户', '家庭共济', '医保卡余额'],
    医保缴费: ['缴费', '参保', '断缴', '补缴'],
  }

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((w) => text.includes(w))) return category
  }
  return '综合政策'
}

export async function buildKnowledgeBase(options: BuildKbOptions): Promise<BuildKbResult> {
  const { rawDir, kbDir, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP, onProgress } = options

  const report = async (message: string, percent: number) => {
    if (onProgress) {
      await onProgress(message, percent)
    }
  }

  await report('扫描原始政策文档...', 5)
  const files = await fs.readdir(rawDir)
  const supportedFiles = files.filter(
    (f) => /\.(pdf|docx?|txt|md)$/i.test(f) && !/^README/i.test(f)
  )

  if (supportedFiles.length === 0) {
    throw new Error('raw-policies 目录下没有找到支持的政策文档')
  }

  await report(`找到 ${supportedFiles.length} 个文档，开始解析...`, 10)

  const allChunks: DocumentChunk[] = []
  for (let i = 0; i < supportedFiles.length; i++) {
    const file = supportedFiles[i]
    const filePath = path.join(rawDir, file)
    try {
      const doc = await parseDocument(filePath)
      const chunks = splitIntoChunks(doc.content, chunkSize, overlap)
      chunks.forEach((text, idx) => {
        allChunks.push({
          id: `${path.basename(file, path.extname(file))}-${idx}`,
          text,
          source: doc.source || doc.fileName,
          city: doc.city || '南京市',
          category: doc.category || inferCategory(text),
          title: doc.title,
          url: doc.url,
          publishDate: doc.publishDate,
        })
      })
      const percent = 10 + Math.round(((i + 1) / supportedFiles.length) * 30)
      await report(`解析完成 ${file} → ${chunks.length} 个切片`, percent)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await report(`解析失败 ${file}: ${msg}`, 10 + Math.round(((i + 1) / supportedFiles.length) * 30))
      // 继续处理其他文件，不中断整个构建
    }
  }

  if (allChunks.length === 0) {
    throw new Error('没有解析到有效内容')
  }

  await report(`开始为 ${allChunks.length} 个切片生成向量（TF-IDF）...`, 50)
  const provider = new TfidfEmbeddingProvider()
  provider.fit(allChunks.map((c) => c.text))
  const vectors = await provider.embedBatch(allChunks.map((c) => c.text))

  const items: KnowledgeItem[] = allChunks.map((chunk, idx) => ({
    ...chunk,
    vector: vectors[idx],
  }))

  await report('保存到 LanceDB 向量库...', 80)
  await fs.mkdir(kbDir, { recursive: true })
  const dbPath = path.resolve(kbDir, 'nanjing-kb.lance')
  const store = await createVectorStore(dbPath)
  await store.add(items)
  const count = await store.count()

  await report('生成 JSON 检索索引...', 90)
  const index: SearchIndex = {
    vocabulary: provider.vocabulary,
    idf: Object.fromEntries(provider.idf),
    documents: items.map(({ id, text, source, city, category, publishDate, title, url, vector }) => ({
      id,
      text,
      source,
      city,
      category,
      publishDate,
      title,
      url,
      vector,
    })),
    builtAt: new Date().toISOString(),
  }
  const indexPath = path.resolve(kbDir, 'nanjing-kb-index.json')
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2))

  await report(`知识库构建完成！共收录 ${count} 条切片`, 100)

  return {
    fileCount: supportedFiles.length,
    chunkCount: count,
    indexPath,
    dbPath,
    builtAt: index.builtAt,
  }
}
