import fs from 'node:fs/promises'
import { searchWithIndex } from '../src/services/searchIndex'
import type { SearchIndex } from '../src/types/kb'

const INDEX_PATH = 'C:\\Users\\a1246\\Desktop\\医保经办助手\\src\\kb\\nanjing-kb-index.json'

const queries = [
  // 原有查询
  '南京市异地就医备案怎么办',
  '南京职工医保门诊统筹起付线是多少',
  '儿童长期居住异地住院报销比例',
  '门诊慢性病怎么办理',
  'CT检查价格',
  '住院报销比例',
  '医保个人账户划入比例',
  // 新增方向
  '南京职工医保住院三级医院报销比例',
  '生育津贴怎么算 发多少天',
  '南京居民医保2026年缴费标准',
  '居民医保参保缴费渠道',
  '大病保险起付线多少 报销比例',
  '医疗救助对象有哪些 救助比例',
  '长期护理保险怎么申请 待遇标准',
  '医保关系转移怎么办理',
]

async function main() {
  const raw = await fs.readFile(INDEX_PATH, 'utf-8')
  const index: SearchIndex = JSON.parse(raw)
  console.log(`索引已加载：${index.documents.length} 条切片，词汇表 ${index.vocabulary.length}`)

  for (const q of queries) {
    console.log(`\n========== 查询：${q} ==========`)
    const results = await searchWithIndex(q, index, 3, 0.02)
    if (results.length === 0) {
      console.log('（无匹配结果）')
      continue
    }
    results.forEach((r, i) => {
      console.log(`\n[${i + 1}] score=${r.score?.toFixed(4)} | ${r.title || r.source}`)
      console.log(`    source: ${r.source} | date: ${r.publishDate || 'N/A'} | city: ${r.city} | category: ${r.category}`)
      console.log(`    text: ${r.text?.slice(0, 220).replace(/\s+/g, ' ')}...`)
    })
  }
}

main().catch(console.error)
