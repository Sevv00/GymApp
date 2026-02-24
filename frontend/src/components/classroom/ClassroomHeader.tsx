import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X, Trash2 } from "lucide-react"

interface ClassroomHeaderProps {
  name: string
  classroomId: number
  isTreasurer: boolean
  hasFundraisers: boolean
  isEditingName: boolean
  editedName: string
  treasurerName: string | null
  onEditNameClick: () => void
  onCancelEdit: () => void
  onSaveName: () => void
  onEditedNameChange: (value: string) => void
  onDeleteClassroom: () => void
  onBackClick: () => void
}

export function ClassroomHeader({
  name,
  classroomId,
  isTreasurer,
  hasFundraisers,
  isEditingName,
  editedName,
  treasurerName,
  onEditNameClick,
  onCancelEdit,
  onSaveName,
  onEditedNameChange,
  onDeleteClassroom,
  onBackClick,
}: ClassroomHeaderProps) {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={onBackClick}>
          ← Back to Dashboard
        </Button>
        {isTreasurer && !hasFundraisers && (
          <Button variant="destructive" onClick={onDeleteClassroom}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Classroom
          </Button>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {isEditingName ? (
            <>
              <Input
                value={editedName}
                onChange={(e) => onEditedNameChange(e.target.value)}
                className="text-4xl font-bold h-auto py-2 max-w-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveName()
                  if (e.key === "Escape") onCancelEdit()
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onSaveName}
                className="h-10 w-10"
              >
                <Check className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onCancelEdit}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-primary">
                {name || `Classroom #${classroomId}`}
              </h1>
              {isTreasurer && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEditNameClick}
                  className="h-10 w-10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
        {treasurerName && (
          <p className="text-muted-foreground">
            Treasurer:{" "}
            <span className="font-semibold text-foreground">
              {treasurerName}
            </span>
          </p>
        )}
      </div>
    </>
  )
}
