export interface DocumentChunk {
  id: string
  text: string
  source: string
  city: string
  category: string
  publishDate?: string
  title?: string
  url?: string
}

export interface KnowledgeItem extends DocumentChunk {
  vector: number[]
}

export interface SearchResult extends DocumentChunk {
  score: number
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

export interface SearchIndex {
  vocabulary: string[]
  idf: Record<string, number>
  documents: Array<{
    id: string
    text: string
    vector: number[]
    source: string
    city: string
    category: string
    publishDate?: string
    title?: string
    url?: string
  }>
  builtAt: string
}
