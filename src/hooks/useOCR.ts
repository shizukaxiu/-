import { useState, useCallback } from 'react'
import { recognizeInvoice } from '../services/ocr'
import type { Invoice } from '../types'

export function useOCR() {
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recognize = useCallback(async (file: File) => {
    setIsRecognizing(true)
    setError(null)
    try {
      const url = URL.createObjectURL(file)
      const result = await recognizeInvoice(url)
      setInvoice(result)
      URL.revokeObjectURL(url)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : '识别失败'
      setError(msg)
      return null
    } finally {
      setIsRecognizing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setInvoice(null)
    setError(null)
  }, [])

  return { recognize, isRecognizing, invoice, error, reset }
}
