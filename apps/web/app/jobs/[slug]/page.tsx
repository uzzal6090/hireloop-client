"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Clock, Building2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { useToast } from "@workspace/ui/components/toast"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { JobDetails } from "@/components/job-details"

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

export default function JobDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [job, setJob] = useState<PublicJob | null>(null)
  const [company, setCompany] = useState<PublicCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [applicationsLoaded, setApplicationsLoaded] = useState(false)
  const [applying, setApplying] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!session || !job) return

    let cancelled = false

    async function loadApplications() {
      try {
        const res = await fetch("/api/seeker/applications", {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        })

        if (!cancelled && res.ok) {
          const data = await res.json().catch(() => null)
          if (!cancelled && data?.success && Array.isArray(data.applications)) {
            const ids = new Set<string>()
            for (const app of data.applications as Array<{ jobId?: string }>) {
              if (app?.jobId) ids.add(app.jobId)
            }
            setAppliedJobIds(ids)
          }
        }
      } catch {
        // Non-fatal: applied state remains unknown until an apply attempt.
      } finally {
        if (!cancelled) setApplicationsLoaded(true)
      }
    }

    loadApplications()

    return () => {
      cancelled = true
    }
  }, [session, job])

  const isApplied = job ? appliedJobIds.has(job._id) : false
  const isAuthenticated = !!session
  const viewerRole = (session?.user as { role?: string })?.role ?? null
  const isJobOwner = false // Public API does not expose recruiterId; edit/manage handled in dashboard

  const handleApply = async () => {
    if (!job || applying || isApplied) return

    if (!session) {
      setAppError("Please sign in to apply for this job.")
      return
    }

    setApplying(true)
    setAppError(null)

    try {
      const res = await fetch("/api/seeker/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId: job._id }),
      })

      if (res.status === 401) {
        setAppError("Please sign in to apply for this job.")
        setApplying(false)
        return
      }

      if (res.status === 403) {
        setAppError("Only job seekers can apply for jobs.")
        setApplying(false)
        return
      }

      if (res.status === 409) {
        setAppliedJobIds((prev) => new Set([...prev, job._id]))
        toast({ title: "You have already applied to this job.", type: "error" })
        setApplying(false)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to submit application")
      }

      const data = await res.json()
      if (data?.success) {
        setAppliedJobIds((prev) => new Set([...prev, job._id]))
        toast({ title: "Application submitted successfully.", type: "success" })
      } else {
        throw new Error(data?.error || "Failed to submit application")
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit application. Please try again."
      setAppError(message)
      toast({ title: message, type: "error" })
    } finally {
      setApplying(false)
    }
  }

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
    <JobDetails
      job={job}
      company={company}
      viewerRole={viewerRole as "seeker" | "recruiter" | "admin" | null}
      isAuthenticated={isAuthenticated}
      isJobOwner={isJobOwner}
      isApplied={isApplied}
      isApplying={applying}
      isSaved={false}
      isSaving={false}
      appError={appError}
      onApply={handleApply}
      onSave={undefined}
      onEdit={undefined}
      onManage={undefined}
    />
  )
}
