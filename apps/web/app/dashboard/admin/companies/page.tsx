"use client"

import { useState } from "react"
import {
  Search,
  Building2,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"

type CompanyStatus = "pending" | "approved" | "rejected"

interface CompanyRegistration {
  id: string
  name: string
  recruiterEmail: string
  industry: string
  status: CompanyStatus
  dateSubmitted: string
}

const companies: CompanyRegistration[] = [
  { id: "1", name: "Acme Corp", recruiterEmail: "mike@startup.io", industry: "Technology", status: "approved", dateSubmitted: "Oct 10, 2026" },
  { id: "2", name: "Stripe", recruiterEmail: "sarah@stripe.com", industry: "Finance", status: "approved", dateSubmitted: "Sep 15, 2026" },
  { id: "3", name: "Figma", recruiterEmail: "emma@figma.com", industry: "Design", status: "pending", dateSubmitted: "Nov 1, 2026" },
  { id: "4", name: "Cloudflare", recruiterEmail: "david@cloudflare.com", industry: "DevOps", status: "pending", dateSubmitted: "Oct 28, 2026" },
  { id: "5", name: "OpenAI", recruiterEmail: "lisa@openai.com", industry: "AI", status: "rejected", dateSubmitted: "Oct 20, 2026" },
  { id: "6", name: "Vercel", recruiterEmail: "alice@vercel.com", industry: "Developer Tools", status: "approved", dateSubmitted: "Sep 5, 2026" },
]

const statusColors: Record<CompanyStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
}

const statusLabels: Record<CompanyStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

export default function ManageCompaniesPage() {
  const [search, setSearch] = useState("")
  const [approveDialog, setApproveDialog] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<string | null>(null)

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.recruiterEmail.toLowerCase().includes(search.toLowerCase())
  )

  const handleApprove = (id: string) => {
    setApproveDialog(id)
  }

  const handleReject = (id: string) => {
    setRejectDialog(id)
  }

  const handleConfirm = (type: "approve" | "reject") => {
    if (type === "approve") setApproveDialog(null)
    if (type === "reject") setRejectDialog(null)
  }

  const handleCancel = (type: "approve" | "reject") => {
    if (type === "approve") setApproveDialog(null)
    if (type === "reject") setRejectDialog(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Manage Companies"
        subtitle="Review, approve, or reject company registrations."
      />

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by company name or recruiter email..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      {/* Companies Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Company Name</th>
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Recruiter Email</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-32">Industry</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-28">Status</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Submitted</th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredCompanies.map(company => (
              <tr key={company.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                <td className="px-5 py-4 text-left min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {company.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight truncate">{company.name}</p>
                      <p className="text-xs text-gray-400 truncate">{company.recruiterEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-left min-w-0">
                  <span className="text-xs text-gray-400 truncate">{company.recruiterEmail}</span>
                </td>
                <td className="px-5 py-4 text-center w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-xs text-gray-400">{company.industry}</span>
                </td>
                <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                  <StatusBadge status={company.status} />
                </td>
                <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-xs text-gray-400">{company.dateSubmitted}</span>
                </td>
                <td className="px-5 py-4 text-right w-36 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {(company.status === "pending" || company.status === "rejected") && (
                      <button
                        onClick={() => handleApprove(company.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Approve
                      </button>
                    )}
                    {(company.status === "pending" || company.status === "approved") && (
                      <button
                        onClick={() => handleReject(company.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all whitespace-nowrap"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

          {filteredCompanies.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No companies found</p>
              <p className="text-xs text-gray-600 mt-1">Try adjusting your search</p>
            </div>
          )}
        </tbody>
        </table>
      </div>

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
                onClick={() => handleConfirm("approve")}
                className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
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
                onClick={() => handleConfirm("reject")}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
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

