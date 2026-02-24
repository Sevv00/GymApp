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
import { API_BASE_URL } from "@/lib/api"
import { formatCurrency } from "@/lib/formatting"

interface TreasurerActionsSectionProps {
  fundraiserId: number
  totalRaised: number
  accountBalance: number
  canCancel: boolean
  isBlocked: boolean
  onRefresh?: () => Promise<void> | void
}

export function TreasurerActionsSection({
  fundraiserId,
  totalRaised,
  accountBalance,
  canCancel,
  isBlocked,
  onRefresh,
}: TreasurerActionsSectionProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawDescription, setWithdrawDescription] = useState("")
  const [returnAmount, setReturnAmount] = useState("")
  const [returnDescription, setReturnDescription] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isReturning, setIsReturning] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const isValidAmount = (value: string) => /^\d+(\.\d{1,2})?$/.test(value)

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    const withdrawValue = Number(withdrawAmount)
    if (!Number.isFinite(withdrawValue) || withdrawValue <= 0) {
      alert("Amount must be greater than 0")
      return
    }
    if (!isValidAmount(withdrawAmount)) {
      alert("Amount must have at most 2 decimal places")
      return
    }
    const trimmedDescription = withdrawDescription.trim()
    if (trimmedDescription.length < 3) {
      alert("Description must be at least 3 characters")
      return
    }

    setIsWithdrawing(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}/withdraw/${withdrawAmount}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: trimmedDescription }),
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to withdraw money")
      }

      setWithdrawAmount("")
      setWithdrawDescription("")
      if (onRefresh) await onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to withdraw money")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleReturn = async () => {
    if (!returnAmount) return
    const returnValue = Number(returnAmount)
    if (!Number.isFinite(returnValue) || returnValue <= 0) {
      alert("Amount must be greater than 0")
      return
    }
    if (!isValidAmount(returnAmount)) {
      alert("Amount must have at most 2 decimal places")
      return
    }
    const trimmedDescription = returnDescription.trim()
    if (trimmedDescription.length < 3) {
      alert("Description must be at least 3 characters")
      return
    }

    setIsReturning(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}/return_funds/${returnAmount}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: trimmedDescription }),
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to return money")
      }

      setReturnAmount("")
      setReturnDescription("")
      if (onRefresh) await onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to return money")
    } finally {
      setIsReturning(false)
    }
  }

  const handleCancel = async () => {
    if (!canCancel || isBlocked) return

    if (!confirm("Cancel fundraiser and refund all payments?")) return

    setIsCanceling(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}/cancel`,
        {
          method: "POST",
          credentials: "include",
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to cancel fundraiser")
      }

      if (onRefresh) await onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to cancel fundraiser")
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Treasurer Actions</CardTitle>
        <CardDescription>Withdraw or return fundraiser funds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Total Raised</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalRaised, "USD")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account Balance</p>
            <p className="text-2xl font-bold">
              {formatCurrency(accountBalance, "USD")}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Withdraw</label>
          <div className="flex flex-col gap-2 mt-1">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={withdrawDescription}
              onChange={(e) => setWithdrawDescription(e.target.value)}
            />
            <Button
              onClick={handleWithdraw}
              disabled={
                isWithdrawing ||
                !withdrawAmount ||
                withdrawDescription.trim().length < 3
              }
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Return Funds</label>
          <div className="flex flex-col gap-2 mt-1">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={returnDescription}
              onChange={(e) => setReturnDescription(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={handleReturn}
              disabled={
                isReturning ||
                !returnAmount ||
                returnDescription.trim().length < 3
              }
            >
              {isReturning ? "Returning..." : "Return"}
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Canceling the fundraiser refunds all payments to parents. You can only
            cancel when the account balance matches the total raised.
          </p>
          <Button
            variant="destructive"
            className="mt-3 w-full"
            onClick={handleCancel}
            disabled={!canCancel || isBlocked || isCanceling}
          >
            {isBlocked
              ? "Fundraiser Canceled"
              : isCanceling
                ? "Canceling..."
                : "Cancel Fundraiser"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
