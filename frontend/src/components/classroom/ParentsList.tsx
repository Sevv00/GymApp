import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/types"
import { formatFullName } from "@/lib/formatting"

interface ParentsListProps {
  parents: User[] | null
}

export function ParentsList({ parents }: ParentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parents</CardTitle>
        <CardDescription>{parents?.length || 0} members</CardDescription>
      </CardHeader>
      <CardContent>
        {parents && parents.length > 0 ? (
          <ul className="space-y-2">
            {parents.map((parent) => (
              <li key={parent.ID} className="text-sm">
                {formatFullName(parent.FirstName, parent.LastName)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No parents yet</p>
        )}
      </CardContent>
    </Card>
  )
}
