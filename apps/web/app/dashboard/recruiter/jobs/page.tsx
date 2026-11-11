"use client"

import { useEffect, useState } from "react"
import {
  FileText,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  Plus,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

type JobStatus = "draft" | "pending" | "published" | "closed" | "rejected"

interface Job {
  _id: string
  title: string
  slug: string
  description: string
  companyId: string
  recruiterId: string
  employmentType: string
  workplaceType: string
  location: string | null
  salary: string | null
  experienceLevel: string | null
  skills: string[]
  category: string | null
  status: JobStatus
  applicationDeadline: string | null
  createdAt: string
  updatedAt: string
  companyName: string | null
}

interface JobsResponse {
  success: true
  jobs: Job[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Closed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  Draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/30",
}

const displayStatus: Record<JobStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  published: "Active",
  closed: "Closed",
  rejected: "Rejected",
}

const badgeStatus: Record<JobStatus, string> = {
  draft: "draft",
  pending: "pending",
  published: "active",
  closed: "closed",
  rejected: "rejected",
}

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

const activePlanLimit = 10

async function fetchJobs(): Promise<Job[]> {
  const res = await fetch("/api/jobs?limit=100", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch jobs")
  }
  const data = (await res.json()) as JobsResponse
  return data.jobs
}

async function patchJobStatus(jobId: string, status: JobStatus): Promise<void> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    let message = "Failed to update job status"
    try {
      const data = await res.json()
      if (data.error) {
        message = data.error
      }
    } catch {
      // Use default message if body is not valid JSON
    }
    throw new Error(message)
  }
}

async function deleteJobApi(jobId: string): Promise<void> {
  const res = await fetch(`/api/jobs/${jobId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete job")
  }
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    fetchJobs()
      .then((data) => {
        if (!cancelled) {
          setJobs(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load your jobs. Please try again.")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const refreshJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJobs()
      setJobs(data)
    } catch {
      setError("Failed to load your jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (job: Job) => {
    const status = job.status as string
    const isPublished = status === "published" || status === "active"
    const targetStatus: JobStatus = isPublished ? "closed" : "published"

    setIsSubmitting((prev) => new Set([...prev, job._id]))
    try {
      await patchJobStatus(job._id, targetStatus)
      await refreshJobs()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update job status. Please try again."
      )
    } finally {
      setIsSubmitting((prev) => {
        const next = new Set(prev)
        next.delete(job._id)
        return next
      })
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return
    setIsSubmitting((prev) => new Set([...prev, deleteConfirmId]))
    try {
      await deleteJobApi(deleteConfirmId)
      setDeleteConfirmId(null)
      await refreshJobs()
    } catch {
      setError("Failed to delete job. Please try again.")
    } finally {
      setIsSubmitting((prev) => {
        const next = new Set(prev)
        next.delete(deleteConfirmId)
        return next
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const activeJobsCount = jobs.filter((j) => (j.status as string) === "published" || (j.status as string) === "active").length
  const isAtLimit = activeJobsCount >= activePlanLimit

  const jobRows = jobs.map((job) => {
    const ds = displayStatus[job.status]
    const isSubmittingJob = isSubmitting.has(job._id)

    return (
      <tr key={job._id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
        <td className="px-5 py-4 text-left min-w-0">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {job.title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {job.companyName ?? "—"} &middot; {job.category ?? "—"} &middot; {job.employmentType}
            </p>
          </div>
        </td>
        <td className="px-5 py-4 text-center w-24">
          <StatusBadge status={(badgeStatus as Record<string, string>)[job.status] ?? "active"} />
        </td>
        <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-xs font-medium text-white">—</span>
        </td>
        <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
        </td>
        <td className="px-5 py-4 text-right w-40">
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Link href="/dashboard/recruiter/applications">
              <button
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <ExternalLink className="h-3 w-3" /> Applicants
              </button>
            </Link>
            {(job.status as string) === "published" || (job.status as string) === "active" ? (
              <button
                onClick={() => handleToggleStatus(job)}
                disabled={isSubmittingJob}
                className={`flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-yellow-400 hover:bg-white/5 hover:text-yellow-400 transition-all ${
                  isSubmittingJob ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Clock className="h-3 w-3" /> Close
              </button>
            ) : job.status === "closed" ? (
              <button
                onClick={() => handleToggleStatus(job)}
                disabled={isSubmittingJob}
                className={`flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-white/5 hover:text-emerald-400 transition-all ${
                  isSubmittingJob ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <CheckCircle2 className="h-3 w-3" /> Reopen
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus(job)}
                disabled={isSubmittingJob}
                className={`flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all ${
                  isSubmittingJob ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Publish
              </button>
            )}
            <button
              onClick={() => handleDelete(job._id)}
              disabled={isSubmittingJob}
              className={`rounded-lg border border-white/10 p-2 text-gray-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all ${
                isSubmittingJob ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    )
  })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader
          title="Manage Jobs"
          subtitle="View and manage all your job posts."
          action={
            <Link href="/dashboard/recruiter/jobs/new">
              <button className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:-translate-y-0.5 hover:shadow-purple-500/30">
                <Plus className="h-4 w-4" /> Post New Job
              </button>
            </Link>
          }
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader
          title="Manage Jobs"
          subtitle="View and manage all your job posts."
          action={
            <Link href="/dashboard/recruiter/jobs/new">
              <button className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:-translate-y-0.5 hover:shadow-purple-500/30">
                <Plus className="h-4 w-4" /> Post New Job
              </button>
            </Link>
          }
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={refreshJobs}
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
        title="Manage Jobs"
        subtitle="View and manage all your job posts."
        action={
          <Link href="/dashboard/recruiter/jobs/new">
            <button
              disabled={isAtLimit}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${
                isAtLimit
                  ? "bg-gray-600 cursor-not-allowed hover:shadow-none"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:-translate-y-0.5 hover:shadow-purple-500/30"
              }`}
            >
              <Plus className="h-4 w-4" /> Post New Job
              {isAtLimit ? " (Limit Reached)" : ""}
            </button>
          </Link>
        }
      />

      {/* Plan usage indicator */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <FileText className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Active Job Posts Used
            </p>
            <p className="text-xs text-gray-500">
              {activeJobsCount} of {activePlanLimit} active posts on your plan
            </p>
          </div>
        </div>
        <div className="flex-1 max-w-md mx-6">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full ${
                activeJobsCount / activePlanLimit >= 1
                  ? "w-full bg-red-500"
                  : `w-[${(activeJobsCount / activePlanLimit) * 100}%] bg-gradient-to-r from-indigo-500 to-purple-500`
              } rounded-full`}
            />
          </div>
          <p className="text-[11px] text-gray-500 text-right mt-1">
            {activeJobsCount} / {activePlanLimit} used
          </p>
        </div>
        {isAtLimit && <StatusBadge status="suspended" />}
      </div>

      {/* Jobs table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">
                Job Title
              </th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">
                Status
              </th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">
                Applicants
              </th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">
                Posted
              </th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">{jobRows}</tbody>
        </table>

        {jobs.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No jobs posted yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Try adjusting your search or clearing filters
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelDelete}
          />
          <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-white mb-1">
              Delete Job Post
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this job post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
