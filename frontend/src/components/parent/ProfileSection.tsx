import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

interface ProfileSectionProps {
  initialFirstName: string
  initialLastName: string
  initialEmail: string
}

export function ProfileSection({
  initialFirstName,
  initialLastName,
  initialEmail,
}: ProfileSectionProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(initialEmail)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/parent`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
      })
      if (!res.ok) {
        setFirstName(initialFirstName)
        setLastName(initialLastName)
        setEmail(initialEmail)
        alert("Unable to update profile. Please try again.")
        return
      }
      setIsEditingProfile(false)
    } catch {
      setFirstName(initialFirstName)
      setLastName(initialLastName)
      setEmail(initialEmail)
      alert("Unable to update profile. Please check your connection and try again.")
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/parent/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
          repeat_new_password: confirmPassword,
        }),
      })
      if (!res.ok) {
        alert("Unable to change password. Please verify your current password and try again.")
        return
      }
      setShowPasswordForm(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      alert("Unable to change password. Please check your connection and try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile}>
            <div>
              <label className="text-sm text-muted-foreground">
                First Name
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Save</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFirstName(initialFirstName)
                  setLastName(initialLastName)
                  setEmail(initialEmail)
                  setIsEditingProfile(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-semibold">{firstName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-semibold">{lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{email}</p>
            </div>
            <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </>
        )}

        <hr className="my-4" />

        {!showPasswordForm ? (
          <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
            Change Password
          </Button>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div>
              <label className="text-sm text-muted-foreground">
                Old Password
              </label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Change Password</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOldPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setShowPasswordForm(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
