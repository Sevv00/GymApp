import { useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import { API_BASE_URL } from "@/lib/api"
import type { User, Kid } from "@/lib/types"
import { ProfileSection } from "@/components/parent/ProfileSection"
import { BalanceSection } from "@/components/parent/BalanceSection"
import { JoinClassroomSection } from "@/components/parent/JoinClassroomSection"
import { ClassroomsSection } from "@/components/parent/ClassroomsSection"
import { KidsSection } from "@/components/parent/KidsSection"
import { CreateClassSection } from "@/components/parent/CreateClassSection"

export function Parent() {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kids, setKids] = useState<Kid[]>([])
  const { setIsLoggedIn } = useOutletContext<{
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
  }>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/parent`, {
          credentials: "include",
        })

        if (response.ok) {
          const result = await response.json()
          setData(result)
          setKids(result.Kids || [])
        } else {
          setIsLoggedIn(false)
          setError("Failed to fetch parent data: " + response.statusText)
        }
      } catch {
        setError(
          "Error fetching data: Unable to load your information. Please refresh the page.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setIsLoggedIn])

  const refresh = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent`, {
        credentials: "include",
      })
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setKids(result.Kids || [])
      }
    } catch {
      // silent refresh failure
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-destructive">Error: {error}</div>
  if (!data) return <div className="p-8">No data available</div>

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL */}
        <div className="space-y-6">
          <ProfileSection
            initialFirstName={data.FirstName}
            initialLastName={data.LastName}
            initialEmail={data.Email}
          />
          <BalanceSection
            balance={data.BankAccount.Balance}
            onRefresh={refresh}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          <JoinClassroomSection />
          <ClassroomsSection classrooms={data.ClassRooms} userId={data.ID} />
          <KidsSection
            initialKids={kids}
            onKidsChange={setKids}
            onRefresh={refresh}
          />
          <CreateClassSection onSuccess={refresh} />
        </div>
      </div>
    </div>
  )
}
