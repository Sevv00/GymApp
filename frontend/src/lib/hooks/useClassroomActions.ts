import { useCallback } from "react"
import { API_BASE_URL } from "@/lib/api"

interface UpdateClassroomNameParams {
  classId: number
  name: string
}

interface RerollInviteCodeParams {
  classId: number
}

interface DeleteClassroomParams {
  classId: number
}

export function useClassroomActions() {
  const updateName = useCallback(async ({ classId, name }: UpdateClassroomNameParams) => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error("Unable to update classroom name")
    }
  }, [])

  const rerollInviteCode = useCallback(async ({ classId }: RerollInviteCodeParams) => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/reroll-invite-code`, {
      method: "PUT",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Unable to regenerate invite code")
    }
  }, [])

  const deleteClassroom = useCallback(async ({ classId }: DeleteClassroomParams) => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Unable to delete classroom")
    }
  }, [])

  return { updateName, rerollInviteCode, deleteClassroom }
}
