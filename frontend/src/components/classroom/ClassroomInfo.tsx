import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import { formatDate } from "@/lib/formatting"

interface ClassroomInfoProps {
  inviteCode?: string | null
  createdAt: string
  canManageInviteCode: boolean
  onRerollInviteCode: () => void
}

export function ClassroomInfo({
  inviteCode,
  createdAt,
  canManageInviteCode,
  onRerollInviteCode,
}: ClassroomInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Classroom Information</CardTitle>
        <CardDescription>Details about this classroom</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManageInviteCode && (
          <div>
            <span className="font-semibold">Invite Code:</span>{" "}
            <div className="flex items-center gap-2 mt-2">
              <code className="bg-muted px-2 py-1 rounded">
                {inviteCode || "—"}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={onRerollInviteCode}
                className="h-8 w-8"
                title="Regenerate invite code"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div>
          <span className="font-semibold">Created:</span> {formatDate(createdAt)}
        </div>
      </CardContent>
    </Card>
  )
}
