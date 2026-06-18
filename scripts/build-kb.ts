import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDocument, splitIntoChunks } from '../src/services/documentParser'
import { TfidfEmbeddingProvider } from '../src/services/embedding'
import { createVectorStore } from '../src/services/vectorStore'
import type { DocumentChunk, KnowledgeItem, SearchIndex } from '../src/types/kb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAW_DIR = path.resolve(__dirname, '../raw-policies')
const KB_DIR = path.resolve(__dirname, '../src/kb')

async function main() {
  console.log('🔍 扫描原始政策文档...')
  const files = await fs.readdir(RAW_DIR)
  const supportedFiles = files.filter(
    (f) => /\.(pdf|docx?|txt|md)$/i.test(f) && !/^README/i.test(f)
  )

  if (supportedFiles.length === 0) {
    console.log('⚠️  raw-policies 目录下没有找到支持的政策文档')
    console.log('    请放入南京医保政策 PDF/Word/TXT 文件后再运行此脚本')
    return
  }

  console.log(`📄 找到 ${supportedFiles.length} 个文档，开始解析...`)

  const allChunks: DocumentChunk[] = []
  for (const file of supportedFiles) {
    const filePath = path.join(RAW_DIR, file)
    try {
      const doc = await parseDocument(filePath)
      const chunks = splitIntoChunks(doc.content, 400, 80)
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
      console.log(`  ✓ ${file} → ${chunks.length} 个切片`)
    } catch (err) {
      console.error(`  ✗ ${file} 解析失败:`, err instanceof Error ? err.message : err)
    }
  }

  if (allChunks.length === 0) {
    console.log('⚠️  没有解析到有效内容')
    return
  }

  console.log(`🧠 开始为 ${allChunks.length} 个切片生成向量（TF-IDF）...`)
  const provider = new TfidfEmbeddingProvider()
  provider.fit(allChunks.map((c) => c.text))
  const vectors = await provider.embedBatch(allChunks.map((c) => c.text))

  const items: KnowledgeItem[] = allChunks.map((chunk, idx) => ({
    ...chunk,
    vector: vectors[idx],
  }))

  console.log('💾 保存到 LanceDB 向量库...')
  await fs.mkdir(KB_DIR, { recursive: true })
  const store = await createVectorStore()
  await store.add(items)
  const count = await store.count()

  console.log('📝 同时生成 JSON 检索索引...')
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
  await fs.writeFile(
    path.join(KB_DIR, 'nanjing-kb-index.json'),
    JSON.stringify(index, null, 2)
  )

  console.log(`✅ 知识库构建完成！共收录 ${count} 条南京医保政策切片`)
  console.log(`   LanceDB 路径: ${path.resolve(KB_DIR, 'nanjing-kb.lance')}`)
  console.log(`   JSON 索引: ${path.resolve(KB_DIR, 'nanjing-kb-index.json')}`)
}

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

main().catch((err) => {
  console.error('❌ 构建知识库失败:', err)
  process.exit(1)
})
