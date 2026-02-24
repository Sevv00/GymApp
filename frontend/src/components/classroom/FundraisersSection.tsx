import { useState, useCallback, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router"
import type { Fundraiser } from "@/lib/types"
import { formatDate, formatCurrency } from "@/lib/formatting"
import { API_BASE_URL } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { convertIconToBase64, readFileAsBase64 } from "@/lib/fundraiserUtils"

interface FundraisersSectionProps {
  fundraisers: Fundraiser[] | null
  classId: number
  isTreasurer: boolean
}

export function FundraisersSection({
  fundraisers,
  classId,
  isTreasurer,
}: FundraisersSectionProps) {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [perKidAmount, setPerKidAmount] = useState("")
  const [iconBase64, setIconBase64] = useState<string | null>(null)
  const isValidAmount = (value: string) => /^\d+(\.\d{1,2})?$/.test(value)
  const formatDateLabel = (value: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(value)
      .replaceAll("/", "-")

  const sortedFundraisers = useMemo(() => {
    if (!fundraisers) return []
    return [...fundraisers].sort((a, b) => {
      const dateA = new Date(
        a.created_at ?? (a as Fundraiser & { CreatedAt?: string }).CreatedAt,
      ).getTime()
      const dateB = new Date(
        b.created_at ?? (b as Fundraiser & { CreatedAt?: string }).CreatedAt,
      ).getTime()
      return dateB - dateA
    })
  }, [fundraisers])

  const resetForm = useCallback(() => {
    setTitle("")
    setDescription("")
    setStartDate(undefined)
    setDueDate(undefined)
    setPerKidAmount("")
    setIconBase64(null)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !startDate || !dueDate || !perKidAmount) {
      alert("Please fill all required fields")
      return
    }
    const perKidValue = Number(perKidAmount)
    if (!Number.isFinite(perKidValue) || perKidValue <= 0) {
      alert("Per kid amount must be greater than 0")
      return
    }
    if (!isValidAmount(perKidAmount)) {
      alert("Per kid amount must have at most 2 decimal places")
      return
    }

    const normalizedStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    )
    const normalizedDue = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
    )
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

    setCreating(true)
    try {
      const payload = {
        title,
        description,
        start_date: startDate.toISOString(),
        due_date: dueDate.toISOString(),
        per_kid_payment_amount: parseFloat(perKidAmount),
        icon: iconBase64 || undefined,
      }

      const res = await fetch(`${API_BASE_URL}/classes/${classId}/fundraiser`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "Failed to create fundraiser")
        return
      }

      const created = await res.json()
      console.log("Created fundraiser response:", created)
      resetForm()
      setShowForm(false)
      navigate(`/fundraisers/${created.id}`)
    } catch {
      alert("Failed to create fundraiser. Please try again.")
    } finally {
      setCreating(false)
    }
  }, [title, startDate, dueDate, perKidAmount, description, iconBase64, classId, resetForm, navigate])

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      setIconBase64(null)
      return
    }
    const b64 = await readFileAsBase64(file)
    setIconBase64(b64)
  }, [])

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Fundraisers</CardTitle>
            <CardDescription>
              {fundraisers?.length || 0} active fundraisers
            </CardDescription>
          </div>
          {isTreasurer && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              New Fundraiser
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            {showForm && (
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>New Fundraiser</DialogTitle>
                  <DialogDescription>
                    Provide basic details to create a fundraiser.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-22.5 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">
                        Start date
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate
                              ? formatDateLabel(startDate)
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">
                        Due date
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate
                              ? formatDateLabel(dueDate)
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                    Per kid amount
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={perKidAmount}
                      onChange={(e) => setPerKidAmount(e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-muted-foreground">
                    Icon (optional)
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile(e.target.files?.[0] || null)}
                    />
                    {iconBase64 && (
                      <img
                        src={`data:image/png;base64,${iconBase64}`}
                        alt="Preview"
                        className="h-16 w-16 rounded object-cover border mt-1"
                      />
                    )}
                  </label>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setShowForm(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>

          {sortedFundraisers && sortedFundraisers.length > 0 ? (
            <div className="space-y-4">
              {sortedFundraisers.map((fundraiser) => {
                const fundraiserId =
                  fundraiser.id ??
                  (fundraiser as Fundraiser & { ID?: number }).ID ??
                  0
                const fundraiserIsBlocked =
                  fundraiser.is_blocked ??
                  (fundraiser as Fundraiser & { IsBlocked?: boolean }).IsBlocked ??
                  false
                const fundraiserTitle =
                  fundraiser.title ??
                  (fundraiser as Fundraiser & { Title?: string }).Title ??
                  "Untitled fundraiser"
                const fundraiserDescription =
                  fundraiser.description ??
                  (fundraiser as Fundraiser & { Description?: string }).Description ??
                  ""
                const fundraiserDueDate =
                  fundraiser.due_date ??
                  (fundraiser as Fundraiser & { DueDate?: string }).DueDate ??
                  null
                const fundraiserIsClosed = (() => {
                  if (!fundraiserDueDate) return false
                  const due = new Date(fundraiserDueDate)
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
                })()
                const fundraiserPerKidAmount =
                  fundraiser.per_kid_payment_amount ??
                  (fundraiser as Fundraiser & { PerKidPaymentAmount?: number })
                    .PerKidPaymentAmount ??
                  null
                const fundraiserIcon =
                  fundraiser.icon ??
                  (fundraiser as Fundraiser & { Icon?: Fundraiser["icon"] })
                    .Icon ??
                  null
                const iconSrc = convertIconToBase64(fundraiserIcon)

                return (
                  <div
                    key={fundraiserId}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      fundraiserIsBlocked || fundraiserIsClosed
                        ? "bg-muted/40 text-muted-foreground opacity-75"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => navigate(`/fundraisers/${fundraiserId}`)}
                  >
                    <div className="flex gap-4">
                      <div className="h-24 w-24 rounded-md border flex items-center justify-center overflow-hidden bg-muted shrink-0">
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt="Fundraiser icon"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PiggyBank className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">
                              {fundraiserTitle}
                            </h3>
                            {(fundraiserIsBlocked || fundraiserIsClosed) && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted border">
                                {fundraiserIsBlocked ? "Canceled" : "Closed"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {fundraiserDescription || "No description"}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-muted-foreground">
                            Due: {formatDate(fundraiserDueDate)}
                          </div>
                          <div className="text-right text-sm font-semibold">
                            {formatCurrency(
                              fundraiserPerKidAmount,
                              "USD",
                            )}{" "}
                            per kid
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No fundraisers yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
