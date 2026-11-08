"use client"

import { useState } from "react"
import { Building2, MapPin, Users, Globe, FileText, Edit3, CheckCircle2, Clock, XCircle } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

// Simulate: company exists and is approved
const company = {
  name: "Acme Corp",
  logo: "A",
  logoColor: "from-indigo-600 to-purple-600",
  industry: "Technology",
  website: "https://acme.com",
  location: "San Francisco, USA",
  employeeCount: "51–200",
  description: "Acme Corp is a technology company building next-generation developer tools and infrastructure. We're on a mission to make software development faster, safer, and more enjoyable for teams worldwide.",
  status: "Approved" as "Approved" | "Pending" | "Rejected",
}

const statusIcon = {
  Approved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  Pending:  <Clock        className="h-4 w-4 text-yellow-400" />,
  Rejected: <XCircle      className="h-4 w-4 text-red-400"    />,
}

export default function MyCompanyPage() {
  const [hasCompany] = useState(true)

  if (!hasCompany) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SectionHeader title="My Company" subtitle="Register your company to start posting jobs." />
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
        title="My Company"
        subtitle="Your registered company profile."
        action={
          <Link href="/dashboard/recruiter/company/new">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              <Edit3 className="h-4 w-4" /> Edit Company
            </button>
          </Link>
        }
      />

      {/* Company card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Logo */}
          <div className={`h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br ${company.logoColor} flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white/10`}>
            {company.logo}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{company.name}</h2>
              <div className="flex items-center gap-1.5">
                {statusIcon[company.status]}
                <StatusBadge status={company.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-gray-500" />{company.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-500" />{company.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-500" />{company.employeeCount} employees
              </span>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                <Globe className="h-4 w-4 text-gray-500" />{company.website.replace("https://", "")}
              </a>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{company.description}</p>
          </div>
        </div>
      </div>

      {/* Status info banner */}
      {company.status === "Approved" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">Company Approved</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">Your company is publicly visible and you can post jobs.</p>
          </div>
        </div>
      )}
      {company.status === "Pending" && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Awaiting Admin Review</p>
            <p className="text-xs text-yellow-400/70 mt-0.5">Your company registration is pending approval. This usually takes 24–48 hours.</p>
          </div>
        </div>
      )}
      {company.status === "Rejected" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Company Registration Rejected</p>
            <p className="text-xs text-red-400/70 mt-0.5">Please update your company info and resubmit for review.</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
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

