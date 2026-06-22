export interface AdminFileInfo {
  fileName: string
  size: number
  updatedAt: string
  chunkCount: number
}

export interface AdminFilesResponse {
  files: AdminFileInfo[]
  totalFiles: number
  totalChunks: number
  builtAt: string | null
}

export interface RebuildStatusResponse {
  status: 'idle' | 'running' | 'success' | 'error'
  progress: number
  message: string
  error?: string
}

export async function fetchFiles(): Promise<AdminFilesResponse> {
  const res = await fetch('/api/admin/files')
  const data = (await res.json()) as AdminFilesResponse & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || '获取文件列表失败')
  }
  return data
}

export async function uploadFile(file: File): Promise<{ success: boolean; fileName: string; size: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const contentBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentBase64 }),
  })

  const data = (await res.json()) as { success: boolean; fileName: string; size: number; error?: string }
  if (!res.ok) {
    throw new Error(data.error || '上传失败')
  }
  return data
}

export async function triggerRebuild(): Promise<{ success: boolean; status: string }> {
  const res = await fetch('/api/admin/rebuild', { method: 'POST' })
  const data = (await res.json()) as { success: boolean; status: string; error?: string }
  if (!res.ok) {
    throw new Error(data.error || '重建失败')
  }
  return data
}

export async function fetchRebuildStatus(): Promise<RebuildStatusResponse> {
  const res = await fetch('/api/admin/rebuild-status')
  const data = (await res.json()) as RebuildStatusResponse & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || '获取重建状态失败')
  }
  return data
}
