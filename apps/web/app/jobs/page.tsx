"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Bookmark,
  Clock,
  MapPin,
  Clock as ClockIcon,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "@/app/dashboard/components/ui"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship"]
const WORKPLACE_TYPES = ["on-site", "remote", "hybrid"]
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "lead", "executive"]

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
  company: {
    _id: string
    name: string
    slug: string
    logo: string | null
    industry: string | null
    location: string | null
  }
}

interface PublicJobsResponse {
  success: true
  jobs: PublicJob[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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

function formatSalary(salary: string | null): string | null {
  if (!salary) return null
  return salary
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<PublicJob[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(DEFAULT_LIMIT)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [workplaceType, setWorkplaceType] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [pendingSaveIds, setPendingSaveIds] = useState<Set<string>>(new Set())
  const [isSeeker, setIsSeeker] = useState<boolean | null>(null)
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string | null>(null)
  const isMounted = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialLoadRef = useRef(true)

  const fetchJobs = useCallback(async (abortSignal?: AbortSignal) => {
    if (!isMounted.current) return

    // Only show full-page loading spinner on initial load. On refetches
    // (search/filter/pagination changes), keep loading false so the search
    // inputs and filters stay mounted and focused.
    if (isInitialLoadRef.current) {
      setLoading(true)
      isInitialLoadRef.current = false
    }
    setError(null)

    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", String(limit))
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (category) params.set("category", category)
    if (location) params.set("location", location)
    if (employmentType) params.set("employmentType", employmentType)
    if (workplaceType) params.set("workplaceType", workplaceType)
    if (experienceLevel) params.set("experienceLevel", experienceLevel)

    try {
      const res = await fetch(`/api/public/jobs?${params}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: abortSignal,
      })

      if (!res.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch jobs")
      }

      setJobs(data.jobs)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setError(
        err instanceof Error ? err.message : "Failed to fetch jobs. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, category, location, employmentType, workplaceType, experienceLevel])

  useEffect(() => {
    isMounted.current = true

    // Cancel any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    fetchJobs(abortControllerRef.current.signal)

    return () => {
      isMounted.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [fetchJobs])

  useEffect(() => {
    const controller = new AbortController()

    async function loadSavedJobs() {
      try {
        const res = await fetch("/api/seeker/saved-jobs", {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        })

        if (res.status === 401 || res.status === 403) {
          if (isMounted.current) setIsSeeker(false)
          return
        }

        if (!res.ok) {
          if (isMounted.current) {
            setBookmarkFeedback("Unable to load saved jobs. Bookmark state may be unavailable.")
          }
          return
        }

        const data = await res.json().catch(() => null)
        if (!data?.success || !Array.isArray(data.savedJobs)) {
          if (isMounted.current) {
            setBookmarkFeedback("Unable to load saved jobs. Bookmark state may be unavailable.")
          }
          return
        }

        const ids = new Set<string>()
        for (const item of data.savedJobs as Array<{ jobId?: string }>) {
          if (item?.jobId) ids.add(item.jobId)
        }
        if (isMounted.current) {
          setIsSeeker(true)
          setSavedJobIds(ids)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        if (isMounted.current) {
          setBookmarkFeedback("Unable to load saved jobs. Check your connection and try again.")
        }
      }
    }

    loadSavedJobs()
    return () => controller.abort()
  }, [])

  const resetFilters = () => {
    setSearch("")
    setCategory("")
    setLocation("")
    setEmploymentType("")
    setWorkplaceType("")
    setExperienceLevel("")
    setPage(1)
  }

  const resetPage = useCallback(() => {
    setPage(1)
  }, [])

  const handleToggleBookmark = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, jobId: string) => {
      e.preventDefault()
      e.stopPropagation()

      if (pendingSaveIds.has(jobId)) return

      if (isSeeker === false) {
        setBookmarkFeedback("Sign in as a job seeker to save jobs.")
        return
      }

      setBookmarkFeedback(null)
      setPendingSaveIds((prev) => new Set([...prev, jobId]))
      const wasSaved = savedJobIds.has(jobId)

      try {
        const res = await fetch(
          wasSaved ? `/api/seeker/saved-jobs/${jobId}` : "/api/seeker/saved-jobs",
          {
            method: wasSaved ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            ...(wasSaved ? {} : { body: JSON.stringify({ jobId }) }),
          }
        )

        if (res.status === 401 || res.status === 403) {
          setIsSeeker(false)
          setBookmarkFeedback("Sign in as a job seeker to save jobs.")
          return
        }

        const data = await res.json().catch(() => null)

        if (!res.ok || !data?.success) {
          setBookmarkFeedback(data?.error || "Failed to update saved job.")
          return
        }

        setSavedJobIds((prev) => {
          const next = new Set(prev)
          if (wasSaved) next.delete(jobId)
          else next.add(jobId)
          return next
        })
      } catch {
        setBookmarkFeedback("Failed to update saved job. Please try again.")
      } finally {
        setPendingSaveIds((prev) => {
          const next = new Set(prev)
          next.delete(jobId)
          return next
        })
      }
    },
    [isSeeker, pendingSaveIds, savedJobIds]
  )

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, location, employmentType, workplaceType, experienceLevel])

  const activeFilterCount = useMemo(
    () =>
      [
        debouncedSearch,
        category,
        location,
        employmentType,
        workplaceType,
        experienceLevel,
      ].filter(Boolean).length,
    [debouncedSearch, category, location, employmentType, workplaceType, experienceLevel]
  )

  const employmentTypeLabels: Record<string, string> = {
    fulltime: "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
  }

  const workplaceTypeLabels: Record<string, string> = {
    "on-site": "On-site",
    remote: "Remote",
    hybrid: "Hybrid",
  }

  const experienceLevelLabels: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior Level",
    lead: "Lead",
    executive: "Executive",
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 px-6 lg:px-10 py-12">
        <SectionHeader
          title="Browse Jobs"
          subtitle="Explore open positions from top companies."
        />
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
        <SectionHeader title="Browse Jobs" subtitle="Explore open positions from top companies." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Clock className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm text-red-400">{error}</p>
          <Button
            onClick={() => {
              if (abortControllerRef.current) {
                abortControllerRef.current.abort()
              }
              abortControllerRef.current = new AbortController()
              fetchJobs(abortControllerRef.current.signal)
            }}
            className="w-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#0a0a0a] px-6 lg:px-10 py-12">
      <SectionHeader
        title="Browse Jobs"
        subtitle="Explore open positions from top companies."
      />

      {/* Search & Filters */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative col-span-full lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => {
                const value = e.target.value
                setSearch(value)
                if (searchDebounceRef.current) {
                  clearTimeout(searchDebounceRef.current)
                }
                searchDebounceRef.current = setTimeout(() => {
                  setDebouncedSearch(value)
                  setPage(1)
                }, 300)
              }}
              placeholder="Search by job title or skill..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all border-white/10 bg-[#0a0a0a]/60"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or region..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all border-white/10 bg-[#0a0a0a]/60"
            />
          </div>

          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all border-white/10 bg-[#0a0a0a]/60 text-white"
            >
              <option value="">Category</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="DevOps">DevOps</option>
              <option value="Data">Data</option>
              <option value="Sales">Sales</option>
              <option value="Customer Support">Customer Support</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="relative col-span-full lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Employment Type
                </p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="employmentType"
                      value="full-time"
                      checked={employmentType === "full-time"}
                      onChange={(e) =>
                        setEmploymentType(
                          employmentType === "full-time" ? "" : "full-time"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Full-time</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="employmentType"
                      value="part-time"
                      checked={employmentType === "part-time"}
                      onChange={(e) =>
                        setEmploymentType(
                          employmentType === "part-time" ? "" : "part-time"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Part-time</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="employmentType"
                      value="contract"
                      checked={employmentType === "contract"}
                      onChange={(e) =>
                        setEmploymentType(
                          employmentType === "contract" ? "" : "contract"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Contract</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="employmentType"
                      value="internship"
                      checked={employmentType === "internship"}
                      onChange={(e) =>
                        setEmploymentType(
                          employmentType === "internship"
                            ? ""
                            : "internship"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Internship</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Workplace Type
                </p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="workplaceType"
                      value="on-site"
                      checked={workplaceType === "on-site"}
                      onChange={(e) =>
                        setWorkplaceType(
                          workplaceType === "on-site" ? "" : "on-site"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">On-site</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="workplaceType"
                      value="remote"
                      checked={workplaceType === "remote"}
                      onChange={(e) =>
                        setWorkplaceType(
                          workplaceType === "remote" ? "" : "remote"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Remote</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="workplaceType"
                      value="hybrid"
                      checked={workplaceType === "hybrid"}
                      onChange={(e) =>
                        setWorkplaceType(
                          workplaceType === "hybrid" ? "" : "hybrid"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Hybrid</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Experience Level
                </p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value="entry"
                      checked={experienceLevel === "entry"}
                      onChange={(e) =>
                        setExperienceLevel(
                          experienceLevel === "entry" ? "" : "entry"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Entry</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value="mid"
                      checked={experienceLevel === "mid"}
                      onChange={(e) =>
                        setExperienceLevel(
                          experienceLevel === "mid" ? "" : "mid"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Mid</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value="senior"
                      checked={experienceLevel === "senior"}
                      onChange={(e) =>
                        setExperienceLevel(
                          experienceLevel === "senior"
                            ? ""
                            : "senior"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Senior</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value="lead"
                      checked={experienceLevel === "lead"}
                      onChange={(e) =>
                        setExperienceLevel(
                          experienceLevel === "lead" ? "" : "lead"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Lead</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value="executive"
                      checked={experienceLevel === "executive"}
                      onChange={(e) =>
                        setExperienceLevel(
                          experienceLevel === "executive"
                            ? ""
                            : "executive"
                        )
                      }
                      className="rounded border-white/30 bg-[#0a0a0a] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-400">Executive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-purple-400 font-medium">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-3 w-3 mr-1.5" /> Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {total} job{total !== 1 ? "s" : ""} found
          </p>
          {bookmarkFeedback && (
            <p className="mt-2 text-xs text-amber-400">{bookmarkFeedback}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Page {page} of {totalPages}</span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 && (
          <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-16 text-center">
            <Search className="mx-auto h-10 w-10 text-gray-600 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No jobs found
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              {activeFilterCount > 0
                ? "Try adjusting your search or clearing filters."
                : "No published jobs available at the moment. Check back soon."}
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={resetFilters} className="w-auto">
                Clear All Filters
              </Button>
            )}
          </div>
        )}
        {jobs.map((job) => (
          <Link
            key={job._id}
            href={`/jobs/${job.slug}`}
            className="group block rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/8 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={cn(
                  "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                  job.company.logo ? "overflow-hidden" : "bg-gradient-to-br from-indigo-600 to-purple-600"
                )}
              >
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={`${job.company.name} logo`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {job.company.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white leading-tight truncate">
                  {job.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {job.company.name}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleToggleBookmark(e, job._id)}
                disabled={pendingSaveIds.has(job._id)}
                aria-label={savedJobIds.has(job._id) ? "Unsave job" : "Save job"}
                className={cn(
                  "shrink-0 rounded-lg p-2 transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  savedJobIds.has(job._id)
                    ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                    : "text-gray-500 hover:bg-white/10 hover:text-white"
                )}
              >
                <Bookmark
                  className="h-4 w-4"
                  fill={savedJobIds.has(job._id) ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400">
                  {job.location ?? "Remote"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400">
                  {formatDate(job.createdAt)} posted
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 rounded border border-white/10 bg-[#0a0a0a]/60 text-[10px] font-medium text-gray-300">
                {job.category}
              </span>
              <span className="px-2 py-1 rounded border border-white/10 bg-[#0a0a0a]/60 text-[10px] font-medium text-gray-300">
                {job.employmentType}
              </span>
              <span className="px-2 py-1 rounded border border-white/10 bg-[#0a0a0a]/60 text-[10px] font-medium text-gray-300">
                {job.workplaceType}
              </span>
              {job.experienceLevel && (
                <span className="px-2 py-1 rounded border border-white/10 bg-[#0a0a0a]/60 text-[10px] font-medium text-gray-300">
                  {job.experienceLevel}
                </span>
              )}
              {job.salary && (
                <span className="px-2 py-1 rounded border border-white/10 bg-[#0a0a0a]/60 text-[10px] font-medium text-gray-300">
                  {job.salary}
                </span>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-white hover:text-purple-400 hover:bg-white/5"
              >
                View Details
              </Button>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3 w-3 mr-1" /> Previous
          </Button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-xs px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
