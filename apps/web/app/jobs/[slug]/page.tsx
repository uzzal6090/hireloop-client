"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Building2,
  Clock,
  MapPin,
  X,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

interface PublicCompany {
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
}

interface PublicJob {
  _id: string
  title: string
  slug: string
  description: string
  requirements: string | null
  responsibilities: string | null
  benefits: string | null
  employmentType: string
  workplaceType: string
  location: string | null
  salary: string | null
  experienceLevel: string | null
  skills: string[]
  category: string | null
  applicationDeadline: string | null
  createdAt: string
  company: PublicCompany
}

interface JobDetailsResponse {
  success: true
  data: {
    job: PublicJob
    company: PublicCompany
  }
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

export default function JobDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [job, setJob] = useState<PublicJob | null>(null)
  const [company, setCompany] = useState<PublicCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchJob = useCallback(async (abortSignal?: AbortSignal) => {
    if (!slug) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/public/jobs/${slug}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: abortSignal,
      })

      if (res.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error("Failed to fetch job")
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch job")
      }

      setJob(data.data.job)
      setCompany(data.data.company)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setError(
        err instanceof Error ? err.message : "Failed to load job. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    abortControllerRef.current = new AbortController()
    fetchJob(abortControllerRef.current.signal)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchJob, slug])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 px-6 lg:px-10 py-12">
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-8 w-32 mx-auto mt-3" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 px-6 lg:px-10 py-12">
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Clock className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <Button onClick={() => fetchJob()} className="w-auto">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (notFound || !job || !company) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 px-6 lg:px-10 py-12">
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-gray-600" />
          <h2 className="text-lg font-semibold text-white mb-2">Job Not Found</h2>
          <p className="text-sm text-gray-400">
            This job posting is no longer available or does not exist.
          </p>
          <Link href="/jobs">
            <Button className="w-auto">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#0a0a0a] px-6 lg:px-10 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/jobs">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Jobs
          </Button>
        </Link>
      </div>

      {/* Job Header */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-full w-full object-cover rounded-2xl"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {company.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                {company.industry}
              </span>
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                {job.employmentType}
              </span>
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                {job.workplaceType}
              </span>
              {job.experienceLevel && (
                <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                  {job.experienceLevel}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {job.title}
            </h1>
            <p className="text-lg font-medium text-white mb-1">
              {company.name}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{job.location ?? "Remote"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDate(job.createdAt)} posted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Job Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Salary
            </p>
            <p className="text-sm text-white">
              {job.salary ?? "Not disclosed"}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Category
            </p>
            <p className="text-sm text-white">{job.category ?? "—"}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Application Deadline
            </p>
            <p className="text-sm text-white">
              {job.applicationDeadline ?? "Not specified"}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {job.skills.length > 0 ? (
                job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-medium text-gray-500">
                  Not specified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Job Description
        </h2>
        <div className="space-y-6">
          {job.description && (
            <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
              {job.description}
            </div>
          )}
          {job.responsibilities && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Responsibilities
              </h3>
              <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {job.responsibilities}
              </div>
            </div>
          )}
          {job.requirements && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Requirements
              </h3>
              <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}
          {job.benefits && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Benefits
              </h3>
              <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {job.benefits}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          About {company.name}
        </h2>
        <div className="space-y-4">
          {company.logo || company.name || company.industry || company.location && (
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="h-full w-full object-cover rounded-2xl"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white">{company.name}</h3>
                {company.industry && (
                  <p className="text-xs text-gray-400">{company.industry}</p>
                )}
                {company.location && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{company.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {company.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Description
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {company.description}
              </p>
            </div>
          )}
          {company.companySize && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>{company.companySize}</span>
            </div>
          )}
          {company.foundedYear && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Founded {company.foundedYear}</span>
            </div>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span className="text-xs">Visit Website</span>
              <span className="text-xs">→</span>
            </a>
          )}
        </div>
      </div>

      {/* Apply Now */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Ready to apply?</h3>
            <p className="text-xs text-gray-400 mt-1">
              Sign in to submit your application.
            </p>
          </div>
          <Link href="/signin">
            <Button className="w-auto">
              Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
