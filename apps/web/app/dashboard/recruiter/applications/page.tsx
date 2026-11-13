"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RefreshCw, FileText } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import { useToast } from "@workspace/ui/components/toast"
import { useSearchParams } from "next/navigation"

type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "rejected"
  | "offered"
  | "accepted"

interface Application {
  _id: string
  seekerId: string
  seekerName: string | null
  seekerEmail: string | null
  jobId: string
  jobTitle: string | null
  companyId: string
  companyName: string | null
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

interface ApplicationsResponse {
  success: boolean
  error?: string
  applications: Application[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface Job {
  _id: string
  title: string
}

interface JobsResponse {
  success: boolean
  jobs: Job[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const PAGE_LIMIT = 10

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "applied",
  "under_review",
  "shortlisted",
  "rejected",
  "offered",
  "accepted",
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  offered: "Offered",
  accepted: "Accepted",
}

const statusLabel = (status: string): string =>
  STATUS_LABELS[status as ApplicationStatus] ?? status

function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

async function fetchJobs(): Promise<Job[]> {
  const res = await fetch("/api/jobs?limit=100", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load jobs")
  const data = (await res.json()) as JobsResponse
  return data.jobs ?? []
}

async function loadApplications(
  signal: AbortSignal,
  params: Record<string, string>
): Promise<ApplicationsResponse> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`/api/recruiter/applications?${qs}`, {
    cache: "no-store",
    signal,
  })
  if (res.status === 401 || res.status === 403) {
    throw new Error("Session expired. Please sign in again as a recruiter.")
  }
  if (!res.ok) throw new Error("Failed to load applications")
  const data = (await res.json()) as ApplicationsResponse
  if (!data.success || !Array.isArray(data.applications)) {
    throw new Error(data.error || "Failed to load applications")
  }
  return data
}

async function patchApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<Application> {
  const res = await fetch(`/api/recruiter/applications/${applicationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    let message = "Failed to update application status"
    try {
      const data = await res.json()
      if (data.error) message = data.error
    } catch {
      // Use default message if the body is not valid JSON
    }
    throw new Error(message)
  }
  const data = await res.json()
  return data.application as Application
}

export default function RecruiterApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const searchParams = useSearchParams()
  const [filterJobId, setFilterJobId] = useState(searchParams.get("jobId") || "")
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">(
    "all"
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<Set<string>>(new Set())
  const abortRef = useRef<AbortController | null>(null)
  const isMounted = useRef(false)

  const fetchApplications = useCallback(
    (signal: AbortSignal) => {
      setLoading(true)
      setError(null)

      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_LIMIT),
      }
      if (filterJobId) params.jobId = filterJobId
      if (filterStatus !== "all") params.status = filterStatus

      return loadApplications(signal, params)
        .then(data => {
          if (isMounted.current) {
            setApplications(data.applications)
            setTotal(data.total)
            setTotalPages(data.totalPages)
          }
        })
        .catch(err => {
          if (err instanceof DOMException && err.name === "AbortError") return
          if (isMounted.current) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load applications. Please try again."
            )
          }
        })
        .finally(() => {
          if (isMounted.current) setLoading(false)
        })
    },
    [page, filterJobId, filterStatus]
  )

  useEffect(() => {
    isMounted.current = true
    abortRef.current = new AbortController()

    let jobsCancelled = false
    fetchJobs()
      .then(js => {
        if (isMounted.current && !jobsCancelled) setJobs(js)
      })
      .catch(() => {
        // Non-fatal: the job filter simply shows no options
      })

    fetchApplications(abortRef.current.signal)

    return () => {
      isMounted.current = false
      jobsCancelled = true
      abortRef.current?.abort()
    }
  }, [fetchApplications])

  const refetch = () => {
    setError(null)
    abortRef.current = new AbortController()
    fetchApplications(abortRef.current.signal)
  }
  const clearFilters = () => {
    setFilterJobId("")
    setFilterStatus("all")
    setPage(1)
  }

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1)
  }

  const nextPage = () => {
    if (page < totalPages) setPage(p => p + 1)
  }

  const handleStatusChange = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    if (submitting.has(applicationId)) return
    setSubmitting(prev => new Set([...prev, applicationId]))
    try {
      const updated = await patchApplicationStatus(applicationId, status)
      setApplications(prev =>
        prev.map(app => (app._id === applicationId ? updated : app))
      )
      toast({ title: "Application status updated", type: "success" })
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Failed to update application status",
        type: "error",
      })
    } finally {
      setSubmitting(prev => {
        const next = new Set(prev)
        next.delete(applicationId)
        return next
      })
    }
  }

  const hasFilters = filterJobId !== "" || filterStatus !== "all"

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader
          title="Applications"
          subtitle="Review and manage applications submitted to your job posts."
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader
          title="Applications"
          subtitle="Review and manage applications submitted to your job posts."
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={refetch}
            className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Applications"
        subtitle="Review and manage applications submitted to your job posts."
      />

      {/* Filters */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Job
            </label>
            <select
              value={filterJobId}
              onChange={e => {
                setFilterJobId(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-2.5 px-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value as ApplicationStatus | "all")
                setPage(1)
              }}
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-2.5 px-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="all">All Statuses</option>
              {APPLICATION_STATUSES.map(s => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={refetch}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
            </button>
            <button
              onClick={clearFilters}
              disabled={!hasFilters}
              className={`flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium transition-all ${
                !hasFilters
                  ? "text-gray-500 opacity-50 cursor-not-allowed"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        {applications.length > 0 ? (
          <>
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">
                    Applicant
                  </th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">
                    Job & Company
                  </th>
                  <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-40">
                    Applied
                  </th>
                  <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-32">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-52">
                    Update Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {applications.map(app => {
                  const isSubmitting = submitting.has(app._id)
                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                    >
                      <td className="px-5 py-4 text-left min-w-0">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-white leading-tight truncate">
                            {app.seekerName ?? "—"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {app.seekerEmail ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-left min-w-0">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-white leading-tight truncate">
                            {app.jobTitle ?? "—"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {app.companyName ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center w-40 whitespace-nowrap">
                        <p className="text-xs font-medium text-white">
                          {formatDate(app.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center w-32">
                        <StatusBadge status={statusLabel(app.status)} />
                      </td>
                      <td className="px-5 py-4 text-right w-52">
                        <select
                          value={app.status}
                          onChange={e =>
                            handleStatusChange(
                              app._id,
                              e.target.value as ApplicationStatus
                            )
                          }
                          disabled={isSubmitting}
                          className={`w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-2 px-3 text-xs text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {APPLICATION_STATUSES.map(s => (
                            <option key={s} value={s}>
                              {statusLabel(s)}
                            </option>
                          ))}
                        </select>
                        {isSubmitting && (
                          <span className="text-[10px] text-gray-500 mt-1 block">
                            Updating...
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t border-white/10 pt-5 px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {Math.min((page - 1) * PAGE_LIMIT + 1, total)}
                </span>{" "}
                to <span className="font-semibold text-white">
                  {Math.min(page * PAGE_LIMIT, total)}
                </span>{" "}
                of <span className="font-semibold text-white">{total}</span>
                applications
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">
              {hasFilters
                ? "No applications match your filters"
                : "No applications yet"}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {hasFilters
                ? "Try adjusting the job or status filter to see more results."
                : "Applications will appear here when candidates apply to your job posts."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-block text-xs underline underline-offset-4 text-gray-400 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
