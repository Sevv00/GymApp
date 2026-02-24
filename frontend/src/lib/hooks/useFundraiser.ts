import { useCallback, useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/api"
import type { Fundraiser as FundraiserType } from "@/lib/types"

interface UseFundraiserResult {
  fundraiser: FundraiserType | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useFundraiser(fundraiserId?: string): UseFundraiserResult {
  const [fundraiser, setFundraiser] = useState<FundraiserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFundraiser = useCallback(async (showLoading = true) => {
    if (!fundraiserId) {
      setError("No fundraiser ID provided")
      setLoading(false)
      return
    }

    if (showLoading) setLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to load fundraiser")
      }

      const data = await response.json()
      setFundraiser(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load fundraiser",
      )
      setFundraiser(null)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [fundraiserId])

  useEffect(() => {
    fetchFundraiser(true)
  }, [fetchFundraiser])

  const refresh = useCallback(() => fetchFundraiser(false), [fetchFundraiser])

  return { fundraiser, loading, error, refresh }
}
