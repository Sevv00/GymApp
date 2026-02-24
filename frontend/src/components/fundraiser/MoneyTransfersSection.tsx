import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFullName,
} from "@/lib/formatting"
import type { Classroom, FundraiserKid, MoneyTransfer } from "@/lib/types"

interface MoneyTransfersSectionProps {
  transfers: MoneyTransfer[] | null | undefined
  fundraiserKids: FundraiserKid[] | null | undefined
  classroom: Classroom | null | undefined
  fundraiserBankAccountId: number | null | undefined
}

export function MoneyTransfersSection({
  transfers,
  fundraiserKids,
  classroom,
  fundraiserBankAccountId,
}: MoneyTransfersSectionProps) {
  const sortedTransfers = useMemo(() => {
    if (!transfers || transfers.length === 0) return []
    return [...transfers].sort((a, b) => {
      const aTime = new Date(a.CreatedAt).getTime()
      const bTime = new Date(b.CreatedAt).getTime()
      return bTime - aTime
    })
  }, [transfers])

  const fundraiserKidsMap = useMemo(() => {
    const map = new Map<number, FundraiserKid>()
    fundraiserKids?.forEach((kid) => map.set(kid.id, kid))
    return map
  }, [fundraiserKids])

  const treasurerName = useMemo(() => {
    if (!classroom?.Parents || !classroom.TreasurerID) return "Treasurer"
    const treasurer = classroom.Parents.find(
      (parent) => parent.ID === classroom.TreasurerID,
    )
    if (!treasurer) return "Treasurer"
    return formatFullName(treasurer.FirstName, treasurer.LastName)
  }, [classroom])

  const fundraiserAccountLabel = "Fundraiser account"
  const treasurerLabel = treasurerName ? `Treasurer (${treasurerName})` : "Treasurer"

  const getKidName = (kidId: number) => {
    const fundraiserKid = fundraiserKidsMap.get(kidId)
    if (fundraiserKid) {
      return formatFullName(fundraiserKid.first_name, fundraiserKid.last_name)
    }

    const classKid = classroom?.Kids?.find((kid) => kid.ID === kidId)
    if (classKid) {
      return formatFullName(classKid.FirstName, classKid.LastName)
    }

    return null
  }

  const getParentNameForKid = (kidId: number) => {
    const fundraiserKid = fundraiserKidsMap.get(kidId)
    if (fundraiserKid?.paid_by) {
      return formatFullName(
        fundraiserKid.paid_by.first_name,
        fundraiserKid.paid_by.last_name,
      )
    }
    return null
  }

  const getPartyLabels = (transfer: MoneyTransfer) => {
    const isKidPayment = transfer.KidID !== null
    const hasFundraiserAccount = !!fundraiserBankAccountId
    const isFundraiserFrom =
      hasFundraiserAccount &&
      transfer.FromBankAccountID === fundraiserBankAccountId
    const isFundraiserTo =
      hasFundraiserAccount &&
      transfer.ToBankAccountID === fundraiserBankAccountId

    if (isKidPayment) {
      if (isFundraiserFrom) {
        return {
          from: fundraiserAccountLabel,
          to: transfer.PayeeName || "Parent",
          direction: "→",
        }
      }

      const parentName =
        getParentNameForKid(transfer.KidID as number) ||
        transfer.PayerName ||
        null
      return {
        from: parentName || "Parent",
        to: fundraiserAccountLabel,
        direction: "→",
      }
    }

    if (isFundraiserFrom) {
      return {
        from: fundraiserAccountLabel,
        to: transfer.PayeeName || treasurerLabel,
        direction: "→",
      }
    }

    if (isFundraiserTo) {
      return {
        from: transfer.PayerName || treasurerLabel,
        to: fundraiserAccountLabel,
        direction: "→",
      }
    }

    return {
      from: treasurerLabel,
      to: fundraiserAccountLabel,
      direction: "↔",
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Money Transfers</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransfers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No money transfers yet
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {sortedTransfers.map((transfer) => {
              const labels = getPartyLabels(transfer)
              const kidName =
                transfer.KidID !== null
                  ? getKidName(transfer.KidID) || transfer.KidName || null
                  : transfer.KidName || null

              const isWithdrawal =
                fundraiserBankAccountId !== null &&
                transfer.FromBankAccountID === fundraiserBankAccountId

              return (
                <div
                  key={transfer.ID}
                  className={
                    "flex flex-col gap-2 border rounded-lg p-3 transition " +
                    (isWithdrawal
                      ? "border-border bg-muted/50 hover:bg-muted/60"
                      : "hover:bg-muted/50")
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{labels.from}</span>
                      <span className="text-muted-foreground">
                        {labels.direction}
                      </span>
                      <span>{labels.to}</span>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {formatCurrency(transfer.Amount, "USD")}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDateTime(transfer.CreatedAt)}</span>
                    {kidName && <span>Kid: {kidName}</span>}
                    {transfer.Description && transfer.Description.trim() && (
                      <span>Description: {transfer.Description}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
