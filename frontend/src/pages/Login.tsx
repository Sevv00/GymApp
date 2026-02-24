import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate, useOutletContext } from "react-router"
import { API_BASE_URL } from "@/lib/api"

export function Login() {
  const navigate = useNavigate()
  const { setIsLoggedIn } = useOutletContext<{
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
  }>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })

      if (response.ok) {
        setIsLoggedIn(true)
        navigate("/")
      } else {
        const data = await response.json().catch(() => null)
        const message = data?.error || "Login failed. Please try again."
        alert(message)
      }
    } catch (error) {
      alert(
        "Error during login: " +
          (error instanceof Error ? error.message : String(error)),
      )
    }
  }

  return (
    <div className="flex flex-col justify-self-center gap-2 mt-8 items-center">
      <h1 className="text-2xl">Login to School-Money as Parent</h1>
      <form className="flex flex-col gap-2 min-w-sm" onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" name="email" required />
        <Input
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        <Button type="submit">Login</Button>
      </form>
      <h2 className="text-muted-foreground mt-6">
        Don't have account?{" "}
        <Link to="/register" className="underline">
          Register here
        </Link>
      </h2>
    </div>
  )
}
