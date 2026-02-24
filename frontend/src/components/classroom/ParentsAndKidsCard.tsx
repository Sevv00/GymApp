import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Classroom, User, Kid } from "@/lib/types"
import { API_BASE_URL } from "@/lib/api"
import { useState } from "react"
import { User as UserIcon } from "lucide-react"
import { convertIconToBase64 } from "@/lib/fundraiserUtils"

interface ParentsAndKidsCardProps {
  classroom: Classroom
  currentUser: User | null
  isTreasurer: boolean
  onRefresh: () => Promise<void>
}

export function ParentsAndKidsCard({
  classroom,
  currentUser,
  isTreasurer,
  onRefresh,
}: ParentsAndKidsCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [removingKidId, setRemovingKidId] = useState<number | null>(null)
  const [removingParentId, setRemovingParentId] = useState<number | null>(null)

  const parents = classroom.Parents || []

  // Sort parents: current user first, then alphabetically
  const sortedParents = [...parents].sort((a, b) => {
    if (currentUser && a.ID === currentUser.ID) return -1
    if (currentUser && b.ID === currentUser.ID) return 1
    return `${a.FirstName} ${a.LastName}`.localeCompare(
      `${b.FirstName} ${b.LastName}`,
    )
  })

  // Get user's kids that are not in this classroom
  const availableKids: Kid[] =
    currentUser?.Kids.filter(
      (kid) => !classroom.Kids?.some((classKid) => classKid.ID === kid.ID),
    ) || []

  const handleAddKid = async (kidId: number) => {
    setIsAdding(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/classes/${classroom.ID}/kid/${kidId}`,
        {
          method: "POST",
          credentials: "include",
        },
      )

      if (!response.ok) {
        alert("Failed to add kid to classroom")
        return
      }

      await onRefresh()
    } catch {
      alert("Failed to add kid. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveKid = async (kidId: number) => {
    if (!confirm("Are you sure you want to remove this kid from the classroom?"))
      return

    setRemovingKidId(kidId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/classes/${classroom.ID}/kid/${kidId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      )

      if (!response.ok) {
        alert("Failed to remove kid from classroom")
        return
      }

      await onRefresh()
    } catch {
      alert("Failed to remove kid. Please try again.")
    } finally {
      setRemovingKidId(null)
    }
  }

  const handleRemoveParent = async (parentId: number) => {
    if (
      !confirm(
        "Are you sure you want to remove this parent from the classroom? This will also remove all their kids.",
      )
    )
      return

    setRemovingParentId(parentId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/classes/${classroom.ID}/parent/${parentId}`,
        {
          method: "PUT",
          credentials: "include",
        },
      )

      if (!response.ok) {
        alert("Failed to remove parent from classroom")
        return
      }

      await onRefresh()
    } catch {
      alert("Failed to remove parent. Please try again.")
    } finally {
      setRemovingParentId(null)
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Parents & Kids</CardTitle>
        <CardDescription>
          {parents.length} {parents.length === 1 ? "parent" : "parents"} with
          their kids
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-100 overflow-y-auto">
        {sortedParents.length > 0 ? (
          <div className="space-y-3">
            {sortedParents.map((parent) => {
              const isCurrentUser = currentUser && parent.ID === currentUser.ID
              const parentKids = classroom.Kids?.filter(
                (kid) => kid.ParentID === parent.ID,
              )

              return (
                <div
                  key={parent.ID}
                  className={`p-3 rounded border ${
                    isCurrentUser
                      ? "bg-primary/10 border-primary/20"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrentUser ? "text-primary" : "font-medium"
                      }`}
                    >
                      {parent.FirstName} {parent.LastName}
                      {isCurrentUser && (
                        <span className="text-xs ml-2 font-normal text-muted-foreground">
                          (You)
                        </span>
                      )}
                      {parent.ID === classroom.TreasurerID && (
                        <span className="text-xs ml-2 font-normal text-muted-foreground">
                          (Treasurer)
                        </span>
                      )}
                    </p>
                    {isTreasurer &&
                      !isCurrentUser &&
                      parent.ID !== classroom.TreasurerID && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleRemoveParent(parent.ID)}
                          disabled={removingParentId === parent.ID}
                        >
                          {removingParentId === parent.ID
                            ? "..."
                            : "Remove Parent"}
                        </Button>
                      )}
                  </div>

                  {/* Kids for this parent */}
                  {parentKids && parentKids.length > 0 ? (
                    <ul className="mt-2 ml-3 space-y-1 border-l-2 border-border pl-3">
                      {parentKids.map((kid) => {
                        const kidIconSrc = convertIconToBase64(kid.Icon)
                        return (
                        <li
                          key={kid.ID}
                          className="text-xs text-muted-foreground flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-8 w-8 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                              {kidIconSrc ? (
                                <img
                                  src={kidIconSrc}
                                  alt="Kid icon"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserIcon className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                            {kid.FirstName} {kid.LastName}
                          </span>
                          {isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleRemoveKid(kid.ID)}
                              disabled={removingKidId === kid.ID}
                            >
                              {removingKidId === kid.ID ? "..." : "Remove"}
                            </Button>
                          )}
                        </li>
                      )})}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2 ml-3">
                      No kids in this classroom
                    </p>
                  )}

                  {/* Add kid button for current user */}
                  {isCurrentUser && availableKids.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Add your kids:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {availableKids.map((kid) => (
                          <Button
                            key={kid.ID}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleAddKid(kid.ID)}
                            disabled={isAdding}
                          >
                            + {kid.FirstName} {kid.LastName}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No parents yet</p>
        )}
      </CardContent>
    </Card>
  )
}
