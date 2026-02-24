import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Kid } from "@/lib/types"

interface ReportsSectionProps {
  classId: number
  kids: Kid[] | null | undefined
}

export function ReportsSection({ classId, kids }: ReportsSectionProps) {
  const navigate = useNavigate()
  const [selectedKidId, setSelectedKidId] = useState<string>("")

  const sortedKids = useMemo(() => {
    return [...(kids ?? [])].sort((a, b) =>
      `${a.FirstName} ${a.LastName}`.localeCompare(
        `${b.FirstName} ${b.LastName}`,
      ),
    )
  }, [kids])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/raport/class/${classId}`)}
          className="w-full"
        >
          Generate Class Report
        </Button>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Kid report</label>
          <select
            className="w-full border rounded-md bg-background px-3 py-2 text-sm"
            value={selectedKidId}
            onChange={(e) => setSelectedKidId(e.target.value)}
          >
            <option value="">Select a kid</option>
            {sortedKids.map((kid) => (
              <option key={kid.ID} value={kid.ID}>
                {kid.FirstName} {kid.LastName}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="w-full"
            disabled={!selectedKidId}
            onClick={() =>
              navigate(`/raport/kid/${selectedKidId}?class_id=${classId}`)
            }
          >
            Generate Kid Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
