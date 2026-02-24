import { useState, useCallback } from "react"
import { API_BASE_URL } from "./api"

interface FetchOptions extends Omit<RequestInit, "credentials" | "headers"> {
  headers?: Record<string, string>
}

export function useFetch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(
    async <T,>(
      endpoint: string,
      options: FetchOptions = {},
    ): Promise<{ data: T | null; ok: boolean; error: string | null }> => {
      setLoading(true)
      setError(null)

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...options.headers,
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          credentials: "include",
          headers,
        })

        if (!response.ok) {
          let errorMessage = "An error occurred"
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || response.statusText
          } catch {
            try {
              errorMessage = await response.text()
            } catch {
              errorMessage = response.statusText
            }
          }

          setError(errorMessage)
          return { data: null, ok: false, error: errorMessage }
        }

        const data = await response.json()
        return { data, ok: true, error: null }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred"
        setError(errorMessage)
        return { data: null, ok: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { request, loading, error, setError }
}
