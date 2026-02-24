import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router"
import { API_BASE_URL } from "@/lib/api"

export function Register() {
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      firstname: formData.get("firstname"),
      lastname: formData.get("lastname"),
      email: formData.get("email"),
      password: formData.get("password"),
      repeat_password: formData.get("repeat_password"),
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })

      if (response.ok) {
        navigate("/login")
      } else {
        const data = await response.json().catch(() => null)
        const message = data?.error || "Registration failed. Please try again."
        alert(message)
      }
    } catch (error) {
      alert(
        "Error during registration: " +
          (error instanceof Error ? error.message : String(error)),
      )
    }
  }

  return (
    <div className="flex flex-col justify-self-center gap-2 mt-8 items-center">
      <h1 className="text-2xl">Register to School-Money as Parent</h1>
      <form className="flex flex-col gap-2 min-w-sm" onSubmit={handleSubmit}>
        <Input type="text" placeholder="First Name" name="firstname" required />
        <Input type="text" placeholder="Last Name" name="lastname" required />
        <Input type="email" placeholder="Email" name="email" required />
        <Input
          type="password"
          placeholder="Password"
          name="password"
          required
        />
        <Input
          type="password"
          placeholder="Repeat Password"
          name="repeat_password"
          required
        />
        <Button type="submit">Register</Button>
      </form>
      <h2 className="text-muted-foreground mt-6">
        Already have account?{" "}
        <Link to="/login" className="underline">
          Login here
        </Link>
      </h2>
    </div>
  )
}
