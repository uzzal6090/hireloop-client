import { headers } from "next/headers"
import { requireRole } from "@/lib/auth-server"
import { StatCard, SectionHeader, StatusBadge } from "../components/ui"
import Link from "next/link"
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Building2,
  Globe,
  Clock,
  FileText,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { ApplicantsPerJobChart } from "@/components/recruiter/applicants-per-job-chart"

interface DashboardStats {
  totalJobs: number
  totalApplications: number
  activeJobs: number
  closedJobs: number
}

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
  status: string
}

interface SubscriptionData {
  subscription: {
    id: string
    userId: string
    planId: string
    planName: string
    jobLimit: number
    status: string
  }
  usage: {
    activeJobs: number
    jobLimit: number
    remainingJobs: number
  }
}

interface ApplicationItem {
  _id: string
  seekerId: string
  seekerName: string | null
  seekerEmail: string | null
  jobId: string
  jobTitle: string | null
  companyId: string
  companyName: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface JobStat {
  jobId: string
  jobTitle: string
  applicantCount: number
}

interface FetchResult<T> {
  data: T | null
  error: string | null
}

function getBaseUrl(headersList: Headers): string {
  const host = headersList.get("host") ?? "localhost:3000"
  const proto = headersList.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

async function fetchWithAuth(headersList: Headers, path: string): Promise<Response> {
  const baseUrl = getBaseUrl(headersList)
  return fetch(`${baseUrl}${path}`, {
    headers: headersList,
    cache: "no-store",
  })
}

async function checkOk(res: Response, label: string): Promise<void> {
  if (!res.ok) {
    throw new Error(`Failed to fetch ${label}: HTTP ${res.status}`)
  }
}

async function fetchStats(
  headersList: Headers
): Promise<FetchResult<DashboardStats>> {
  try {
    const [jobsRes, applicationsRes, activeJobsRes, closedJobsRes] =
      await Promise.all([
        fetchWithAuth(headersList, "/api/jobs?limit=1"),
        fetchWithAuth(headersList, "/api/recruiter/applications?limit=1"),
        fetchWithAuth(headersList, "/api/jobs?status=published&limit=1"),
        fetchWithAuth(headersList, "/api/jobs?status=closed&limit=1"),
      ])

    await checkOk(jobsRes, "jobs")
    await checkOk(applicationsRes, "applications")
    await checkOk(activeJobsRes, "active jobs")
    await checkOk(closedJobsRes, "closed jobs")

    const jobsData = (await jobsRes.json()) as { success?: boolean; total?: number }
    const applicationsData = (await applicationsRes.json()) as {
      success?: boolean
      total?: number
    }
    const activeJobsData = (await activeJobsRes.json()) as {
      success?: boolean
      total?: number
    }
    const closedJobsData = (await closedJobsRes.json()) as {
      success?: boolean
      total?: number
    }

    if (!jobsData.success) {
      return { data: null, error: "Jobs API returned unsuccessful response" }
    }
    if (!applicationsData.success) {
      return { data: null, error: "Applications API returned unsuccessful response" }
    }
    if (!activeJobsData.success) {
      return { data: null, error: "Active jobs API returned unsuccessful response" }
    }
    if (!closedJobsData.success) {
      return { data: null, error: "Closed jobs API returned unsuccessful response" }
    }

    return {
      data: {
        totalJobs: jobsData.total ?? 0,
        totalApplications: applicationsData.total ?? 0,
        activeJobs: activeJobsData.total ?? 0,
        closedJobs: closedJobsData.total ?? 0,
      },
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load statistics",
    }
  }
}

async function fetchCompanies(
  headersList: Headers
): Promise<FetchResult<Company[]>> {
  try {
    const res = await fetchWithAuth(headersList, "/api/companies")
    if (!res.ok) {
      return { data: null, error: `Failed to load companies: HTTP ${res.status}` }
    }
    const data = (await res.json()) as {
      success?: boolean
      companies?: Company[]
    }
    if (!data.success || !data.companies) {
      return { data: [], error: null }
    }
    return { data: data.companies, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load companies",
    }
  }
}

async function fetchSubscription(
  headersList: Headers
): Promise<FetchResult<SubscriptionData>> {
  try {
    const res = await fetchWithAuth(headersList, "/api/recruiter/subscription")
    if (!res.ok) {
      return { data: null, error: `Failed to load subscription: HTTP ${res.status}` }
    }
    const data = (await res.json()) as {
      success?: boolean
      subscription?: SubscriptionData["subscription"]
      usage?: SubscriptionData["usage"]
    }
    if (!data.success || !data.subscription || !data.usage) {
      return { data: null, error: null }
    }
    return { data: { subscription: data.subscription, usage: data.usage }, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load subscription",
    }
  }
}

async function fetchRecentApplications(
  headersList: Headers,
  startDate?: string,
  endDate?: string
): Promise<FetchResult<ApplicationItem[]>> {
  try {
    const params = new URLSearchParams({ limit: "5" })
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    const res = await fetchWithAuth(
      headersList,
      `/api/recruiter/applications?${params.toString()}`
    )
    if (!res.ok) {
      return {
        data: null,
        error: `Failed to load applications: HTTP ${res.status}`,
      }
    }
    const data = (await res.json()) as {
      success?: boolean
      applications?: ApplicationItem[]
    }
    if (!data.success || !data.applications) {
      return { data: [], error: null }
    }
    return { data: data.applications, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load applications",
    }
  }
}

async function fetchJobApplicationStats(
  headersList: Headers,
  startDate?: string,
  endDate?: string
): Promise<FetchResult<JobStat[]>> {
  try {
    const params = new URLSearchParams()
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    const res = await fetchWithAuth(
      headersList,
      `/api/recruiter/applications/stats?${params.toString()}`
    )
    if (!res.ok) {
      return {
        data: null,
        error: `Failed to load application stats: HTTP ${res.status}`,
      }
    }
    const data = (await res.json()) as {
      success?: boolean
      stats?: JobStat[]
    }
    if (!data.success || !data.stats) {
      return { data: [], error: null }
    }
    return { data: data.stats, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load chart data",
    }
  }
}

function SectionError({
  message,
  retryUrl,
}: {
  message: string
  retryUrl: string
}) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
      <div className="flex items-start gap-3">
        <ArrowRight className="h-5 w-5 text-red-400 shrink-0" />
        <div>
          <p className="text-sm text-red-400">{message}</p>
          <Link
            href={retryUrl}
            className="mt-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function RecruiterHomePage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}) {
  const headersList = await headers()
  const params = await searchParams
  const startDate = params.startDate
  const endDate = params.endDate

  // Validate date range: startDate cannot be after endDate
  let dateRangeError: string | null = null
  if (startDate && endDate && startDate > endDate) {
    dateRangeError =
      "Start date cannot be after end date. Please select a valid range."
  }

  let session
  try {
    session = await requireRole("recruiter")
  } catch {
    return (
      <div className="max-w-6xl mx-auto space-y-8 px-6 py-12">
        <SectionHeader title="Unauthorized" />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <p className="text-sm text-red-400">
            You do not have access to this page. Recruiter role required.
          </p>
        </div>
      </div>
    )
  }

  // Fetch all sections independently — one failure does not break others.
  // Skip date-dependent fetches if date range is invalid.
  const applicationsFetch = dateRangeError
    ? Promise.resolve({ data: null, error: dateRangeError })
    : fetchRecentApplications(headersList, startDate, endDate)
  const jobStatsFetch = dateRangeError
    ? Promise.resolve({ data: null, error: dateRangeError })
    : fetchJobApplicationStats(headersList, startDate, endDate)

  const [statsResult, companiesResult, subscriptionResult, applicationsResult, jobStatsResult] =
    await Promise.all([
      fetchStats(headersList),
      fetchCompanies(headersList),
      fetchSubscription(headersList),
      applicationsFetch,
      jobStatsFetch,
    ])

  const remainingJobs = subscriptionResult.data?.usage.remainingJobs ?? 0
  const jobLimit = subscriptionResult.data?.usage.jobLimit ?? 0
  const activeJobs = subscriptionResult.data?.usage.activeJobs ?? 0
  const progressPercent =
    jobLimit && jobLimit > 0
      ? Math.min(100, Math.max(0, (activeJobs / jobLimit) * 100))
      : 0
  const isAtLimit = remainingJobs <= 0

  const statusColor: Record<string, string> = {
    applied: "text-blue-400",
    "under_review": "text-yellow-400",
    shortlisted: "text-purple-400",
    rejected: "text-red-400",
    offered: "text-emerald-400",
    accepted: "text-emerald-400",
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title="Recruiter Overview"
        subtitle="Monitor your job postings and incoming applications."
      />

      {/* Statistics */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Overview
        </h2>
        {statsResult.error ? (
          <SectionError
            message={statsResult.error}
            retryUrl="/dashboard/recruiter"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/recruiter/jobs"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-white/20 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
            >
              <StatCard
                label="Total Job Posts"
                value={statsResult.data!.totalJobs}
                icon={Briefcase}
                iconColor="text-indigo-400"
                iconBg="bg-indigo-500/10"
              />
            </Link>
            <Link
              href="/dashboard/recruiter/applications"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-white/20 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
            >
              <StatCard
                label="Total Applicants"
                value={statsResult.data!.totalApplications}
                icon={Users}
                iconColor="text-purple-400"
                iconBg="bg-purple-500/10"
              />
            </Link>
            <Link
              href="/dashboard/recruiter/jobs?status=published"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-white/20 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
            >
              <StatCard
                label="Active Jobs"
                value={statsResult.data!.activeJobs}
                icon={CheckCircle2}
                iconColor="text-emerald-400"
                iconBg="bg-emerald-500/10"
              />
            </Link>
            <Link
              href="/dashboard/recruiter/jobs?status=closed"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-white/20 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
            >
              <StatCard
                label="Jobs Closed"
                value={statsResult.data!.closedJobs}
                icon={XCircle}
                iconColor="text-gray-400"
                iconBg="bg-gray-500/10"
              />
            </Link>
          </div>
        )}
      </div>

      {/* Job Usage Progress */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Job Usage Progress
        </h2>
        {subscriptionResult.error ? (
          <SectionError
            message={subscriptionResult.error}
            retryUrl="/dashboard/recruiter"
          />
        ) : subscriptionResult.data ? (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-300">Published Jobs</span>
                <span className="text-sm font-bold text-white">
                  {activeJobs} / {jobLimit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressPercent >= 100 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 text-right mt-1">
                {progressPercent.toFixed(0)}%
              </p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Remaining Slots
                </p>
                <p className={`text-sm font-bold ${isAtLimit ? "text-red-400" : "text-emerald-400"}`}>
                  {remainingJobs}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Current Plan
                </p>
                <p className="text-sm font-bold text-white">
                  {subscriptionResult.data.subscription.planName}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <FileText className="h-12 w-12 text-gray-600" />
            <p className="text-sm text-gray-400">No subscription data available.</p>
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <form method="get" action="/dashboard/recruiter">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4 gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={startDate ?? ""}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={endDate ?? ""}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:mt-0 mt-4">
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all"
              >
                Apply Filter
              </button>
              <Link
                href="/dashboard/recruiter"
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Clear Filter
              </Link>
            </div>
          </div>
          {dateRangeError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{dateRangeError}</p>
            </div>
          )}
        </form>
      </div>

      {/* Applicants per Job Chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Applicants per Job
        </h2>
        {jobStatsResult.error ? (
          <SectionError
            message={jobStatsResult.error}
            retryUrl="/dashboard/recruiter"
          />
        ) : (
          <ApplicantsPerJobChart jobStats={jobStatsResult.data ?? []} />
        )}
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Recent Applications
          </h2>
          <Link href="/dashboard/recruiter/applications">
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
              View All
            </button>
          </Link>
        </div>

        {applicationsResult.error ? (
          <SectionError
            message={applicationsResult.error}
            retryUrl="/dashboard/recruiter"
          />
        ) : applicationsResult.data && applicationsResult.data.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <FileText className="h-12 w-12 text-gray-600" />
            <p className="text-sm text-gray-400">No applications yet.</p>
            <p className="text-xs text-gray-500">
              Applications from candidates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicationsResult.data!.map((app) => (
              <Link
                key={app._id}
                href={`/dashboard/recruiter/applications?jobId=${app.jobId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {app.seekerName?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {app.seekerName || "Unknown Applicant"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Applied to{" "}
                    <span className="text-gray-400">{app.jobTitle || "Unknown Job"}</span>
                  </p>
                  {app.companyName && (
                    <p className="text-xs text-gray-500">
                      at {app.companyName}
                    </p>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <StatusBadge status={app.status} />
                  <ArrowRight className="h-3 w-3 text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Company Overview */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Company Overview
          </h2>
          {companiesResult.data && companiesResult.data.length === 0 ? (
            <Link href="/dashboard/recruiter/company/new">
              <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                Register Company
              </button>
            </Link>
          ) : null}
        </div>

        {companiesResult.error ? (
          <SectionError
            message={companiesResult.error}
            retryUrl="/dashboard/recruiter"
          />
        ) : companiesResult.data && companiesResult.data.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <Building2 className="h-12 w-12 text-gray-600" />
            <p className="text-sm text-gray-400">No company registered yet.</p>
            <Link href="/dashboard/recruiter/company/new">
              <button
                className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
              >
                Register Company
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesResult.data!.map((company) => {
              const logoText = company.name.charAt(0).toUpperCase()
              return (
                <div
                  key={company._id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col"
                >
                  <div className="flex flex-col items-center text-center gap-3 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white ring-3 ring-white/10">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="h-full w-full object-cover rounded-2xl"
                          loading="lazy"
                        />
                      ) : (
                        logoText
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{company.name}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <StatusBadge status={company.status} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-sm text-gray-400">
                    {company.industry && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{company.industry}</span>
                      </div>
                    )}
                    {company.companySize && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{company.companySize}</span>
                      </div>
                    )}
                    {company.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Visit Website</span>
                      </a>
                    )}
                    {company.foundedYear && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Founded {company.foundedYear}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <Link href={`/dashboard/recruiter/company/new?companyId=${company._id}`}>
                      <button
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                      >
                        Edit Company
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
