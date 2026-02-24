import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatting"
import { API_BASE_URL } from "@/lib/api"
import type {
  ClassReport,
  FundraiserReport,
  KidReport,
  MoneyTransfer,
  OperationLog,
} from "@/lib/types"

type ReportType = "class" | "fundraiser" | "kid"

function TransfersList({ transfers }: { transfers: MoneyTransfer[] }) {
  const sortedTransfers = useMemo(() => {
    return [...transfers].sort((a, b) => {
      const aTime = new Date(a.CreatedAt).getTime()
      const bTime = new Date(b.CreatedAt).getTime()
      return bTime - aTime
    })
  }, [transfers])

  if (sortedTransfers.length === 0) {
    return <p className="text-sm text-muted-foreground">No transfers</p>
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {sortedTransfers.map((transfer) => (
        <div
          key={transfer.ID}
          className={
            "flex flex-col gap-2 border rounded-lg p-3 " +
            (transfer.IsWithdrawal
              ? "border-amber-400/60 bg-amber-500/10"
              : "")
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">
              {`${transfer.PayerName || (transfer.FundraiserTitle ? `Fundraiser (${transfer.FundraiserTitle})` : "Fundraiser")} → ${transfer.PayeeName || (transfer.FundraiserTitle ? `Fundraiser (${transfer.FundraiserTitle})` : "Fundraiser")}`}
            </div>
            <div className="text-sm font-semibold text-primary">
              {formatCurrency(transfer.Amount, "USD")}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDateTime(transfer.CreatedAt)}</span>
            {transfer.KidName && <span>Kid: {transfer.KidName}</span>}
            {transfer.FundraiserTitle && (
              <span>Fundraiser: {transfer.FundraiserTitle}</span>
            )}
            {transfer.Description && transfer.Description.trim() && (
              <span>Description: {transfer.Description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function OperationLogsList({ logs }: { logs: OperationLog[] }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No logs</p>
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {logs.map((logItem) => (
        <div
          key={logItem.ID}
          className="flex items-start justify-between gap-3 border rounded-lg p-3"
        >
          <div className="text-sm">{logItem.Message}</div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(logItem.CreatedAt)}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Raport() {
  const { type, id } = useParams<{ type?: string; id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classReport, setClassReport] = useState<ClassReport | null>(null)
  const [fundraiserReport, setFundraiserReport] =
    useState<FundraiserReport | null>(null)
  const [kidReport, setKidReport] = useState<KidReport | null>(null)

  useEffect(() => {
    if (!type || !id) return

    const reportType = type as ReportType
    setLoading(true)
    setError(null)
    setClassReport(null)
    setFundraiserReport(null)
    setKidReport(null)

    const fetchReport = async () => {
      try {
        const query =
          reportType === "kid"
            ? `?class_id=${searchParams.get("class_id") || ""}`
            : ""

        const response = await fetch(
          `${API_BASE_URL}/reports/${reportType}/${id}${query}`,
          { credentials: "include" },
        )

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || "Failed to fetch report")
        }

        const data = await response.json()
        if (reportType === "class") setClassReport(data)
        if (reportType === "fundraiser") setFundraiserReport(data)
        if (reportType === "kid") setKidReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch report")
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [type, id, searchParams])

  if (!type || !id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-2">Reports</h1>
        <p className="text-muted-foreground">
          Use the report buttons in class or fundraiser pages to open a report.
        </p>
      </div>
    )
  }

  if (loading) return <div className="p-8">Loading report...</div>
  if (error) return <div className="p-8 text-destructive">{error}</div>

  return (
    <div className="p-8 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      {classReport && (
        <Card>
          <CardHeader>
            <CardTitle>Class Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Class Name</p>
                <p className="font-semibold">{classReport.class.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-semibold">
                  {formatDateTime(classReport.class.created_at)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Treasurer</p>
                <p className="font-semibold">{classReport.class.treasurer_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Fundraisers</p>
                <p className="font-semibold">{classReport.class.total_fundraisers}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Open Fundraisers</p>
                <p className="font-semibold">{classReport.class.open_fundraisers}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Canceled Fundraisers</p>
                <p className="font-semibold">{classReport.class.canceled_fundraisers}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Money Transfers</h3>
              {classReport.transfers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No transfers</p>
              ) : (
                (() => {
                  const grouped = classReport.transfers.reduce(
                    (acc, transfer) => {
                      const key = transfer.FundraiserTitle || "Fundraiser"
                      acc[key] = acc[key] || []
                      acc[key].push(transfer)
                      return acc
                    },
                    {} as Record<string, MoneyTransfer[]>,
                  )

                  return (
                    <div className="space-y-4">
                      {Object.entries(grouped).map(([title, transfers]) => (
                        <div key={title}>
                          <h4 className="font-semibold mb-2 text-primary text-base">
                            {title}
                          </h4>
                          <TransfersList transfers={transfers} />
                        </div>
                      ))}
                    </div>
                  )
                })()
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other operations (logs)</h3>
              <OperationLogsList logs={classReport.logs} />
            </div>
          </CardContent>
        </Card>
      )}

      {fundraiserReport && (
        <Card>
          <CardHeader>
            <CardTitle>Fundraiser Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Title</p>
                <p className="font-semibold">{fundraiserReport.fundraiser.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-semibold">
                  {formatDate(fundraiserReport.fundraiser.start_date)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-semibold">
                  {formatDate(fundraiserReport.fundraiser.due_date)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Per Kid Amount</p>
                <p className="font-semibold">
                  {formatCurrency(
                    fundraiserReport.fundraiser.per_kid_payment_amount,
                    "USD",
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold">
                  {fundraiserReport.fundraiser.is_blocked ? "Canceled" : "Open"}
                </p>
              </div>
              {fundraiserReport.fundraiser.is_blocked && (
                <>
                  <div>
                    <p className="text-muted-foreground">Canceled At</p>
                    <p className="font-semibold">
                      {fundraiserReport.fundraiser.canceled_at
                        ? formatDateTime(
                            fundraiserReport.fundraiser.canceled_at,
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Canceled By</p>
                    <p className="font-semibold">
                      {fundraiserReport.fundraiser.canceled_by_name || "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Money Transfers</h3>
              <TransfersList transfers={fundraiserReport.transfers} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other operations (logs)</h3>
              <OperationLogsList logs={fundraiserReport.logs} />
            </div>
          </CardContent>
        </Card>
      )}

      {kidReport && (
        <Card>
          <CardHeader>
            <CardTitle>Kid Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Kid</p>
                <p className="font-semibold">{kidReport.kid.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Parent</p>
                <p className="font-semibold">{kidReport.kid.parent_name}</p>
              </div>
            </div>
            {kidReport.fundraisers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transfers yet</p>
            ) : (
              <div className="space-y-4">
                {kidReport.fundraisers.map((fundraiser) => (
                  <div key={fundraiser.fundraiser_id}>
                    <h3 className="font-semibold mb-2 text-primary text-base">
                      {fundraiser.fundraiser_title || "Fundraiser"}
                    </h3>
                    <TransfersList transfers={fundraiser.transfers} />
                  </div>
                ))}
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">Other operations (logs)</h3>
              <OperationLogsList logs={kidReport.logs} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
