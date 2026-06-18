import type { SearchIndex, SearchResult } from '../types/kb'
import { TfidfEmbeddingProvider, cosineSimilarity } from './tfidf'

let cachedIndex: SearchIndex | null = null
let cachedProvider: TfidfEmbeddingProvider | null = null

export async function loadSearchIndex(indexPath?: string): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex
  const path = indexPath || './src/kb/nanjing-kb-index.json'
  const data = await fetch(path).then((r) => r.json())
  cachedIndex = data as SearchIndex
  return cachedIndex
}

export function createProviderFromIndex(index: SearchIndex): TfidfEmbeddingProvider {
  if (cachedProvider) return cachedProvider
  const provider = new TfidfEmbeddingProvider()
  provider['vocabulary'] = index.vocabulary
  provider['idf'] = new Map(Object.entries(index.idf))
  provider['documentCount'] = index.documents.length
  cachedProvider = provider
  return provider
}

export async function searchWithIndex(
  query: string,
  index: SearchIndex,
  limit = 5,
  threshold = 0.05
): Promise<SearchResult[]> {
  const provider = createProviderFromIndex(index)
  const queryVector = await provider.embed(query)

  const scored = index.documents
    .map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.vector),
    }))
    .filter((doc) => doc.score >= threshold)

  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}
