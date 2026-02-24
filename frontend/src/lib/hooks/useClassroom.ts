import { useEffect, useState, useCallback } from "react"
import { API_BASE_URL } from "@/lib/api"
import type { Classroom } from "@/lib/types"

interface UseClassroomResult {
  classroom: Classroom | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useClassroom(classId?: string): UseClassroomResult {
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClassroom = useCallback(async () => {
    if (!classId) {
      setError("No classroom ID provided")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch classroom")
      }

      const data = await response.json()
      setClassroom(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load classroom")
      setClassroom(null)
    } finally {
      setLoading(false)
    }
  }, [classId])

  const refresh = useCallback(async () => {
    if (!classId) return
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setClassroom(data)
      }
    } catch {
      // Silent refresh failure
    }
  }, [classId])

  useEffect(() => {
    fetchClassroom()
  }, [fetchClassroom])

  return { classroom, loading, error, refresh }
}
