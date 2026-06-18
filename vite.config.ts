import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { searchWithIndex } from './src/services/searchIndex'
import type { SearchIndex } from './src/types/kb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INDEX_PATH = path.resolve(__dirname, './src/kb/nanjing-kb-index.json')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'nanjing-kb-api',
      configureServer(server) {
        let cachedIndex: SearchIndex | null = null

        async function loadIndex(): Promise<SearchIndex | null> {
          if (cachedIndex) return cachedIndex
          try {
            const content = await fs.readFile(INDEX_PATH, 'utf-8')
            cachedIndex = JSON.parse(content) as SearchIndex
            return cachedIndex
          } catch {
            return null
          }
        }

        server.middlewares.use('/api/search', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          try {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(chunk)
            }
            const body = JSON.parse(Buffer.concat(chunks).toString())
            const { query, limit = 5, threshold = 0.02 } = body

            if (!query) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: '缺少 query 参数' }))
              return
            }

            const index = await loadIndex()
            if (!index) {
              res.statusCode = 503
              res.end(JSON.stringify({ error: '知识库索引尚未构建，请先运行 npm run build-kb', results: [] }))
              return
            }

            const results = await searchWithIndex(query, index, limit, threshold)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ results }))
          } catch (err) {
            console.error('知识库检索失败:', err)
            res.statusCode = 500
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : '检索失败',
                results: [],
              })
            )
          }
        })
      },
    },
  ],
  server: {
    port: 5200,
    open: true,
  },
})
