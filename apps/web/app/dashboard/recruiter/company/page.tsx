"use client"

import React, { useEffect, useState } from "react"
import {
  Building2,
  MapPin,
  Users,
  Globe,
  FileText,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Plus,
  ShieldCheck,
  Target,
  Mail,
  Phone,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@workspace/ui/components/toast"
import { Button } from "@workspace/ui/components/button"

type CompanyStatus = "pending" | "approved" | "rejected" | "suspended"

interface Company {
  _id: string
  name: string
  slug: string
  description: string
  logo: string | null
  website: string | null
  industry: string | null
  companySize: string | null
  location: string | null
  foundedYear: number | null
  ownerId: string
  status: CompanyStatus
  createdAt: string
  updatedAt: string
}

interface CompaniesResponse {
  success: true
  companies: Company[]
}

const statusIcon: Record<string, React.ReactNode> = {
  Approved: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
  Pending: <Clock className="h-4 w-4 text-yellow-400" />,
  Rejected: <XCircle className="h-4 w-4 text-red-400" />,
  Suspended: <XCircle className="h-4 w-4 text-red-400" />,
}

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
}

async function fetchMyCompanies(): Promise<Company[]> {
  const res = await fetch("/api/companies", { cache: "no-store" })
  if (!res.ok) {
    return []
  }
  const data = (await res.json()) as CompaniesResponse
  return data.companies ?? []
}

function calculateProfileCompletion(company: Company): number {
  const fields = [
    company.name,
    company.description,
    company.logo,
    company.website,
    company.industry,
    company.companySize,
    company.location,
    company.foundedYear ? String(company.foundedYear) : null,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export default function MyCompanyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchMyCompanies()
      .then((cs) => {
        if (!cancelled) {
          setCompanies(cs)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load your companies. Please try again.")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const cs = await fetchMyCompanies()
      setCompanies(cs)
    } catch {
      setError("Failed to load your companies. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 px-6 py-12">
        <SectionHeader title="My Companies" subtitle="Your registered company profiles." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading your companies...</p>
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
      <div className="max-w-5xl mx-auto space-y-8 px-6 py-12">
        <SectionHeader title="My Companies" subtitle="Your registered company profiles." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <Button
            onClick={handleRefresh}
            className="w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 px-6 py-12">
        <SectionHeader
          title="My Companies"
          subtitle="Register your company to start posting jobs."
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-5">
          <Building2 className="mx-auto h-14 w-14 text-gray-600" />
          <div>
            <p className="text-lg font-semibold text-white">No company registered yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Register your company to start posting jobs on HireLoop.
            </p>
          </div>
          <Link href="/dashboard/recruiter/company/new">
            <Button
              className="w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" /> Register Company
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-6 py-12">
      <SectionHeader
        title="My Companies"
        subtitle="Manage your registered company profiles."
        action={
          <Link href="/dashboard/recruiter/company/new?new=true">
            <Button
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> Register Another Company
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Cards */}
        <div className="lg:col-span-2 space-y-6">
          {companies.map((company) => {
            const displayStatus = statusLabel[company.status] ?? company.status
            const completion = calculateProfileCompletion(company)
            const logoText = company.name.charAt(0).toUpperCase()

            return (
              <div
                key={company._id}
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-colors"
              >
                {/* Company Header */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/10">
                    {logoText}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-white">{company.name}</h2>
                      <div className="flex items-center gap-1.5">
                        {statusIcon[displayStatus]}
                        <StatusBadge status={displayStatus} />
                      </div>
                    </div>

                    {/* Profile Completion */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase">
                          Profile Completion
                        </span>
                        <span className="text-xs font-medium text-white">
                          {completion}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            completion === 100
                              ? "bg-emerald-500"
                              : completion >= 75
                              ? "bg-blue-500"
                              : completion >= 50
                              ? "bg-yellow-500"
                              : "bg-gradient-to-r from-indigo-500 to-purple-500"
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-gray-500" />{" "}
                        {company.industry ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-500" />{" "}
                        {company.location ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-500" />{" "}
                        {company.companySize ?? "—"} employees
                      </span>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                        >
                          <Globe className="h-4 w-4 text-gray-500" />{" "}
                          {company.website
                            .replace("https://", "")
                            .replace("http://", "")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                      About
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {company.description}
                    </p>
                  </div>
                )}

                {/* Status Details */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
                  {company.status === "approved" && (
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-400">
                          Company Approved
                        </p>
                        <p className="text-xs text-gray-400">
                          Your company is verified and can post jobs.
                        </p>
                      </div>
                    </div>
                  )}
                  {company.status === "pending" && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-yellow-400">
                          Awaiting Admin Review
                        </p>
                        <p className="text-xs text-gray-400">
                          Your company registration is under review.
                        </p>
                      </div>
                    </div>
                  )}
                  {company.status === "rejected" && (
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-red-400">
                          Registration Rejected
                        </p>
                        <p className="text-xs text-gray-400">
                          Your company registration was not approved.
                        </p>
                      </div>
                    </div>
                  )}
                  {company.status === "suspended" && (
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-red-400">
                          Suspended
                        </p>
                        <p className="text-xs text-gray-400">
                          Your company account has been suspended.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Action */}
                <div className="pt-4 border-t border-white/10">
                  <Link href={`/dashboard/recruiter/company/new?companyId=${company._id}`}>
                    <Button
                      variant="outline"
                      className="w-auto rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Edit3 className="h-4 w-4 mr-2" /> Edit Company
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar: Quick Actions & Summary */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/recruiter/jobs"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>Manage Jobs</span>
              </Link>
              <Link
                href="/dashboard/recruiter/jobs/new"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
              >
                <Building2 className="h-4 w-4 shrink-0 text-purple-400" />
                <span>Post a New Job</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Total Companies
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{companies.length}</p>
                <p className="text-xs text-gray-400">
                  registered company profiles
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
          </div>

          {companies.some((c) => c.status === "pending") && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Verification Status
              </h2>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-yellow-400" />
                <div>
                  <p className="text-xs font-semibold text-yellow-400">
                    Pending Review
                  </p>
                  <p className="text-xs text-gray-400">
                    A company registration is awaiting admin approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
