import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Kid } from "@/lib/types"
import { formatFullName } from "@/lib/formatting"

interface KidsListProps {
  kids: Kid[] | null
}

export function KidsList({ kids }: KidsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kids</CardTitle>
        <CardDescription>{kids?.length || 0} kids</CardDescription>
      </CardHeader>
      <CardContent>
        {kids && kids.length > 0 ? (
          <ul className="space-y-2">
            {kids.map((kid) => (
              <li key={kid.ID} className="text-sm">
                <div className="flex flex-col">
                  <span>{formatFullName(kid.FirstName, kid.LastName)}</span>
                  {kid.Birthday && (
                    <span className="text-xs text-muted-foreground">
                      Birthday: {kid.Birthday.slice(0, 10)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No kids yet</p>
        )}
      </CardContent>
    </Card>
  )
}
