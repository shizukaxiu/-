import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildKnowledgeBase } from '../src/services/kbBuilder'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAW_DIR = path.resolve(__dirname, '../raw-policies')
const KB_DIR = path.resolve(__dirname, '../src/kb')

async function main() {
  const result = await buildKnowledgeBase({
    rawDir: RAW_DIR,
    kbDir: KB_DIR,
    onProgress: (message, percent) => {
      const bar = '█'.repeat(Math.round(percent / 5)) + '░'.repeat(20 - Math.round(percent / 5))
      console.log(`[${bar}] ${percent}% ${message}`)
    },
  })

  console.log(`✅ 知识库构建完成！`)
  console.log(`   收录文件: ${result.fileCount} 个`)
  console.log(`   切片总数: ${result.chunkCount} 条`)
  console.log(`   LanceDB 路径: ${result.dbPath}`)
  console.log(`   JSON 索引: ${result.indexPath}`)
}

main().catch((err) => {
  console.error('❌ 构建知识库失败:', err instanceof Error ? err.message : err)
  process.exit(1)
})
