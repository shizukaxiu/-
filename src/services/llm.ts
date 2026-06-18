import { buildSystemPrompt, findBestAnswer } from './rag'

const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function* streamChat(
  messages: LLMMessage[],
  options?: { useRAG?: boolean }
): AsyncGenerator<string, void, unknown> {
  const lastUser = messages[messages.length - 1]

  // RAG 兜底：把政策答案注入 system prompt
  let ragAnswer: string | null = null
  if (options?.useRAG && lastUser?.role === 'user') {
    ragAnswer = await findBestAnswer(lastUser.content)
  }

  const systemContent = buildSystemPrompt() + (ragAnswer ? `\n\n【参考政策】${ragAnswer}` : '')
  const promptMessages = [{ role: 'system', content: systemContent }, ...messages]

  // 没有 API Key 时，使用 RAG 兜底回复
  if (!API_KEY) {
    const fallback = ragAnswer || (await findBestAnswer(lastUser.content))
    yield (
      fallback ||
      '您好，这个问题我需要进一步核实。建议您拨打南京医保服务热线 12393 或前往南京市医保经办机构咨询。'
    )
    return
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: promptMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 512,
      }),
    })

    if (!response.ok) {
      throw new Error(`LLM API 请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('无法读取响应流')

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return
        try {
          const chunk = JSON.parse(data)
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {
          // 忽略解析失败的 chunk
        }
      }
    }
  } catch (error) {
    console.error('LLM 调用失败:', error)
    const fallback = await findBestAnswer(lastUser.content)
    yield (
      fallback ||
      '抱歉，当前智能服务暂时不可用，已为您切换至离线模式。如需紧急帮助，请拨打南京医保服务热线 12393。'
    )
  }
}
