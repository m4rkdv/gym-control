import { useState } from 'react'
import { useApi } from '../contexts/api-context'

// TRes: response type, TBody: request payload type (defaults to unknown)
export function useApiCall<TRes, TBody = unknown>() {
  const { get, post } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeGet = async (endpoint: string): Promise<TRes | null> => {
    return execute(() => get<TRes>(endpoint))
  }

  const executePost = async (endpoint: string, data?: TBody): Promise<TRes | null> => {
    return execute(() => post<TRes>(endpoint, data as TBody))
  }

  const execute = async (apiCall: () => Promise<TRes>): Promise<TRes | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    executeGet,
    executePost,
    loading,
    error,
    setError,
  }
}