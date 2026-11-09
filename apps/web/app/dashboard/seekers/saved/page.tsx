"use client"

import { useState } from "react"
import { Bookmark, MapPin, Briefcase, DollarSign, Calendar, Trash2, ChevronRight } from "lucide-react"
import { SectionHeader } from "../../components/ui"

const savedJobs = [
  { id: "1", title: "Senior Frontend Developer", company: "Stripe",     logo: "S", logoColor: "from-indigo-500 to-purple-600", location: "New York, USA",     type: "Full-time",  salary: "$120–160K/yr", dateSaved: "Nov 7, 2026" },
  { id: "2", title: "Product Designer",          company: "Figma",      logo: "F", logoColor: "from-pink-500 to-rose-600",    location: "Remote",             type: "Remote",     salary: "$100–140K/yr", dateSaved: "Nov 5, 2026" },
  { id: "3", title: "React Native Developer",    company: "Vercel",     logo: "V", logoColor: "from-gray-700 to-gray-900",    location: "Remote",             type: "Remote",     salary: "$90–130K/yr",  dateSaved: "Nov 4, 2026" },
  { id: "4", title: "DevOps Engineer",           company: "Cloudflare", logo: "C", logoColor: "from-orange-500 to-amber-500", location: "Austin, USA",        type: "Full-time",  salary: "$110–150K/yr", dateSaved: "Nov 3, 2026" },
  { id: "5", title: "ML Engineer",              company: "OpenAI",     logo: "O", logoColor: "from-emerald-500 to-teal-500", location: "San Francisco, USA", type: "Full-time",  salary: "$160–220K/yr", dateSaved: "Nov 1, 2026" },
]

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState(savedJobs)

  const removeJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        title="Saved Jobs"
        subtitle={`You have ${jobs.length} saved job${jobs.length !== 1 ? "s" : ""}`}
      />

      {jobs.length === 0 ? (
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
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                  <td className="px-5 py-4 text-left min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${job.logoColor} flex items-center justify-center text-xs font-bold text-white`}>
                        {job.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-tight truncate">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.company} · {job.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{job.dateSaved}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right w-32">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5">
                        Apply
                      </button>
                      <button
                        onClick={() => removeJob(job.id)}
                        className="rounded-lg border border-white/10 p-1.5 text-gray-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
