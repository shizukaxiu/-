import type { Invoice } from '../types'
import mockInvoice from '../mock/invoices.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let worker: any | null = null

export async function initOCRWorker() {
  if (worker) return worker
  const { createWorker } = await import('tesseract.js')
  worker = await createWorker('chi_sim+eng')
  return worker
}

export async function recognizeInvoice(imageUrl: string): Promise<Invoice> {
  try {
    const ocrWorker = await initOCRWorker()
    const {
      data: { text },
    } = await ocrWorker.recognize(imageUrl)

    // 简易规则：从 OCR 文本中提取金额、医院名等信息
    const hospital = extractHospital(text)
    const total = extractAmount(text)
    const date = extractDate(text) || new Date().toISOString().slice(0, 10)

    // 如果识别结果太弱，使用 mock 数据兜底
    if (!hospital && total === 0) {
      return { ...mockInvoice } as Invoice
    }

    const estimatedReimbursement = Math.round(total * 0.7 * 100) / 100
    return {
      invoiceNo: `OCR-${Date.now().toString().slice(-8)}`,
      hospital: hospital || '未知医院',
      date,
      items: parseItems(text, total),
      total,
      estimatedReimbursement,
    }
  } catch (error) {
    console.error('OCR 识别失败:', error)
    // 兜底返回 mock 数据，保证 Demo 稳定
    return { ...mockInvoice } as Invoice
  }
}

function extractHospital(text: string): string | null {
  // 匹配 "XX医院"、"XX卫生院"、"XX药房"
  const match = text.match(/[\u4e00-\u9fa5]{2,}(医院|卫生院|诊所|药房|药店)/)
  return match ? match[0] : null
}

function extractAmount(text: string): number {
  // 匹配 "合计：xxx元"、"总金额"、"¥xxx" 等
  const patterns = [
    /合计[\s:：]*¥?\s*(\d+(?:\.\d{1,2})?)\s*元?/,
    /总金额[\s:：]*¥?\s*(\d+(?:\.\d{1,2})?)/,
    /总计[\s:：]*¥?\s*(\d+(?:\.\d{1,2})?)/,
    /¥\s*(\d+(?:\.\d{1,2})?)/,
    /(\d+(?:\.\d{1,2})?)\s*元/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      if (value > 0) return value
    }
  }
  return 0
}

function extractDate(text: string): string | null {
  const match = text.match(/(\d{4})[-年/](\d{1,2})[-月/](\d{1,2})/)
  if (match) {
    const [, y, m, d] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function parseItems(text: string, total: number): Invoice['items'] {
  const lines = text.split('\n').filter((line) => line.trim())
  const items: Invoice['items'] = []
  const amountRegex = /(\d+(?:\.\d{1,2})?)\s*元?/

  for (const line of lines) {
    const amountMatch = line.match(amountRegex)
    if (!amountMatch) continue
    const amount = parseFloat(amountMatch[1])
    if (amount <= 0 || amount === total) continue

    // 简单判断类别
    let category = '其他'
    if (/药|胶囊|片|颗粒|口服液/.test(line)) category = '药品费'
    else if (/检查|检验|CT|B超|核磁/.test(line)) category = '检查费'
    else if (/挂号|诊察|诊疗/.test(line)) category = '诊察费'
    else if (/手术|治疗/.test(line)) category = '治疗费'

    const name = line.replace(amountMatch[0], '').trim().slice(0, 20) || '未识别项目'
    items.push({ name, amount, category })
  }

  if (items.length === 0) {
    items.push({ name: '综合医疗费用', amount: total, category: '其他' })
  }

  return items
}

export async function terminateOCRWorker() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
