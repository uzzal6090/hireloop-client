"use client"

import { useState } from "react"
import {
  FileText,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  Plus,
  ChevronRight,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Closed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  Draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
}

const jobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Acme Corp",
    status: "Active" as const,
    applicants: 42,
    datePosted: "Nov 5, 2026",
    category: "Engineering",
    type: "Full-time",
    salary: "$120-160K/yr",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Acme Corp",
    status: "Active" as const,
    applicants: 28,
    datePosted: "Oct 28, 2026",
    category: "Design",
    type: "Remote",
    salary: "$100-140K/yr",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "Acme Corp",
    status: "Closed" as const,
    applicants: 19,
    datePosted: "Oct 15, 2026",
    category: "DevOps",
    type: "Full-time",
    salary: "$110-150K/yr",
  },
  {
    id: "4",
    title: "Backend Engineer",
    company: "Acme Corp",
    status: "Draft" as const,
    applicants: 0,
    datePosted: "Nov 8, 2026",
    category: "Engineering",
    type: "Remote",
    salary: "$90-130K/yr",
  },
]

const activePlanLimit = 10

export default function ManageJobsPage() {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [closedJobs, setClosedJobs] = useState<Set<string>>(new Set())

  const handleToggleStatus = (id: string) => {
    const job = jobs.find((j) => j.id === id)
    if (!job) return
    if (job.status === "Active") {
      setClosedJobs((prev) => new Set([...prev, id]))
    } else if (job.status === "Closed") {
      setClosedJobs((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = () => {
    setDeleteConfirmId(null)
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const activeJobsCount = jobs.filter((j) => j.status === "Active").length
  const isAtLimit = activeJobsCount >= activePlanLimit

  // Pre-compute job rows to avoid nested { } in JSX
  const jobRows = jobs.map((job) => {
    const isClosed = closedJobs.has(job.id)
    const displayStatus = isClosed ? "Closed" : job.status

    return (
      <tr key={job.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
        <td className="px-5 py-4 text-left min-w-0">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {job.title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {job.company} &middot; {job.category} &middot; {job.type}
            </p>
          </div>
        </td>
        <td className="px-5 py-4 text-center w-24">
          <StatusBadge status={displayStatus} />
        </td>
        <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-xs font-medium text-white">
            {job.applicants}
          </span>
        </td>
        <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="text-xs text-gray-400">{job.datePosted}</span>
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
            {job.status === "Active" ? (
              <button
                onClick={() => handleToggleStatus(job.id)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-yellow-400 hover:bg-white/5 hover:text-yellow-400 transition-all"
              >
                <Clock className="h-3 w-3" /> Close
              </button>
            ) : job.status === "Closed" ? (
              <button
                onClick={() => handleToggleStatus(job.id)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-white/5 hover:text-emerald-400 transition-all"
              >
                <CheckCircle2 className="h-3 w-3" /> Reopen
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus(job.id)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                Publish
              </button>
            )}
            <button
              onClick={() => handleDelete(job.id)}
              className="rounded-lg border border-white/10 p-2 text-gray-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    )
  })

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
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
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
