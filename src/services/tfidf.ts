import type { EmbeddingProvider } from '../types/kb'

export class TfidfEmbeddingProvider implements EmbeddingProvider {
  idf: Map<string, number> = new Map()
  vocabulary: string[] = []
  documentCount = 0

  fit(documents: string[]): void {
    const termDocCount: Map<string, number> = new Map()
    this.documentCount = documents.length

    for (const doc of documents) {
      const terms = this.tokenize(doc)
      const uniqueTerms = new Set(terms)
      for (const term of uniqueTerms) {
        termDocCount.set(term, (termDocCount.get(term) || 0) + 1)
      }
    }

    this.vocabulary = Array.from(termDocCount.keys())
    this.idf = new Map()
    for (const [term, count] of termDocCount) {
      const idf = Math.log(this.documentCount / (count + 1)) + 1
      this.idf.set(term, idf)
    }
  }

  async embed(text: string): Promise<number[]> {
    const terms = this.tokenize(text)
    const tf = this.computeTf(terms)
    const vector = this.vocabulary.map((term) => {
      const termTf = tf.get(term) || 0
      const termIdf = this.idf.get(term) || 0
      return termTf * termIdf
    })
    return this.normalize(vector)
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embed(text)))
  }

  private tokenize(text: string): string[] {
    const normalized = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
    const tokens: string[] = []
    const parts = normalized.split(/\s+/).filter(Boolean)

    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        if (part.length >= 2) tokens.push(part)
        continue
      }
      if (/^[a-z]+$/.test(part)) {
        if (part.length >= 2) tokens.push(part)
        continue
      }

      // 中文按 2-gram 切分
      for (let i = 0; i <= part.length - 2; i++) {
        tokens.push(part.slice(i, i + 2))
      }
    }

    return tokens
  }

  private computeTf(terms: string[]): Map<string, number> {
    const tf: Map<string, number> = new Map()
    for (const term of terms) {
      tf.set(term, (tf.get(term) || 0) + 1)
    }
    const maxFreq = Math.max(...tf.values(), 1)
    for (const [term, count] of tf) {
      tf.set(term, 0.5 + (0.5 * count) / maxFreq)
    }
    return tf
  }

  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
    if (magnitude === 0) return vector
    return vector.map((v) => v / magnitude)
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10)
}
