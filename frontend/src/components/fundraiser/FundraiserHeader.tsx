import { Button } from "@/components/ui/button"
import { Edit2, Check, X } from "lucide-react"

interface FundraiserHeaderProps {
  classroomName: string
  treasurerName: string
  canEdit: boolean
  canDelete: boolean
  isEditing: boolean
  isSaving: boolean
  deleting: boolean
  hasTransfers: boolean
  onReport: () => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  onBack: () => void
}

export function FundraiserHeader({
  classroomName,
  treasurerName,
  canEdit,
  canDelete,
  isEditing,
  isSaving,
  deleting,
  hasTransfers,
  onReport,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onBack,
}: FundraiserHeaderProps) {
  return (
    <div className="mb-6 flex justify-between items-start">
      <div>
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Classroom</p>
          <h2 className="text-2xl font-bold text-primary">{classroomName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Treasurer: {treasurerName}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onReport}>
          Report
        </Button>
        {canEdit && !isEditing && (
          <Button variant="outline" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        {isEditing && (
          <>
            <Button variant="default" onClick={onSave} disabled={isSaving}>
              <Check className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
        {canDelete && !isEditing && !hasTransfers && (
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>
    </div>
  )
}
