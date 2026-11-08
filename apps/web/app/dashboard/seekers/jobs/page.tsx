"use client"

import { useState } from "react"
import { Search, MapPin, Briefcase, DollarSign, Bookmark, ChevronRight, SlidersHorizontal } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"

const categories = ["All", "Engineering", "Design", "Product", "Marketing", "DevOps", "Data"]
const jobTypes   = ["Full-time", "Part-time", "Remote", "Contract", "Internship"]

const jobs = [
  { id: "1", title: "Senior Frontend Developer",    company: "Stripe",       logo: "S",  logoColor: "from-indigo-500 to-purple-600", location: "New York, USA",     type: "Full-time",   salary: "$120–160K/yr",  category: "Engineering", saved: false },
  { id: "2", title: "Product Designer",             company: "Figma",        logo: "F",  logoColor: "from-pink-500 to-rose-600",    location: "Remote",             type: "Remote",      salary: "$100–140K/yr",  category: "Design",      saved: true  },
  { id: "3", title: "DevOps Engineer",              company: "Cloudflare",   logo: "C",  logoColor: "from-orange-500 to-amber-500", location: "Austin, USA",        type: "Full-time",   salary: "$110–150K/yr",  category: "DevOps",      saved: false },
  { id: "4", title: "Machine Learning Engineer",    company: "OpenAI",       logo: "O",  logoColor: "from-emerald-500 to-teal-500", location: "San Francisco, USA", type: "Full-time",   salary: "$160–220K/yr",  category: "Data",        saved: false },
  { id: "5", title: "React Native Developer",       company: "Vercel",       logo: "V",  logoColor: "from-gray-700 to-gray-900",    location: "Remote",             type: "Remote",      salary: "$90–130K/yr",   category: "Engineering", saved: true  },
  { id: "6", title: "Growth Marketing Manager",     company: "Linear",       logo: "L",  logoColor: "from-violet-500 to-indigo-600",location: "London, UK",         type: "Hybrid",      salary: "$80–110K/yr",   category: "Marketing",   saved: false },
  { id: "7", title: "Backend Engineer (Node.js)",   company: "Supabase",     logo: "S",  logoColor: "from-green-500 to-emerald-600",location: "Remote",             type: "Remote",      salary: "$100–140K/yr",  category: "Engineering", saved: false },
  { id: "8", title: "Data Analyst",                 company: "Databricks",   logo: "D",  logoColor: "from-red-500 to-orange-500",   location: "Seattle, USA",       type: "Full-time",   salary: "$95–125K/yr",   category: "Data",        saved: false },
]

export default function SeekerJobsPage() {
  const [keyword,       setKeyword]       = useState("")
  const [location,      setLocation]      = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeTypes,   setActiveTypes]   = useState<string[]>([])
  const [savedIds,      setSavedIds]      = useState<string[]>(jobs.filter(j => j.saved).map(j => j.id))
  const [showFilters,   setShowFilters]   = useState(false)

  const toggleType = (t: string) =>
    setActiveTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const toggleSave = (id: string) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filtered = jobs.filter(j => {
    const matchKw  = !keyword  || j.title.toLowerCase().includes(keyword.toLowerCase()) || j.company.toLowerCase().includes(keyword.toLowerCase())
    const matchLoc = !location || j.location.toLowerCase().includes(location.toLowerCase())
    const matchCat = activeCategory === "All" || j.category === activeCategory
    const matchType = activeTypes.length === 0 || activeTypes.includes(j.type)
    return matchKw && matchLoc && matchCat && matchType
  })

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
            onChange={e => setKeyword(e.target.value)}
            placeholder="Job title, skill or company..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <div className="relative sm:w-56">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location or Remote"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
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
              {jobTypes.map(t => (
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
        {categories.map(cat => (
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
      <p className="text-xs text-gray-500">
        Showing <span className="text-white font-semibold">{filtered.length}</span> jobs
      </p>

      {/* Job cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(job => {
          const isSaved = savedIds.includes(job.id)
          return (
            <div key={job.id} className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 hover:border-white/20 transition-all">
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${job.logoColor} flex items-center justify-center text-sm font-bold text-white`}>
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{job.title}</h3>
                    <p className="text-xs text-gray-400">{job.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(job.id)}
                  className={`shrink-0 rounded-lg p-2 transition-all ${isSaved ? "bg-indigo-500/20 text-indigo-400" : "text-gray-500 hover:bg-white/10 hover:text-white"}`}
                >
                  <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MapPin className="h-3 w-3" />{job.location}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Briefcase className="h-3 w-3" />{job.type}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <DollarSign className="h-3 w-3" />{job.salary}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/10">
                <button className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
                  Apply Now
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                  Details <ChevronRight className="h-3 w-3" />
                </button>
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

