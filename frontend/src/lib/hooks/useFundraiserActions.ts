import { useCallback } from "react"
import { API_BASE_URL } from "@/lib/api"

export function useFundraiserActions() {
  const deleteFundraiser = useCallback(async (fundraiserId: number) => {
    const response = await fetch(`${API_BASE_URL}/fundraisers/${fundraiserId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || "Cannot delete fundraiser")
    }
  }, [])

  return { deleteFundraiser }
}
