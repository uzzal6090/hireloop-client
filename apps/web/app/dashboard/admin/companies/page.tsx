"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Building2,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"

type CompanyStatus = "pending" | "approved" | "rejected" | "suspended"

interface Company {
  _id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  industry: string | null
  companySize: string | null
  location: string | null
  foundedYear: number | null
  ownerId: string
  ownerEmail?: string
  ownerName?: string
  status: CompanyStatus
  createdAt: string
  updatedAt: string
}

interface CompaniesResponse {
  success: true
  companies: Company[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusColors: Record<CompanyStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  suspended: "bg-gray-500/15 text-gray-400 border-gray-500/30",
}

const statusLabels: Record<CompanyStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
}

async function fetchCompanies(
  statusFilter: string | null,
  page: number,
  limit: number
): Promise<CompaniesResponse> {
  const params = new URLSearchParams()
  if (statusFilter) params.set("status", statusFilter)
  params.set("page", String(page))
  params.set("limit", String(limit))

  const res = await fetch(`/api/admin/companies?${params}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch companies")
  }
  return (await res.json()) as CompaniesResponse
}

async function updateCompanyStatus(
  companyId: string,
  status: CompanyStatus
): Promise<void> {
  const res = await fetch(`/api/admin/companies/${companyId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to update company status")
  }
}

export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approveDialog, setApproveDialog] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    fetchCompanies(statusFilter, page, limit)
      .then((data) => {
        if (!cancelled) {
          setCompanies(data.companies)
          setTotal(data.total)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load companies. Please try again.")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [statusFilter, page, limit])

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompanies(statusFilter, page, limit)
      setCompanies(data.companies)
      setTotal(data.total)
    } catch {
      setError("Failed to refresh companies. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.ownerEmail && c.ownerEmail.toLowerCase().includes(search.toLowerCase()))
  )

  const handleApprove = (id: string) => {
    setApproveDialog(id)
  }

  const handleReject = (id: string) => {
    setRejectDialog(id)
  }

  const handleConfirmApprove = async (id: string) => {
    setApproveDialog(null)
    setIsUpdating((prev) => new Set([...prev, id]))
    try {
      await updateCompanyStatus(id, "approved")
      await handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve company.")
    } finally {
      setIsUpdating((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleConfirmReject = async (id: string) => {
    setRejectDialog(null)
    setIsUpdating((prev) => new Set([...prev, id]))
    try {
      await updateCompanyStatus(id, "rejected")
      await handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject company.")
    } finally {
      setIsUpdating((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleCancel = (type: "approve" | "reject") => {
    if (type === "approve") setApproveDialog(null)
    if (type === "reject") setRejectDialog(null)
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader title="Manage Companies" subtitle="Review, approve, or reject company registrations." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading companies...</p>
          <button
            onClick={handleRefresh}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader title="Manage Companies" subtitle="Review, approve, or reject company registrations." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
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
        title="Manage Companies"
        subtitle="Review, approve, or reject company registrations."
      />

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or recruiter email..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <div className="relative sm:w-80">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            value={statusFilter ?? ""}
            onChange={(e) => {
              setStatusFilter(e.target.value || null)
              setPage(1)
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Total Companies</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-400">
            {filteredCompanies.filter((c) => c.status === "pending").length}
          </p>
        </div>
        <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">
            {filteredCompanies.filter((c) => c.status === "approved").length}
          </p>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Company Name</th>
              <th className="px-5 py-3 text-left font-semibold uppercase tracking-widest text-[11px] text-gray-500">Recruiter</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-32">Industry</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-28">Status</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Registered</th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                  <p className="text-gray-400 font-medium">No companies found</p>
                  <p className="text-xs text-gray-600 mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => {
                const companyUpdating = isUpdating.has(company._id)
                const statusColor = statusColors[company.status]
                return (
                  <tr
                    key={company._id}
                    className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                  >
                    <td className="px-5 py-4 text-left min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white leading-tight truncate">
                            {company.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {company.ownerEmail ?? company.ownerId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-left min-w-0">
                      <span className="text-xs text-gray-400 truncate">
                        {company.industry ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="text-xs text-gray-400">
                        {company.location ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className={`text-xs font-semibold ${statusColor}`}>
                        {statusLabels[company.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="text-xs text-gray-400">
                        {new Date(company.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right w-40 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(company._id)}
                          disabled={companyUpdating || company.status !== "pending"}
                          className={`flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(company._id)}
                          disabled={companyUpdating || company.status !== "pending"}
                          className={`flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isUpdating.size > 0}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isUpdating.size > 0}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Approve dialog */}
      {approveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => handleCancel("approve")} />
          <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-white mb-1">Approve Company</h3>
            <p className="text-sm text-gray-400 mb-6">
              Approving this company will make it publicly visible on HireLoop.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCancel("approve")}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmApprove(approveDialog)}
                disabled={isUpdating.has(approveDialog)}
                className={`flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => handleCancel("reject")} />
          <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-white mb-1">Reject Company</h3>
            <p className="text-sm text-gray-400 mb-6">
              Rejecting this company will remove it from public listings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCancel("reject")}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReject(rejectDialog)}
                disabled={isUpdating.has(rejectDialog)}
                className={`flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
