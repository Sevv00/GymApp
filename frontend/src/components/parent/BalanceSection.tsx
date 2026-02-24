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

interface BalanceSectionProps {
  balance: number
  onRefresh?: () => Promise<void> | void
}

export function BalanceSection({ balance, onRefresh }: BalanceSectionProps) {
  const [addMoneyAmount, setAddMoneyAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const isValidAmount = (value: string) => /^\d+(\.\d{1,2})?$/.test(value)

  const handleAddMoney = async () => {
    if (!addMoneyAmount) return
    const amountValue = Number(addMoneyAmount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than 0")
      return
    }
    if (!isValidAmount(addMoneyAmount)) {
      alert("Amount must have at most 2 decimal places")
      return
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/parent/add-money/${addMoneyAmount}`,
        {
          method: "PUT",
          credentials: "include",
        },
      )
      if (!res.ok) {
        alert("Unable to add money. Please try again.")
        return
      }
      setAddMoneyAmount("")
      if (onRefresh) await onRefresh()
    } catch {
      alert("Unable to add money. Please check your connection and try again.")
    }
  }

  const handleWithdrawMoney = async () => {
    if (!withdrawAmount) return
    const amountValue = Number(withdrawAmount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than 0")
      return
    }
    if (!isValidAmount(withdrawAmount)) {
      alert("Amount must have at most 2 decimal places")
      return
    }
    if (amountValue > balance) {
      alert("You cannot withdraw more than your balance")
      return
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/parent/withdraw-money/${withdrawAmount}`,
        {
        method: "PUT",
        credentials: "include",
        },
      )
      if (!res.ok) {
        alert("Unable to withdraw money. Please try again.")
        return
      }
      setWithdrawAmount("")
      if (onRefresh) await onRefresh()
    } catch {
      alert("Unable to withdraw money. Please check your connection and try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
        <CardDescription>Manage your money</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-3xl font-bold">{formatCurrency(balance, "PLN")}</p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Add Money</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              placeholder="Amount"
              value={addMoneyAmount}
              onChange={(e) => setAddMoneyAmount(e.target.value)}
            />
            <Button onClick={handleAddMoney}>Add</Button>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Withdraw</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button
              variant="destructive"
              onClick={handleWithdrawMoney}
              disabled={!withdrawAmount}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
