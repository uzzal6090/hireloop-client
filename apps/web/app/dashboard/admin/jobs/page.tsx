"use client"

import { useState } from "react"
import {
  Search,
  Briefcase,
  Building2,
  Clock,
  XCircle,
  Filter,
  ChevronRight,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

type JobStatus = "active" | "closed"
type JobCategory = "engineering" | "design" | "product" | "marketing" | "devops" | "data" | "sales"

interface JobPost {
  id: string
  title: string
  company: string
  category: JobCategory
  type: string
  datePosted: string
  status: JobStatus
}

const jobs: JobPost[] = [
  { id: "1", title: "Senior Frontend Developer", company: "Acme Corp", category: "engineering", type: "Full-time", datePosted: "Nov 5, 2026", status: "active" },
  { id: "2", title: "Product Designer", company: "Figma", category: "design", type: "Remote", datePosted: "Oct 28, 2026", status: "active" },
  { id: "3", title: "DevOps Engineer", company: "Cloudflare", category: "devops", type: "Full-time", datePosted: "Oct 15, 2026", status: "closed" },
  { id: "4", title: "Backend Engineer", company: "Stripe", category: "engineering", type: "Remote", datePosted: "Nov 8, 2026", status: "active" },
  { id: "5", title: "Growth Marketing Manager", company: "Linear", category: "marketing", type: "Hybrid", datePosted: "Oct 20, 2026", status: "closed" },
  { id: "6", title: "Data Analyst", company: "Databricks", category: "data", type: "Full-time", datePosted: "Oct 10, 2026", status: "active" },
  { id: "7", title: "UX Designer", company: "Adobe", category: "design", type: "Full-time", datePosted: "Sep 25, 2026", status: "active" },
  { id: "8", title: "Sales Executive", company: "HubSpot", category: "sales", type: "Full-time", datePosted: "Sep 10, 2026", status: "closed" },
]

const categoryLabels: Record<JobCategory, string> = {
  engineering: "Engineering",
  design: "Design",
  product: "Product",
  marketing: "Marketing",
  devops: "DevOps",
  data: "Data",
  sales: "Sales",
}

const statusLabels: Record<JobStatus, string> = {
  active: "Active",
  closed: "Closed",
}

export default function ManageJobsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<JobCategory | "all">("all")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredJobs = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || j.status === statusFilter
    const matchCategory = categoryFilter === "all" || j.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = () => {
    setDeleteConfirmId(null)
  }

  const handleCancelDelete = () => {
    setDeleteConfirmId(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Manage Jobs"
        subtitle="Search, filter, and manage all job posts across the platform."
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <div className="relative sm:w-64">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as JobStatus | "all")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="relative sm:w-64">
          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as JobCategory | "all")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all text-white"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key as JobCategory}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Job Title</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-28">Category</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Type</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Posted</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-32">Status</th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredJobs.map(job => (
              <tr key={job.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                <td className="px-5 py-4 text-left min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight truncate">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.company}</p>
                </td>
                <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-xs text-gray-400">{categoryLabels[job.category]}</span>
                </td>
                <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-xs text-gray-400">{job.type}</span>
                </td>
                <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-xs text-gray-400">{job.datePosted}</span>
                </td>
                <td className="px-5 py-4 text-center w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-5 py-4 text-right w-40 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link href={`/jobs/${job.id}`}>
                      <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">
                        <ChevronRight className="h-3 w-3" /> View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="rounded-lg border border-white/10 p-2 text-gray-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredJobs.length === 0 && (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No jobs found</p>
            <p className="text-xs text-gray-600 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelDelete} />
          <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-white mb-1">Delete Job Post</h3>
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

