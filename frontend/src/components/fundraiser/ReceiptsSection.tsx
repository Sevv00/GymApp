import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_BASE_URL } from "@/lib/api"
import { formatDate } from "@/lib/formatting"
import type { File as ReceiptFile } from "@/lib/types"

interface ReceiptsSectionProps {
  fundraiserId: number
  files: ReceiptFile[] | null | undefined
  canManage: boolean
  isBlocked: boolean
  onRefresh?: () => Promise<void> | void
}

export function ReceiptsSection({
  fundraiserId,
  files,
  canManage,
  isBlocked,
  onRefresh,
}: ReceiptsSectionProps) {
  const sortedFiles = [...(files ?? [])].sort((a, b) => {
    const aTime = new Date(a.CreatedAt).getTime()
    const bTime = new Date(b.CreatedAt).getTime()
    return bTime - aTime
  })

  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}/receipt`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to upload file")
      }

      setSelectedFile(null)
      if (onRefresh) await onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm("Delete this file?") ) return

    setDeletingId(fileId)
    try {
      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}/receipt/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to delete file")
      }

      if (onRefresh) await onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete file")
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (file: ReceiptFile) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/fundraisers/${fundraiserId}/receipt/${file.ID}`,
        {
          credentials: "include",
        },
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Unable to download file")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.Name
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to download file")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Receipts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && !isBlocked && (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}

        {sortedFiles.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {sortedFiles.map((file) => (
              <div
                key={file.ID}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-sm">{file.Name}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(file.CreatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </Button>
                  {canManage && !isBlocked && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(file.ID)}
                      disabled={deletingId === file.ID}
                    >
                      {deletingId === file.ID ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No receipts yet</p>
        )}
      </CardContent>
    </Card>
  )
}
