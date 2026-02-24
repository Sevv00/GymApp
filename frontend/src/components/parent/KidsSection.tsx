import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Plus, User } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import type { Kid } from "@/lib/types"
import { formatDate, formatFullName } from "@/lib/formatting"
import { convertIconToBase64, readFileAsBase64 } from "@/lib/fundraiserUtils"

interface KidsSectionProps {
  initialKids: Kid[]
  onKidsChange: (kids: Kid[]) => void
  onRefresh?: () => Promise<void> | void
}

export function KidsSection({
  initialKids,
  onKidsChange,
  onRefresh,
}: KidsSectionProps) {
  const [kids, setKids] = useState<Kid[]>(initialKids)
  const [showAddKid, setShowAddKid] = useState(false)
  const [newKidFirstName, setNewKidFirstName] = useState("")
  const [newKidLastName, setNewKidLastName] = useState("")
  const [newKidBirthday, setNewKidBirthday] = useState("")
  const [newKidIconBase64, setNewKidIconBase64] = useState<string | null>(null)
  const [editingKid, setEditingKid] = useState<Kid | null>(null)
  const [editingKidIconBase64, setEditingKidIconBase64] = useState<string | null>(null)

  const isValidKidAge = (birthday: string) => {
    const parsed = new Date(birthday)
    if (Number.isNaN(parsed.getTime())) return false
    const now = new Date()
    let years = now.getFullYear() - parsed.getFullYear()
    const monthDiff = now.getMonth() - parsed.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsed.getDate())) {
      years--
    }
    return years >= 3 && years <= 30
  }

  // Sync local state with prop changes
  useEffect(() => {
    setKids(initialKids)
  }, [initialKids])

  const handleAddKid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKidFirstName || !newKidLastName || !newKidBirthday) return
    if (!isValidKidAge(newKidBirthday)) {
      alert("Kid age must be between 3 and 30 years")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/parent/kids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: newKidFirstName,
          last_name: newKidLastName,
          birthday: newKidBirthday,
          icon: newKidIconBase64 || undefined,
        }),
      })
      if (!res.ok) {
        alert("Unable to add kid. Please try again.")
        return
      }

      try {
        const newKid = await res.json()
        const updatedKids = [...kids, newKid]
        setKids(updatedKids)
        onKidsChange(updatedKids)
      } catch {
        // If JSON parsing fails, refresh from server to get the new kid
        if (onRefresh) await onRefresh()
      }

      setShowAddKid(false)
      setNewKidFirstName("")
      setNewKidLastName("")
      setNewKidBirthday("")
      setNewKidIconBase64(null)
    } catch {
      alert("Unable to add kid. Please check your connection and try again.")
    }
  }

  const handleEditKid = async (kid: Kid) => {
    if (!editingKid || !editingKid.Birthday) return
    const normalizedBirthday = editingKid.Birthday.split("T")[0]
    if (!isValidKidAge(normalizedBirthday)) {
      alert("Kid age must be between 3 and 30 years")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/parent/kids/${kid.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: editingKid.FirstName,
          last_name: editingKid.LastName,
          birthday: normalizedBirthday,
          ...(editingKidIconBase64 ? { icon: editingKidIconBase64 } : {}),
        }),
      })
      if (!res.ok) {
        alert("Unable to update kid information. Please try again.")
        return
      }

      // Update the kid in local state with the edited values
      const updatedKids = kids.map((k) =>
        k.ID === kid.ID
          ? {
              ...k,
              FirstName: editingKid.FirstName,
              LastName: editingKid.LastName,
              Birthday: normalizedBirthday,
              Icon: editingKidIconBase64 ?? k.Icon,
            }
          : k,
      )
      setKids(updatedKids)
      onKidsChange(updatedKids)
      setEditingKid(null)
      setEditingKidIconBase64(null)
      if (onRefresh) await onRefresh()
    } catch {
      alert("Unable to update kid information. Please check your connection and try again.")
    }
  }

  const handleDeleteKid = async (kidId: number) => {
    if (!confirm("Are you sure you want to delete this kid?")) return

    try {
      const res = await fetch(`${API_BASE_URL}/parent/kids/${kidId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        alert("Unable to delete kid. Please try again.")
        return
      }
      const updatedKids = kids.filter((k) => k.ID !== kidId)
      setKids(updatedKids)
      onKidsChange(updatedKids)
    } catch {
      alert("Unable to delete kid. Please check your connection and try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kids</CardTitle>
        <CardDescription>Manage your children</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAddKid ? (
          <Button onClick={() => setShowAddKid(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Kid
          </Button>
        ) : (
          <form onSubmit={handleAddKid}>
            <div>
              <label className="text-sm text-muted-foreground">
                First Name
              </label>
              <Input
                value={newKidFirstName}
                onChange={(e) => setNewKidFirstName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <Input
                value={newKidLastName}
                onChange={(e) => setNewKidLastName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Birthday</label>
              <Input
                type="date"
                value={newKidBirthday}
                onChange={(e) => setNewKidBirthday(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="mt-2">
              <label className="text-sm text-muted-foreground">Icon</label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null
                  if (!file) {
                    setNewKidIconBase64(null)
                    return
                  }
                  const b64 = await readFileAsBase64(file)
                  setNewKidIconBase64(b64)
                }}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="flex-1">
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddKid(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <hr />

        {kids.length > 0 ? (
          <ul className="space-y-2">
            {kids.map((kid) => {
              const kidIconSrc = convertIconToBase64(kid.Icon)
              const editingIconSrc = editingKidIconBase64
                ? `data:image/png;base64,${editingKidIconBase64}`
                : kidIconSrc

              return (
              <li
                key={kid.ID}
                className="p-3 border rounded flex justify-between items-center"
              >
                {editingKid?.ID === kid.ID ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                        {editingIconSrc ? (
                          <img
                            src={editingIconSrc}
                            alt="Kid icon"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0] || null
                          if (!file) {
                            setEditingKidIconBase64(null)
                            return
                          }
                          const b64 = await readFileAsBase64(file)
                          setEditingKidIconBase64(b64)
                        }}
                      />
                    </div>
                    <Input
                      value={editingKid.FirstName}
                      onChange={(e) =>
                        setEditingKid({
                          ...editingKid,
                          FirstName: e.target.value,
                        })
                      }
                      placeholder="First Name"
                    />
                    <Input
                      value={editingKid.LastName}
                      onChange={(e) =>
                        setEditingKid({
                          ...editingKid,
                          LastName: e.target.value,
                        })
                      }
                      placeholder="Last Name"
                    />
                    <Input
                      type="date"
                      value={editingKid.Birthday ? editingKid.Birthday.slice(0, 10) : ""}
                      onChange={(e) =>
                        setEditingKid({
                          ...editingKid,
                          Birthday: e.target.value,
                        })
                      }
                      placeholder="Birthday"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEditKid(kid)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingKid(null)
                          setEditingKidIconBase64(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                        {kidIconSrc ? (
                          <img
                            src={kidIconSrc}
                            alt="Kid icon"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span>
                          {formatFullName(kid.FirstName, kid.LastName)}
                        </span>
                        {kid.Birthday && (
                          <span className="text-xs text-muted-foreground">
                            Birthday: {formatDate(kid.Birthday)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingKid(kid)
                          setEditingKidIconBase64(null)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteKid(kid.ID)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            )})}
          </ul>
        ) : (
          <p className="text-muted-foreground">No kids added yet</p>
        )}
      </CardContent>
    </Card>
  )
}
