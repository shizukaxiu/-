import fs from 'node:fs/promises'
import path from 'node:path'
import mammoth from 'mammoth'

export interface ParsedDocument {
  fileName: string
  title: string
  content: string
  source?: string
  url?: string
  publishDate?: string
  category?: string
  city?: string
}

export async function parseDocument(filePath: string): Promise<ParsedDocument> {
  const ext = path.extname(filePath).toLowerCase()
  const fileName = path.basename(filePath)
  const baseTitle = fileName.replace(/\.[^/.]+$/, '')

  if (ext === '.pdf') {
    const buffer = await fs.readFile(filePath)
    const data = new Uint8Array(buffer)
    const pdfModule = await import('pdf-parse')
    // @ts-expect-error pdf-parse ESM 导出为 PDFParse 类
    const PDFParse = pdfModule.PDFParse as new (data: Uint8Array) => {
      load(): Promise<void>
      getText(): Promise<{ text: string; pages: Array<{ text: string }> }>
    }
    const parser = new PDFParse(data)
    await parser.load()
    const result = await parser.getText()
    return { fileName, title: baseTitle, content: cleanText(result.text) }
  }

  if (ext === '.docx' || ext === '.doc') {
    const buffer = await fs.readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return { fileName, title: baseTitle, content: cleanText(result.value) }
  }

  if (ext === '.txt') {
    const content = await fs.readFile(filePath, 'utf-8')
    return { fileName, title: baseTitle, content: cleanText(content) }
  }

  if (ext === '.md') {
    const content = await fs.readFile(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(content)
    return {
      fileName,
      title: frontmatter.title || baseTitle,
      content: cleanText(body),
      source: frontmatter.source,
      url: frontmatter.url,
      publishDate: frontmatter.publishDate,
      category: frontmatter.category,
      city: frontmatter.city,
    }
  }

  throw new Error(`不支持的文件格式: ${ext}`)
}

function parseFrontmatter(content: string): {
  frontmatter: Record<string, string>
  body: string
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const frontmatter: Record<string, string> = {}
  const lines = match[1].split('\n')
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      frontmatter[key] = value
    }
  }

  return { frontmatter, body: match[2] }
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')
    .trim()
}

export function splitIntoChunks(text: string, maxLength = 500, overlap = 100): string[] {
  const sentences = text.split(/(?<=[。！？.?!])\s+/)
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength && current.length > 0) {
      chunks.push(current.trim())
      current = current.slice(-overlap) + sentence
    } else {
      current += sentence
    }
  }

  if (current.trim()) {
    chunks.push(current.trim())
  }

  return chunks.filter((c) => c.length > 30)
}
