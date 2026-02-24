import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { Button } from "./components/ui/button"
import { LogOut } from "lucide-react"
import { API_BASE_URL } from "./lib/api"
import type { User } from "./lib/types"

export function Layout() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/parent`, {
          credentials: "include",
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      } catch {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setIsLoggedIn(false)
        navigate("/login")
      } else {
        alert("Logout failed")
      }
    } catch (error) {
      alert(
        "Error during logout: " +
          (error instanceof Error ? error.message : String(error)),
      )
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen">
      <div className="flex gap-4 border-b p-2 justify-between">
        <h1 className="text-2xl font-semibold text-primary">School-Money</h1>
        {isLoggedIn && user && (
          <section className="flex gap-2 items-center">
            <button
              className="text-sm font-medium hover:text-primary cursor-pointer"
              onClick={() => navigate("/")}
            >
              {user.FirstName} {user.LastName}
            </button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut />
            </Button>
          </section>
        )}
      </div>
      <div className="max-w-7xl mx-auto">
        <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
      </div>
    </div>
  )
}
