import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { convertIconToBase64 } from "@/lib/fundraiserUtils"
import { formatDate } from "@/lib/formatting"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface KidWithPayment {
  id: number
  first_name: string
  last_name: string
  icon: number[] | string | null
  paid: boolean
  paid_at: string | null
  paid_by: {
    id: number
    first_name: string
    last_name: string
  } | null
}

interface KidsSectionProps {
  kids: KidWithPayment[]
  userKidIds: number[]
  currentUserId?: number
  isBlocked: boolean
  payingKidId: number | null
  refundingKidId: number | null
  onPayForKid: (kidId: number) => void
  onRefundForKid: (kidId: number) => void
}

export function KidsSection({
  kids,
  userKidIds,
  currentUserId,
  isBlocked,
  payingKidId,
  refundingKidId,
  onPayForKid,
  onRefundForKid,
}: KidsSectionProps) {
  const userKidIdSet = new Set(userKidIds)
  const userKids = kids.filter((k) => userKidIdSet.has(k.id))
  const otherKids = kids.filter((k) => !userKidIdSet.has(k.id))

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Kids</CardTitle>
      </CardHeader>
      <CardContent>
        {kids.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No kids in this classroom yet
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {userKids.length > 0 && (
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                Your Kids
              </p>
            )}
            {userKids.map((kid) => {
              const iconSrc = convertIconToBase64(kid.icon)
              const canRefund =
                !!currentUserId && kid.paid_by?.id === currentUserId

              return (
                <div key={kid.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt="Kid icon"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium">
                        {kid.first_name} {kid.last_name}
                      </p>
                    </div>
                    {kid.paid && kid.paid_at && kid.paid_by ? (
                      <p className="text-xs text-muted-foreground">
                        Paid on {formatDate(kid.paid_at)} by{" "}
                        {kid.paid_by.first_name} {kid.paid_by.last_name}
                      </p>
                    ) : (
                      <p className="text-xs text-primary font-medium">
                        Not paid yet
                      </p>
                    )}
                  </div>
                  {!kid.paid ? (
                    <Button
                      onClick={() => onPayForKid(kid.id)}
                      disabled={payingKidId === kid.id || isBlocked}
                      size="sm"
                      className="ml-4"
                    >
                      {payingKidId === kid.id ? "Paying..." : "Pay"}
                    </Button>
                  ) : canRefund ? (
                    <Button
                      variant="outline"
                      onClick={() => onRefundForKid(kid.id)}
                      disabled={refundingKidId === kid.id || isBlocked}
                      size="sm"
                      className="ml-4"
                    >
                      {refundingKidId === kid.id ? "Taking back..." : "Take back"}
                    </Button>
                  ) : null}
                </div>
              )
            })}

            {otherKids.length > 0 && (
              <p className="text-xs font-semibold text-muted-foreground mb-2 mt-4 uppercase">
                Other Kids in Classroom
              </p>
            )}
            {otherKids.map((kid) => {
              const iconSrc = convertIconToBase64(kid.icon)
              const canRefund =
                !!currentUserId && kid.paid_by?.id === currentUserId

              return (
                <div key={kid.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt="Kid icon"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium">
                        {kid.first_name} {kid.last_name}
                      </p>
                    </div>
                    {kid.paid && kid.paid_at && kid.paid_by ? (
                      <p className="text-xs text-muted-foreground">
                        Paid on {formatDate(kid.paid_at)} by{" "}
                        {kid.paid_by.first_name} {kid.paid_by.last_name}
                      </p>
                    ) : (
                      <p className="text-xs text-primary font-medium">
                        Not paid yet
                      </p>
                    )}
                  </div>
                  {!kid.paid ? (
                    <Button
                      onClick={() => onPayForKid(kid.id)}
                      disabled={payingKidId === kid.id || isBlocked}
                      size="sm"
                      className="ml-4"
                    >
                      {payingKidId === kid.id ? "Paying..." : "Pay"}
                    </Button>
                  ) : canRefund ? (
                    <Button
                      variant="outline"
                      onClick={() => onRefundForKid(kid.id)}
                      disabled={refundingKidId === kid.id || isBlocked}
                      size="sm"
                      className="ml-4"
                    >
                      {refundingKidId === kid.id ? "Taking back..." : "Take back"}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
