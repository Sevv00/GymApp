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
import { useNavigate } from "react-router"
import { useState } from "react"

interface CreateClassSectionProps {
  onSuccess?: () => void
}

export function CreateClassSection({ onSuccess }: CreateClassSectionProps) {
  const navigate = useNavigate()
  const [name, setName] = useState("")

  const handleCreateClass = async () => {
    if (!name.trim()) {
      alert("Please enter a classroom name")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/classes`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        alert("Unable to create classroom. Please try again.")
        return
      }
      const classroom = await res.json()
      onSuccess?.()
      navigate(`/classes/${classroom.ID}`)
    } catch {
      alert(
        "Unable to create classroom. Please check your connection and try again.",
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Class</CardTitle>
        <CardDescription>Become a treasurer for a new class</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter classroom name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateClass()}
        />
        <Button onClick={handleCreateClass} className="w-full">
          Create new Class and become it's treasurer
        </Button>
      </CardContent>
    </Card>
  )
}
