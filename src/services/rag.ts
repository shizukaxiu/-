import policies from '../mock/policies.json'
import type { PolicyQA, SearchResult } from '../types'

const policyData: PolicyQA[] = policies as PolicyQA[]

export async function vectorSearch(query: string, limit = 3): Promise<SearchResult[]> {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    })
    const data = await response.json()
    if (data.error) {
      console.warn('向量检索返回错误:', data.error)
      return []
    }
    return data.results || []
  } catch (error) {
    console.warn('向量检索不可用，降级到关键词匹配:', error)
    return []
  }
}

export function keywordSearchPolicies(query: string): PolicyQA[] {
  const q = query.toLowerCase()
  const scored = policyData
    .map((policy) => {
      let score = 0
      if (policy.question.toLowerCase().includes(q)) score += 10
      policy.keywords.forEach((kw) => {
        if (q.includes(kw.toLowerCase())) score += 3
        if (kw.toLowerCase().includes(q)) score += 1
      })
      if (policy.answer.toLowerCase().includes(q)) score += 2
      return { policy, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map((item) => item.policy)
}

export async function searchPolicies(query: string): Promise<PolicyQA[]> {
  // 优先使用南京医保向量知识库
  const vectorResults = await vectorSearch(query, 3)
  if (vectorResults.length > 0) {
    return vectorResults.map((r) => ({
      id: r.id,
      question: r.title || '南京医保政策',
      keywords: r.category ? [r.category] : [],
      answer: r.text,
      meta: r,
    }))
  }

  // 向量检索失败或无结果，降级到关键词匹配
  return keywordSearchPolicies(query)
}

export async function findBestAnswer(query: string): Promise<string | null> {
  const results = await searchPolicies(query)
  if (results.length === 0) return null
  return results[0].answer
}

export function buildSystemPrompt(): string {
  return `你是一名专业、热情、耐心的南京市医保智能经办助手，名叫"医保小助手"。请用亲切、简洁、口语化的中文回答用户关于南京市医保政策、报销、备案、账户查询等问题。

回答要求：
1. 语气像客服一样亲切，可以适当使用"您好""请放心""没问题"等表达。
2. 严格基于提供的南京市医保政策材料回答，如果材料中没有明确答案，给出通用指引并建议用户拨打南京医保服务热线 12393 或前往南京市医保经办机构咨询。
3. 涉及异地就医备案时，主动询问是否需要立即办理，并引导用户确认。
4. 所有数据均为模拟展示，回答中不要泄露真实个人信息。
5. 回答控制在 200 字以内，重点清晰。`
}
