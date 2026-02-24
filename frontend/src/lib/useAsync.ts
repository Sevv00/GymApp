import { useCallback, useEffect, useRef, useState } from "react"

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncOptions {
  immediate?: boolean
}

/**
 * Generic hook for handling async operations with loading/error/data state
 * @template T The type of data returned by the async function
 * @param asyncFn The async function to execute
 * @param options Configuration options
 * @returns Current state and refetch function
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions = {},
): UseAsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { immediate = true } = options
  const isMountedRef = useRef(true)

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return

    setState({ data: null, loading: true, error: null })

    try {
      const result = await asyncFn()
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null })
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred"
        setState({ data: null, loading: false, error: errorMessage })
      }
    }
  }, [asyncFn])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (immediate) {
      // Call execute in an async IIFE to avoid direct setState in effect
      ;(async () => {
        await execute()
      })()
    }
  }, [immediate, execute])

  return {
    ...state,
    refetch: execute,
  }
}
