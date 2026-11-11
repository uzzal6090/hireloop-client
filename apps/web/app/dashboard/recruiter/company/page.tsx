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
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  Approved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
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

export default function MyCompanyPage() {
  const router = useRouter()
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
      <div className="max-w-2xl mx-auto space-y-6">
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
      <div className="max-w-2xl mx-auto space-y-6">
        <SectionHeader title="My Companies" subtitle="Your registered company profiles." />
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

  if (companies.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SectionHeader
          title="My Companies"
          subtitle="Register your company to start posting jobs."
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-5">
          <Building2 className="mx-auto h-14 w-14 text-gray-600" />
          <div>
            <p className="text-lg font-semibold text-white">No company registered yet</p>
            <p className="text-sm text-gray-400 mt-1">Register your company to start posting jobs on HireLoop.</p>
          </div>
          <Link href="/dashboard/recruiter/company/new">
            <button className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
              Register Company
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SectionHeader
        title="My Companies"
        subtitle="Manage your registered company profiles."
        action={
          <Link href="/dashboard/recruiter/company/new?new=true">
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
              <Plus className="h-4 w-4" /> Register Another Company
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((company) => {
          const displayStatus = statusLabel[company.status] ?? company.status
          const logoText = company.name.charAt(0).toUpperCase()

          return (
            <div key={company._id} className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div
                  className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/10"
                >
                  {logoText}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{company.name}</h2>
                    <div className="flex items-center gap-1.5">
                      {statusIcon[displayStatus]}
                      <StatusBadge status={displayStatus} />
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
                  <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                    {company.description ?? "No description provided."}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/dashboard/recruiter/company/new?companyId=${company._id}`}>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
                {company.status === "approved" && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <p className="text-xs font-semibold text-emerald-400">
                      Company Approved
                    </p>
                  </div>
                )}
                {company.status === "pending" && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
                    <p className="text-xs font-semibold text-yellow-400">
                      Awaiting Admin Review
                    </p>
                  </div>
                )}
                {company.status === "rejected" && (
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-xs font-semibold text-red-400">
                      Registration Rejected
                    </p>
                  </div>
                )}
                {company.status === "suspended" && (
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-xs font-semibold text-red-400">
                      Suspended
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/recruiter/jobs">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center gap-4 hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Manage Jobs</p>
              <p className="text-xs text-gray-500">View and manage all your job posts</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/recruiter/jobs/new">
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 flex items-center gap-4 hover:border-purple-500/40 transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Post a New Job</p>
              <p className="text-xs text-gray-500">Create a new job listing</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
