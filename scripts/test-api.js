const queries = [
  '南京异地就医怎么办理',
  '职工医保门诊统筹报销比例',
  '门诊慢性病怎么办理',
  '儿童异地住院报销比例',
  'CT检查多少钱',
]

async function test() {
  for (const query of queries) {
    console.log(`\n========== ${query} ==========`)
    try {
      const res = await fetch('http://localhost:5200/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 2 }),
      })
      const data = await res.json()
      data.results.forEach((r, i) => {
        console.log(`[${i + 1}] score=${r.score.toFixed(4)} source=${r.source}`)
        console.log(`    ${r.text.slice(0, 150)}...`)
      })
    } catch (e) {
      console.error('Error:', e)
    }
  }
}

test()
