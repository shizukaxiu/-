import * as lancedb from '@lancedb/lancedb'
import type { KnowledgeItem, SearchResult } from '../types/kb'

const DB_PATH = './src/kb/nanjing-kb.lance'
const TABLE_NAME = 'documents'

export interface VectorStore {
  add(items: KnowledgeItem[]): Promise<void>
  search(vector: number[], limit?: number): Promise<SearchResult[]>
  count(): Promise<number>
}

export async function createVectorStore(dbPath = DB_PATH): Promise<VectorStore> {
  const db = await lancedb.connect(dbPath)

  return {
    async add(items: KnowledgeItem[]) {
      const data = items.map((item) => ({
        id: item.id,
        text: item.text,
        source: item.source,
        city: item.city,
        category: item.category,
        publishDate: item.publishDate || '',
        title: item.title || '',
        vector: item.vector,
      }))

      try {
        await db.dropTable(TABLE_NAME)
      } catch {
        // 表不存在时忽略
      }
      await db.createTable(TABLE_NAME, data)
    },

    async search(vector: number[], limit = 5): Promise<SearchResult[]> {
      try {
        const table = await db.openTable(TABLE_NAME)
        const results = await table.vectorSearch(vector).limit(limit).toArray()
        return results.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          text: row.text as string,
          source: row.source as string,
          city: row.city as string,
          category: row.category as string,
          publishDate: (row.publishDate as string) || undefined,
          title: (row.title as string) || undefined,
          score: typeof row._distance === 'number' ? 1 - row._distance : 0,
        }))
      } catch {
        return []
      }
    },

    async count(): Promise<number> {
      try {
        const table = await db.openTable(TABLE_NAME)
        return await table.countRows()
      } catch {
        return 0
      }
    },
  }
}

export async function searchByText(
  text: string,
  embedFn: (text: string) => Promise<number[]>,
  limit = 5
): Promise<SearchResult[]> {
  const vector = await embedFn(text)
  const store = await createVectorStore()
  return store.search(vector, limit)
}
