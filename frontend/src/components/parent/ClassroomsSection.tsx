import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Classroom } from "@/lib/types"
import { useNavigate } from "react-router"
import { formatDate } from "@/lib/formatting"

interface ClassroomsSectionProps {
  classrooms: Classroom[] | null
  userId: number
}

export function ClassroomsSection({
  classrooms,
  userId,
}: ClassroomsSectionProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classrooms</CardTitle>
        <CardDescription>Your classrooms</CardDescription>
      </CardHeader>
      <CardContent>
        {classrooms && classrooms.length > 0 ? (
          <ul className="space-y-2">
            {classrooms.map((classroom) => (
              <li key={classroom.ID}>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-3"
                  onClick={() => navigate(`/classes/${classroom.ID}`)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span>
                      {classroom.Name || `Classroom #${classroom.ID}`}
                    </span>
                    {classroom.TreasurerID === userId && (
                      <span className="text-xs font-semibold text-primary">
                        Treasurer
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(classroom.CreatedAt)}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No classrooms yet</p>
        )}
      </CardContent>
    </Card>
  )
}
