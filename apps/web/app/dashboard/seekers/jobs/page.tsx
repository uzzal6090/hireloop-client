"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react"
import { SectionHeader } from "../../components/ui"
import { cn } from "@workspace/ui/lib/utils"

const categories = ["All", "Engineering", "Design", "Product", "Marketing", "DevOps", "Data"]
const jobTypes = ["Full-time", "Part-time", "Remote", "Contract", "Internship"]

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

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

const LOGO_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-orange-500 to-amber-500",
  "from-emerald-500 to-teal-500",
  "from-gray-700 to-gray-900",
  "from-violet-500 to-indigo-600",
  "from-green-500 to-emerald-600",
  "from-red-500 to-orange-500",
]

function logoColorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length] ?? "from-indigo-500 to-purple-600"
}

function typeLabel(job: PublicJob): string {
  if (job.workplaceType === "remote") return "Remote"
  return EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType
}

function matchesActiveTypes(job: PublicJob, activeTypes: string[]): boolean {
  if (activeTypes.length === 0) return true
  return activeTypes.some((t) => {
    if (t === "Remote") return job.workplaceType === "remote"
    if (t === "Full-time") return job.employmentType === "full-time"
    if (t === "Part-time") return job.employmentType === "part-time"
    if (t === "Contract") return job.employmentType === "contract"
    if (t === "Internship") return job.employmentType === "internship"
    return false
  })
}

export default function SeekerJobsPage() {
  const [jobs, setJobs] = useState<PublicJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const [location, setLocation] = useState("")
  const [debouncedLocation, setDebouncedLocation] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeTypes, setActiveTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [pendingSaveIds, setPendingSaveIds] = useState<Set<string>>(new Set())
  const [isSeeker, setIsSeeker] = useState<boolean | null>(null)
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string | null>(null)

  const isMounted = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const keywordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialLoadRef = useRef(true)

  const fetchJobs = useCallback(
    async (abortSignal?: AbortSignal) => {
      if (!isMounted.current) return

      if (isInitialLoadRef.current) {
        setLoading(true)
        isInitialLoadRef.current = false
      }
      setError(null)

      const params = new URLSearchParams()
      params.set("page", "1")
      params.set("limit", "50")
      if (debouncedKeyword) params.set("search", debouncedKeyword)
      if (debouncedLocation) params.set("location", debouncedLocation)
      if (activeCategory && activeCategory !== "All") params.set("category", activeCategory)

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
        if (!data?.success || !Array.isArray(data.jobs)) {
          throw new Error(data?.error || "Failed to fetch jobs")
        }

        if (isMounted.current) {
          setJobs(data.jobs)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : "Failed to fetch jobs. Please try again.")
        }
      } finally {
        if (isMounted.current) setLoading(false)
      }
    },
    [debouncedKeyword, debouncedLocation, activeCategory]
  )

  useEffect(() => {
    isMounted.current = true

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
      if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current)
      if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current)
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

  const toggleType = (t: string) =>
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const handleToggleBookmark = useCallback(
    async (jobId: string) => {
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

  const filtered = useMemo(
    () => jobs.filter((j) => matchesActiveTypes(j, activeTypes)),
    [jobs, activeTypes]
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader
          title="Browse & Apply"
          subtitle="Find your next opportunity. Apply with one click."
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-sm text-gray-400">Loading jobs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SectionHeader
          title="Browse & Apply"
          subtitle="Find your next opportunity. Apply with one click."
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center space-y-4">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => {
              if (abortControllerRef.current) abortControllerRef.current.abort()
              abortControllerRef.current = new AbortController()
              isInitialLoadRef.current = true
              setLoading(true)
              fetchJobs(abortControllerRef.current.signal)
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
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
        title="Browse & Apply"
        subtitle="Find your next opportunity. Apply with one click."
      />

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={keyword}
            onChange={(e) => {
              const value = e.target.value
              setKeyword(value)
              if (keywordDebounceRef.current) clearTimeout(keywordDebounceRef.current)
              keywordDebounceRef.current = setTimeout(() => setDebouncedKeyword(value), 300)
            }}
            placeholder="Job title, skill or company..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <div className="relative sm:w-56">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={location}
            onChange={(e) => {
              const value = e.target.value
              setLocation(value)
              if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current)
              locationDebounceRef.current = setTimeout(() => setDebouncedLocation(value), 300)
            }}
            placeholder="Location or Remote"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Job Type</p>
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTypes.includes(t)
                      ? "border-purple-500 bg-purple-500/15 text-purple-300"
                      : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat
                ? "border-purple-500 bg-purple-500/15 text-purple-300"
                : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">
          Showing <span className="text-white font-semibold">{filtered.length}</span> jobs
        </p>
        {bookmarkFeedback && <p className="text-xs text-amber-400">{bookmarkFeedback}</p>}
      </div>

      {/* Job cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((job) => {
          const isSaved = savedJobIds.has(job._id)
          const isPending = pendingSaveIds.has(job._id)
          const type = typeLabel(job)
          return (
            <div
              key={job._id}
              className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-white/20 transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold text-white",
                      job.company.logo ? "overflow-hidden" : `bg-gradient-to-br ${logoColorFor(job._id)}`
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
                      job.company.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{job.title}</h3>
                    <p className="text-xs text-gray-400">{job.company.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleBookmark(job._id)}
                  disabled={isPending}
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                  className={`shrink-0 rounded-lg p-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSaved
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "text-gray-500 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {job.location ?? (job.workplaceType === "remote" ? "Remote" : "—")}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Briefcase className="h-3 w-3" />
                  {type}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <DollarSign className="h-3 w-3" />
                  {job.salary ?? "—"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/10">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-2 text-xs font-semibold text-white text-center shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
                >
                  Apply Now
                </Link>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  Details <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No jobs match your filters</p>
          <p className="text-xs text-gray-600 mt-1">Try adjusting your search or clearing filters</p>
        </div>
      )}
    </div>
  )
}
