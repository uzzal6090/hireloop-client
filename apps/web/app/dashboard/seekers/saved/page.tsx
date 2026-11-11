"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bookmark, MapPin, Briefcase, DollarSign, Calendar, Trash2, ChevronRight } from "lucide-react"
import { SectionHeader } from "../../components/ui"

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

interface SavedJobItem {
  _id: string
  userId: string
  jobId: string
  createdAt: string
  isAvailable: boolean
  job: PublicJob | null
  company: PublicCompany | null
}

interface SavedJobsResponse {
  success: true
  savedJobs: SavedJobItem[]
}

const DEFAULT_LIMIT = 10

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

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(null)
  const isInitialLoadRef = useRef(true)

  const fetchSavedJobs = useCallback(async (abortSignal?: AbortSignal) => {
    if (!isInitialLoadRef.current) {
      setLoading(true)
    }
    setError(null)

    try {
      const res = await fetch("/api/seeker/saved-jobs", {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: abortSignal,
      })

      if (!res.ok) {
        throw new Error("Failed to load saved jobs")
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to load saved jobs")
      }

      setSavedJobs(data.savedJobs)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setError(err instanceof Error ? err.message : "Failed to load saved jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    isInitialLoadRef.current = true

    abortControllerRef.current = new AbortController()
    fetchSavedJobs(abortControllerRef.current.signal)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchSavedJobs])

  const handleRetry = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    fetchSavedJobs(abortControllerRef.current.signal)
  }

  const handleUnsave = async (jobId: string) => {
    setDeleting((prev) => new Set([...prev, jobId]))

    try {
      const res = await fetch(`/api/seeker/saved-jobs/${jobId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (res.status === 404) {
        setError("Saved job not found. It may have already been removed.")
        await fetchSavedJobs()
        return
      }

      if (!res.ok) {
        throw new Error("Failed to remove saved job")
      }

      setSavedJobs((prev) => prev.filter((j) => j.jobId !== jobId))
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setError(err instanceof Error ? err.message : "Failed to remove saved job. Please try again.")
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SectionHeader title="Saved Jobs" subtitle="Your saved job bookmarks." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Bookmark className="mx-auto h-10 w-10 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading your saved jobs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SectionHeader title="Saved Jobs" subtitle="Your saved job bookmarks." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Trash2 className="mx-auto h-10 w-10 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={handleRetry}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        title="Saved Jobs"
        subtitle={`You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? "s" : ""}`}
      />

      {savedJobs.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No saved jobs yet</p>
          <p className="text-xs text-gray-600 mt-1">Browse jobs and bookmark the ones you like</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Job</th>
                <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-28">Location</th>
                <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Salary</th>
                <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-28">Date Saved</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {savedJobs.map((savedJob) => {
                const job = savedJob.job
                const company = savedJob.company
                const isDeleting = deleting.has(savedJob.jobId)
                const dateSaved = formatDate(savedJob.createdAt)

                return (
                  <tr key={savedJob.jobId} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                    <td className="px-5 py-4 text-left min-w-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white`}>
                          {company?.name.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          {savedJob.isAvailable && job && company ? (
                            <>
                              <h3 className="text-sm font-semibold text-white leading-tight truncate">
                                {job.title}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {company.name}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-red-400 leading-tight truncate">
                                Unavailable Job
                              </p>
                              <p className="text-xs text-gray-400">
                                This job is no longer publicly available
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {savedJob.isAvailable && job ? job.location ?? "â€”" : "â€”"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <DollarSign className="h-3 w-3 shrink-0" />
                        <span>
                          {savedJob.isAvailable && job ? job.salary ?? "â€”" : "â€”"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{dateSaved}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right w-32">
                      <div className="flex items-center gap-2 justify-end">
                        {savedJob.isAvailable && job && company ? (
                          <>
                            <Link
                              href={`/jobs/${job.slug}`}
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                            >
                              Details <ChevronRight className="h-3 w-3" />
                            </Link>
                            <button
                              onClick={() => handleUnsave(savedJob.jobId)}
                              disabled={isDeleting}
                              className="rounded-lg border border-white/10 p-1.5 text-gray-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUnsave(savedJob.jobId)}
                            disabled={isDeleting}
                            className="rounded-lg border border-white/10 p-1.5 text-gray-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
</table>
        </div>
      )}
    </div>
  )
}
