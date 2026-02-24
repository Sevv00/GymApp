import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_BASE_URL } from "@/lib/api"

export function JoinClassroomSection() {
  const navigate = useNavigate()
  const [classroomCode, setClassroomCode] = useState("")

  const handleJoinClassroom = async () => {
    if (!classroomCode.trim()) {
      alert("Please enter a classroom code")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/classes/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invite_code: classroomCode }),
      })
      if (!res.ok) {
        try {
          const errorData = await res.json()
          alert(
            errorData.error || "Unable to join classroom. Please try again.",
          )
        } catch {
          alert("Unable to join classroom. Please try again.")
        }
        return
      }
      // Success - get the classroom ID and navigate
      const data = await res.json()
      console.log("Join response:", data)
      setClassroomCode("")
      if (data.classroom_id) {
        navigate(`/classes/${data.classroom_id}`)
      } else {
        alert("Joined successfully, but could not navigate. Please refresh the page.")
      }
    } catch {
      alert(
        "Unable to join classroom. Please check your connection and try again.",
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Classroom</CardTitle>
        <CardDescription>Enter classroom invite code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Classroom invite code"
            value={classroomCode}
            onChange={(e) => setClassroomCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinClassroom()}
          />
          <Button onClick={handleJoinClassroom}>Join</Button>
        </div>
      </CardContent>
    </Card>
  )
}
