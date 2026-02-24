import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/api"
import type { User } from "@/lib/types"

interface UseCurrentUserResult {
  user: User | null
  loading: boolean
  error: string | null
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/parent`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data)
          setError(null)
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}
