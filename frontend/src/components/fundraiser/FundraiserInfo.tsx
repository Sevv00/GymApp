import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/formatting"
import { PiggyBank } from "lucide-react"

interface FundraiserInfoProps {
  title: string
  description: string
  icon: string | null
  startDate: string
  dueDate: string
  perKidPaymentAmount: number
  totalMoneyRaised: number
  accountBalance: number
  isEditing: boolean
  editForm: {
    title: string
    description: string
    startDate: string
    dueDate: string
    perKidPaymentAmount: string
    iconFile: File | null
  }
  onEditChange: (field: string, value: unknown) => void
}

export function FundraiserInfo({
  title,
  description,
  icon,
  startDate,
  dueDate,
  perKidPaymentAmount,
  totalMoneyRaised,
  accountBalance,
  isEditing,
  editForm,
  onEditChange,
}: FundraiserInfoProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex gap-6 items-start">
          <div className="h-20 w-20 rounded-md border flex items-center justify-center overflow-hidden bg-muted shrink-0">
            {icon ? (
              <img
                src={icon}
                alt="Fundraiser icon"
                className="h-full w-full object-cover"
              />
            ) : (
              <PiggyBank className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold">Icon</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        onEditChange("iconFile", file)
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold">Title</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => onEditChange("title", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-sm font-semibold">Start Date</label>
                    <Input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) =>
                        onEditChange("startDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">End Date</label>
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => onEditChange("dueDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      Amount per Kid
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.perKidPaymentAmount}
                      onChange={(e) =>
                        onEditChange("perKidPaymentAmount", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-3xl mb-2">{title}</CardTitle>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-semibold">{formatDate(startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-semibold">{formatDate(dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount per Kid</p>
                    <p className="font-semibold">
                      {formatCurrency(perKidPaymentAmount, "USD")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Raised</p>
                    <p className="font-semibold text-primary">
                      {formatCurrency(totalMoneyRaised, "USD")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Balance</p>
                    <p className="font-semibold">
                      {formatCurrency(accountBalance, "USD")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div>
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => onEditChange("description", e.target.value)}
              className="w-full mt-1 p-2 border rounded-md text-sm"
              rows={4}
            />
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {description || "No description"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
