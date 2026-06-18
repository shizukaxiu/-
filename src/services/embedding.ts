import type { EmbeddingProvider } from '../types/kb'
import { TfidfEmbeddingProvider } from './tfidf'

export { TfidfEmbeddingProvider }
export * from './tfidf'

export class XenovaEmbeddingProvider implements EmbeddingProvider {
  private extractor: unknown | null = null
  private model = 'Xenova/bge-small-zh-v1.5'

  async init() {
    if (this.extractor) return
    const { pipeline } = await import('@xenova/transformers')
    this.extractor = await pipeline('feature-extraction', this.model)
  }

  async embed(text: string): Promise<number[]> {
    await this.init()
    const extractor = this.extractor as (text: string, options: Record<string, unknown>) => Promise<{ data: Float32Array }>
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = []
    for (const text of texts) {
      results.push(await this.embed(text))
    }
    return results
  }
}

export interface OpenAIEmbeddingOptions {
  apiKey: string
  apiUrl?: string
  model?: string
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string
  private apiUrl: string
  private model: string

  constructor(options: OpenAIEmbeddingOptions) {
    this.apiKey = options.apiKey
    this.apiUrl = options.apiUrl || 'https://api.openai.com/v1/embeddings'
    this.model = options.model || 'text-embedding-3-small'
  }

  async embed(text: string): Promise<number[]> {
    const vectors = await this.embedBatch([text])
    return vectors[0]
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('未配置 Embedding API Key')
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    })

    if (!response.ok) {
      throw new Error(`Embedding API 请求失败: ${response.status}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await response.json() as any
    return data.data.map((item: { embedding: number[] }) => item.embedding)
  }
}

export type ProviderType = 'tfidf' | 'xenova' | 'openai'

export function createEmbeddingProvider(
  type: ProviderType = 'tfidf',
  options?: OpenAIEmbeddingOptions
): EmbeddingProvider {
  if (type === 'xenova') {
    return new XenovaEmbeddingProvider()
  }
  if (type === 'openai') {
    if (!options?.apiKey) {
      throw new Error('OpenAI Embedding 需要传入 apiKey')
    }
    return new OpenAIEmbeddingProvider(options)
  }
  return new TfidfEmbeddingProvider()
}
