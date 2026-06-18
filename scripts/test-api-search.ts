async function main() {
  const queries = [
    '南京市异地就医备案怎么办',
    'CT检查价格',
    '承诺备案多久补齐材料',
  ]

  for (const q of queries) {
    console.log(`\n查询: ${q}`)
    const res = await fetch('http://localhost:5200/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, limit: 3 }),
    })
    const data = await res.json()
    console.log(`状态: ${res.status}, 结果数: ${data.results?.length || 0}`)
    if (data.error) console.log('错误:', data.error)
    for (const r of data.results || []) {
      console.log(`  - ${r.score?.toFixed(4)} | ${r.title || r.source} | ${r.source} ${r.publishDate || ''}`)
    }
  }
}

main().catch(console.error)
