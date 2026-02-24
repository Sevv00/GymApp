import { useState, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { formatFullName } from "@/lib/formatting"
import { useClassroom, useCurrentUser, useClassroomActions } from "@/lib/hooks"
import { ClassroomHeader } from "@/components/classroom/ClassroomHeader"
import { ClassroomInfo } from "@/components/classroom/ClassroomInfo"
import { ParentsAndKidsCard } from "@/components/classroom/ParentsAndKidsCard"
import { FundraisersSection } from "@/components/classroom/FundraisersSection"
import { ReportsSection } from "@/components/classroom/ReportsSection"

export function ClassRoom() {
  const { class_id } = useParams<{ class_id: string }>()
  const navigate = useNavigate()

  // Data fetching
  const { classroom, loading, error, refresh } = useClassroom(class_id)
  const { user: currentUser } = useCurrentUser()
  const { updateName, rerollInviteCode, deleteClassroom } =
    useClassroomActions()

  // Local state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")

  // Computed values
  const treasurer = useMemo(
    () =>
      classroom?.Parents?.find((parent) => parent.ID === classroom.TreasurerID),
    [classroom],
  )

  const treasurerName = useMemo(
    () =>
      treasurer
        ? formatFullName(treasurer.FirstName, treasurer.LastName)
        : null,
    [treasurer],
  )

  const isTreasurer = useMemo(
    () => currentUser !== null && currentUser.ID === classroom?.TreasurerID,
    [currentUser, classroom?.TreasurerID],
  )

  const isAdmin = useMemo(
    () => currentUser !== null && currentUser.Role === "admin",
    [currentUser],
  )

  const canViewInviteCode = useMemo(
    () => isTreasurer || isAdmin,
    [isTreasurer, isAdmin],
  )

  // Event handlers
  const handleEditNameClick = useCallback(() => {
    setEditedName(classroom?.Name || "")
    setIsEditingName(true)
  }, [classroom?.Name])

  const handleCancelEdit = useCallback(() => {
    setIsEditingName(false)
    setEditedName("")
  }, [])

  const handleSaveName = useCallback(async () => {
    if (!class_id || !editedName.trim()) return

    try {
      await updateName({ classId: parseInt(class_id), name: editedName })
      await refresh()
      setIsEditingName(false)
    } catch {
      alert("Unable to update classroom name. Please try again.")
    }
  }, [class_id, editedName, updateName, refresh])

  const handleRerollInviteCode = useCallback(async () => {
    if (!class_id) return

    try {
      await rerollInviteCode({ classId: parseInt(class_id) })
      await refresh()
    } catch {
      alert("Unable to regenerate invite code. Please try again.")
    }
  }, [class_id, rerollInviteCode, refresh])

  const handleDeleteClassroom = useCallback(async () => {
    if (!class_id) return

    if (
      !confirm(
        "Are you sure you want to delete this classroom? This action cannot be undone.",
      )
    ) {
      return
    }

    try {
      await deleteClassroom({ classId: parseInt(class_id) })
      navigate("/")
    } catch {
      alert("Unable to delete classroom. Please try again.")
    }
  }, [class_id, deleteClassroom, navigate])

  if (loading) return <div className="p-8">Loading classroom...</div>
  if (error || !classroom)
    return <div className="p-8 text-destructive">Error: {error || "Not found"}</div>

  return (
    <div className="p-8">
      <ClassroomHeader
        name={classroom.Name}
        classroomId={classroom.ID}
        isTreasurer={isTreasurer}
        hasFundraisers={(classroom.Fundraisers?.length || 0) > 0}
        isEditingName={isEditingName}
        editedName={editedName}
        treasurerName={treasurerName}
        onEditNameClick={handleEditNameClick}
        onCancelEdit={handleCancelEdit}
        onSaveName={handleSaveName}
        onEditedNameChange={setEditedName}
        onDeleteClassroom={handleDeleteClassroom}
        onBackClick={() => navigate("/")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ClassroomInfo
            inviteCode={classroom.InviteCode}
            createdAt={classroom.CreatedAt}
            canManageInviteCode={canViewInviteCode}
            onRerollInviteCode={handleRerollInviteCode}
          />
          <ReportsSection classId={classroom.ID} kids={classroom.Kids} />
          <ParentsAndKidsCard
            classroom={classroom}
            currentUser={currentUser}
            isTreasurer={isTreasurer}
            onRefresh={refresh}
          />
        </div>

        <div>
          <FundraisersSection
            fundraisers={classroom.Fundraisers}
            classId={classroom.ID}
            isTreasurer={isTreasurer}
          />
        </div>
      </div>
    </div>
  )
}
