import type { Invoice } from '../types'

const API_URL = import.meta.env.VITE_QIANWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const API_KEY = import.meta.env.VITE_QIANWEN_API_KEY
const MODEL = import.meta.env.VITE_QIANWEN_VL_MODEL || 'qwen-vl-plus'

export function isQwenOcrAvailable(): boolean {
  return Boolean(API_KEY && API_URL)
}

async function imageUrlToBase64(imageUrl: string): Promise<string> {
  // 如果已经是 base64 data URL，直接返回
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }

  // 否则按 blob url / 网络图片读取
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

interface QwenOcrResult {
  hospital?: string
  date?: string
  total?: number
  items?: Array<{ name: string; amount: number; category: string }>
}

const OCR_PROMPT = `请识别这张发票/收据图片，提取以下信息并以 JSON 格式返回：
{
  "hospital": "医院/机构名称",
  "date": "YYYY-MM-DD 格式的日期",
  "total": 总金额数字,
  "items": [
    {"name": "项目名称", "amount": 金额数字, "category": "药品费/检查费/诊察费/治疗费/其他"}
  ]
}
如果无法识别某字段，请返回 null 或合理默认值。只返回 JSON，不要任何其他解释。`

export async function recognizeInvoiceWithQwen(imageUrl: string): Promise<Invoice> {
  if (!API_KEY) {
    throw new Error('未配置千问 API Key')
  }

  const base64Image = await imageUrlToBase64(imageUrl)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`千问 API 请求失败: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('千问 API 返回为空')
  }

  const result = parseQwenResponse(content)

  if (!result.hospital && !result.total) {
    throw new Error('千问 OCR 未能识别有效发票信息')
  }

  return {
    invoiceNo: `QWEN-${Date.now().toString().slice(-8)}`,
    hospital: result.hospital || '未知医院',
    date: result.date || new Date().toISOString().slice(0, 10),
    items:
      result.items && result.items.length > 0
        ? result.items
        : [{ name: '综合医疗费用', amount: result.total || 0, category: '其他' }],
    total: result.total || 0,
    estimatedReimbursement: Math.round((result.total || 0) * 0.7 * 100) / 100,
  }
}

function parseQwenResponse(content: string): QwenOcrResult {
  // 尝试提取 JSON 代码块或原始 JSON
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : content.trim()

  // 找到第一个 { 和最后一个 }
  const start = jsonText.indexOf('{')
  const end = jsonText.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('千问返回内容无法解析为 JSON')
  }

  const parsed = JSON.parse(jsonText.slice(start, end + 1)) as QwenOcrResult

  return {
    hospital: parsed.hospital || undefined,
    date: parsed.date || undefined,
    total: typeof parsed.total === 'number' ? parsed.total : undefined,
    items: Array.isArray(parsed.items) ? parsed.items : undefined,
  }
}
