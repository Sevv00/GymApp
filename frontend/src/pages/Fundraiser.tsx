import { useState, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import {
  useFundraiser,
  useCurrentUser,
  useFundraiserActions,
  useClassroom,
} from "@/lib/hooks"
import { convertIconToBase64 } from "@/lib/fundraiserUtils"
import { API_BASE_URL } from "@/lib/api"
import { FundraiserHeader } from "@/components/fundraiser/FundraiserHeader"
import { FundraiserInfo } from "@/components/fundraiser/FundraiserInfo"
import { KidsSection } from "@/components/fundraiser/KidsSection"
import { MoneyTransfersSection } from "@/components/fundraiser/MoneyTransfersSection"
import { TreasurerActionsSection } from "@/components/fundraiser/TreasurerActionsSection"
import { ReceiptsSection } from "@/components/fundraiser/ReceiptsSection"

export function Fundraiser() {
  const { fundraiser_id } = useParams<{ fundraiser_id: string }>()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [payingKidId, setPayingKidId] = useState<number | null>(null)
  const [refundingKidId, setRefundingKidId] = useState<number | null>(null)

  // Data fetching
  const { fundraiser, loading, error, refresh } = useFundraiser(fundraiser_id)
  const { classroom } = useClassroom(fundraiser?.class_room_id?.toString())
  const { user } = useCurrentUser()
  const { deleteFundraiser } = useFundraiserActions()

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    perKidPaymentAmount: "",
    iconFile: null as File | null,
  })

  // Initialize edit form when fundraiser loads
  useMemo(() => {
    if (fundraiser && isEditing) {
      setEditForm({
        title: fundraiser.title,
        description: fundraiser.description || "",
        startDate: fundraiser.start_date?.split("T")[0] || "",
        dueDate: fundraiser.due_date?.split("T")[0] || "",
        perKidPaymentAmount: fundraiser.per_kid_payment_amount.toString(),
        iconFile: null,
      })
    }
  }, [fundraiser, isEditing])

  // Computed values
  const canEdit = useMemo(() => {
    if (!fundraiser || !user) return false
    if (user.Role === "admin") return true
    return (
      user.ClassRoomsWhereTreasurer?.some(
        (c) => c.ID === fundraiser.class_room_id,
      ) ?? false
    )
  }, [fundraiser, user])

  const canDelete = useMemo(() => {
    if (!fundraiser || !user) return false
    if (user.Role === "admin") return true
    return (
      user.ClassRoomsWhereTreasurer?.some(
        (c) => c.ID === fundraiser.class_room_id,
      ) ?? false
    )
  }, [fundraiser, user])

  const isTreasurer = useMemo(() => {
    if (!fundraiser || !user) return false
    return (
      user.ClassRoomsWhereTreasurer?.some(
        (c) => c.ID === fundraiser.class_room_id,
      ) ?? false
    )
  }, [fundraiser, user])

  const isAdmin = useMemo(() => user?.Role === "admin", [user?.Role])

  const canManageFunds = useMemo(
    () => isTreasurer || isAdmin,
    [isTreasurer, isAdmin],
  )

  const iconSrc = useMemo(
    () => convertIconToBase64(fundraiser?.icon ?? null),
    [fundraiser?.icon],
  )

  // Sort kids: user's kids first, then others
  const sortedKids = useMemo(() => {
    if (!fundraiser?.kids || !user?.Kids) return fundraiser?.kids || []

    const userKidIds = new Set(user.Kids.map((k) => k.ID))
    const sorted = [...fundraiser.kids].sort((a, b) => {
      const aIsUserKid = userKidIds.has(a.id)
      const bIsUserKid = userKidIds.has(b.id)

      if (aIsUserKid && !bIsUserKid) return -1
      if (!aIsUserKid && bIsUserKid) return 1
      return 0
    })

    return sorted
  }, [fundraiser?.kids, user?.Kids])

  const totalMoneyRaised = useMemo(() => {
    if (!fundraiser?.money_transfers) return 0
    const fundraiserAccountId = fundraiser.bank_account?.ID
    return fundraiser.money_transfers.reduce((sum, transfer) => {
      if (transfer.KidID === null) return sum
      if (!fundraiserAccountId) return sum
      if (transfer.ToBankAccountID === fundraiserAccountId) {
        return sum + (transfer.Amount || 0)
      }
      if (transfer.FromBankAccountID === fundraiserAccountId) {
        return sum - (transfer.Amount || 0)
      }
      return sum
    }, 0)
  }, [fundraiser?.money_transfers, fundraiser?.bank_account?.ID])

  const accountBalance = useMemo(
    () => fundraiser?.bank_account?.Balance ?? 0,
    [fundraiser?.bank_account?.Balance],
  )

  const isClosed = useMemo(() => {
    if (!fundraiser?.due_date) return false
    const due = new Date(fundraiser.due_date)
    if (Number.isNaN(due.getTime())) return false
    const today = new Date()
    const normalizedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
    const normalizedDue = new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate(),
    )
    return normalizedDue < normalizedToday
  }, [fundraiser?.due_date])

  const canCancelFundraiser = useMemo(() => {
    if (!fundraiser) return false
    if (fundraiser.is_blocked) return false
    return totalMoneyRaised === accountBalance
  }, [fundraiser, totalMoneyRaised, accountBalance])

  // Event handlers
  const handleDelete = useCallback(async () => {
    if (!fundraiser) return
    if (
      !confirm(
        "Delete fundraiser? This is only allowed with no money transfers.",
      )
    )
      return

    setDeleting(true)
    try {
      await deleteFundraiser(fundraiser.id)
      navigate(`/classes/${fundraiser.class_room_id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cannot delete fundraiser")
    } finally {
      setDeleting(false)
    }
  }, [fundraiser, deleteFundraiser, navigate])

  const handleSaveEdit = useCallback(async () => {
    if (!fundraiser) return

    if (!editForm.startDate || !editForm.dueDate) {
      alert("Start date and due date are required")
      return
    }

    const normalizedStart = new Date(`${editForm.startDate}T00:00:00`)
    const normalizedDue = new Date(`${editForm.dueDate}T00:00:00`)
    const today = new Date()
    const normalizedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
    if (normalizedStart < normalizedToday) {
      alert("Start date cannot be in the past")
      return
    }
    if (normalizedDue < normalizedStart) {
      alert("Due date cannot be before start date")
      return
    }

    if (editForm.perKidPaymentAmount) {
      const perKidValue = Number(editForm.perKidPaymentAmount)
      if (!Number.isFinite(perKidValue) || perKidValue <= 0) {
        alert("Amount per kid must be greater than 0")
        return
      }
      const isValidAmount = /^\d+(\.\d{1,2})?$/.test(editForm.perKidPaymentAmount)
      if (!isValidAmount) {
        alert("Amount per kid must have at most 2 decimal places")
        return
      }
    }

    setIsSaving(true)
    try {
      const body: Record<string, unknown> = {
        title: editForm.title || undefined,
        description: editForm.description || undefined,
        start_date: editForm.startDate
          ? new Date(editForm.startDate)
          : undefined,
        due_date: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
        per_kid_payment_amount: editForm.perKidPaymentAmount
          ? parseFloat(editForm.perKidPaymentAmount)
          : undefined,
      }

      // Convert icon file to byte array if provided
      if (editForm.iconFile) {
        const bytes = await editForm.iconFile.arrayBuffer()
        body.icon = Array.from(new Uint8Array(bytes))
      }

      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update fundraiser")
      }

      await refresh()
      setIsEditing(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update fundraiser")
    } finally {
      setIsSaving(false)
    }
  }, [fundraiser, editForm, refresh])

  const handleEditChange = useCallback(
    (field: string, value: unknown) => {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [],
  )

  const handlePayForKid = useCallback(
    async (kidId: number) => {
      if (!fundraiser) return

      setPayingKidId(kidId)
      try {
        const response = await fetch(
          `${API_BASE_URL}/fundraisers/${fundraiser.id}/pay/${kidId}`,
          {
            method: "POST",
            credentials: "include",
          },
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to process payment")
        }

        await refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to pay for kid")
      } finally {
        setPayingKidId(null)
      }
    },
    [fundraiser, refresh],
  )

  const handleRefundForKid = useCallback(
    async (kidId: number) => {
      if (!fundraiser) return

      setRefundingKidId(kidId)
      try {
        const response = await fetch(
          `${API_BASE_URL}/fundraisers/${fundraiser.id}/refund/${kidId}`,
          {
            method: "POST",
            credentials: "include",
          },
        )

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || "Failed to refund payment")
        }

        await refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to refund payment")
      } finally {
        setRefundingKidId(null)
      }
    },
    [fundraiser, refresh],
  )

  if (loading) return <div className="p-8">Loading fundraiser...</div>
  if (error || !fundraiser)
    return <div className="p-8 text-destructive">{error || "Not found"}</div>

  const hasTransfers = (fundraiser?.money_transfers?.length ?? 0) > 0

  return (
    <div className="p-8">
      {(fundraiser.is_blocked || isClosed) && (
        <div className="mb-6 rounded-lg border border-border bg-muted px-4 py-3">
          <p
            className={
              fundraiser.is_blocked
                ? "text-lg font-semibold text-destructive"
                : "text-lg font-semibold"
            }
          >
            {fundraiser.is_blocked ? "Fundraiser Canceled" : "Fundraiser Closed"}
          </p>
          <p className="text-sm mt-1 text-muted-foreground">
            {fundraiser.is_blocked
              ? "This fundraiser was canceled by the treasurer. Kid payments are disabled."
              : "This fundraiser is closed because the due date has passed. Kid payments are disabled."}
          </p>
        </div>
      )}
      <FundraiserHeader
        classroomName={classroom?.Name || "Loading..."}
        treasurerName={user ? `${user.FirstName} ${user.LastName}` : ""}
        canEdit={canEdit}
        canDelete={canDelete}
        isEditing={isEditing}
        isSaving={isSaving}
        deleting={deleting}
        hasTransfers={hasTransfers}
        onReport={() => navigate(`/raport/fundraiser/${fundraiser.id}`)}
        onEdit={() => setIsEditing(true)}
        onSave={handleSaveEdit}
        onCancel={() => setIsEditing(false)}
        onDelete={handleDelete}
        onBack={() => navigate(-1)}
      />

      <FundraiserInfo
        title={fundraiser.title}
        description={fundraiser.description}
        icon={iconSrc ?? null}
        startDate={fundraiser.start_date}
        dueDate={fundraiser.due_date}
        perKidPaymentAmount={fundraiser.per_kid_payment_amount}
        totalMoneyRaised={totalMoneyRaised}
        accountBalance={accountBalance}
        isEditing={isEditing}
        editForm={editForm}
        onEditChange={handleEditChange}
      />

      {!isEditing && (
        <>
          <KidsSection
            kids={sortedKids}
            userKidIds={user?.Kids?.map((k) => k.ID) ?? []}
            currentUserId={user?.ID}
            isBlocked={fundraiser.is_blocked || isClosed}
            payingKidId={payingKidId}
            refundingKidId={refundingKidId}
            onPayForKid={handlePayForKid}
            onRefundForKid={handleRefundForKid}
          />
          {canManageFunds && (
            <TreasurerActionsSection
              fundraiserId={fundraiser.id}
              totalRaised={totalMoneyRaised}
              accountBalance={accountBalance}
              canCancel={canCancelFundraiser}
              isBlocked={fundraiser.is_blocked}
              onRefresh={refresh}
            />
          )}
          <ReceiptsSection
            fundraiserId={fundraiser.id}
            files={fundraiser.files}
            canManage={canManageFunds}
            isBlocked={fundraiser.is_blocked}
            onRefresh={refresh}
          />
          <MoneyTransfersSection
            transfers={fundraiser.money_transfers}
            fundraiserKids={fundraiser.kids}
            classroom={classroom}
            fundraiserBankAccountId={fundraiser.bank_account?.ID ?? null}
          />
        </>
      )}
    </div>
  )
}
