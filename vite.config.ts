import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ServerResponse } from 'node:http'
import { searchWithIndex } from './src/services/searchIndex'
import { buildKnowledgeBase } from './src/services/kbBuilder'
import type { SearchIndex } from './src/types/kb'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INDEX_PATH = path.resolve(__dirname, './src/kb/nanjing-kb-index.json')
const RAW_DIR = path.resolve(__dirname, './raw-policies')
const KB_DIR = path.resolve(__dirname, './src/kb')

// 本地演示账号
const VALID_CREDENTIALS: Record<string, { password: string; role: 'user' | 'admin' }> = {
  '111': { password: '111', role: 'user' },
  '222': { password: '222', role: 'admin' },
}

type RebuildStatus =
  | { status: 'idle'; progress: 0; message: string }
  | { status: 'running'; progress: number; message: string }
  | { status: 'success'; progress: 100; message: string }
  | { status: 'error'; progress: number; message: string; error: string }

let rebuildStatus: RebuildStatus = { status: 'idle', progress: 0, message: '等待重建' }

async function readJsonBody(req: { [Symbol.asyncIterator](): AsyncIterableIterator<Buffer> }): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString()
  return text ? (JSON.parse(text) as unknown) : {}
}

async function sendJson(res: ServerResponse, data: unknown, statusCode = 200) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

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

        function invalidateIndexCache() {
          cachedIndex = null
        }

        // 知识库检索接口（已有）
        server.middlewares.use('/api/search', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          try {
            const body = (await readJsonBody(req)) as { query?: string; limit?: number; threshold?: number }
            const { query, limit = 5, threshold = 0.02 } = body

            if (!query) {
              await sendJson(res, { error: '缺少 query 参数' }, 400)
              return
            }

            const index = await loadIndex()
            if (!index) {
              await sendJson(
                res,
                { error: '知识库索引尚未构建，请先运行 npm run build-kb', results: [] },
                503
              )
              return
            }

            const results = await searchWithIndex(query, index, limit, threshold)
            await sendJson(res, { results })
          } catch (err) {
            console.error('知识库检索失败:', err)
            await sendJson(
              res,
              {
                error: err instanceof Error ? err.message : '检索失败',
                results: [],
              },
              500
            )
          }
        })

        // 管理员登录
        server.middlewares.use('/api/admin/login', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          try {
            const body = (await readJsonBody(req)) as { username?: string; password?: string }
            const { username, password } = body
            const credential = username ? VALID_CREDENTIALS[username] : undefined

            if (!credential || credential.password !== password) {
              await sendJson(res, { error: '用户名或密码错误' }, 401)
              return
            }

            await sendJson(res, { username, role: credential.role })
          } catch (err) {
            await sendJson(res, { error: err instanceof Error ? err.message : '登录失败' }, 500)
          }
        })

        // 已收录文件列表
        server.middlewares.use('/api/admin/files', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          try {
            const files = await fs.readdir(RAW_DIR)
            const supportedFiles = files.filter(
              (f) => /\.(pdf|docx?|txt|md)$/i.test(f) && !/^README/i.test(f)
            )

            const index = await loadIndex().catch(() => null)
            const sourceCounts: Record<string, number> = {}
            if (index) {
              for (const doc of index.documents) {
                const source = doc.source || '未知来源'
                sourceCounts[source] = (sourceCounts[source] || 0) + 1
              }
            }

            const fileInfos = await Promise.all(
              supportedFiles.map(async (fileName) => {
                const filePath = path.join(RAW_DIR, fileName)
                const stat = await fs.stat(filePath)
                const source = fileName
                return {
                  fileName,
                  size: stat.size,
                  updatedAt: stat.mtime.toISOString(),
                  chunkCount: sourceCounts[source] || 0,
                }
              })
            )

            await sendJson(res, {
              files: fileInfos,
              totalFiles: fileInfos.length,
              totalChunks: index?.documents.length || 0,
              builtAt: index?.builtAt || null,
            })
          } catch (err) {
            await sendJson(res, { error: err instanceof Error ? err.message : '获取文件列表失败' }, 500)
          }
        })

        // 上传文件（base64 JSON）
        server.middlewares.use('/api/admin/upload', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          try {
            const body = (await readJsonBody(req)) as {
              fileName?: string
              contentBase64?: string
            }
            const { fileName, contentBase64 } = body

            if (!fileName || !contentBase64) {
              await sendJson(res, { error: '缺少 fileName 或 contentBase64' }, 400)
              return
            }

            const sanitizedName = path.basename(fileName).replace(/[^\w\-.\u4e00-\u9fa5]/g, '_')
            if (!/\.(pdf|docx?|txt|md)$/i.test(sanitizedName)) {
              await sendJson(res, { error: '仅支持 PDF、DOC、DOCX、TXT、MD 文件' }, 400)
              return
            }

            await fs.mkdir(RAW_DIR, { recursive: true })
            const filePath = path.join(RAW_DIR, sanitizedName)
            const buffer = Buffer.from(contentBase64, 'base64')
            await fs.writeFile(filePath, buffer)

            await sendJson(res, { success: true, fileName: sanitizedName, size: buffer.length })
          } catch (err) {
            await sendJson(res, { error: err instanceof Error ? err.message : '上传失败' }, 500)
          }
        })

        // 触发知识库重建
        server.middlewares.use('/api/admin/rebuild', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          if (rebuildStatus.status === 'running') {
            await sendJson(res, { error: '知识库正在重建中' }, 409)
            return
          }

          rebuildStatus = { status: 'running', progress: 0, message: '开始重建...' }

          // 异步执行，立即响应
          ;(async () => {
            try {
              await buildKnowledgeBase({
                rawDir: RAW_DIR,
                kbDir: KB_DIR,
                onProgress: async (message, percent) => {
                  rebuildStatus = { status: 'running', progress: percent, message }
                },
              })
              invalidateIndexCache()
              rebuildStatus = { status: 'success', progress: 100, message: '重建完成' }
            } catch (err) {
              rebuildStatus = {
                status: 'error',
                progress: 0,
                message: '重建失败',
                error: err instanceof Error ? err.message : String(err),
              }
            }
          })()

          await sendJson(res, { success: true, status: rebuildStatus.status })
        })

        // 查询重建状态
        server.middlewares.use('/api/admin/rebuild-status', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          await sendJson(res, rebuildStatus)
        })
      },
    },
  ],
  server: {
    port: 5200,
    open: true,
  },
})
