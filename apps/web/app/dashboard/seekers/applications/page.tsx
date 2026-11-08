"use client"

import { useState } from "react"
import { FileText, ChevronRight, ExternalLink } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"

type ApplicationStatus = "Applied" | "Under Review" | "Shortlisted" | "Rejected" | "Offered"

interface Application {
  id: string
  jobTitle: string
  company: string
  logo: string
  logoColor: string
  dateApplied: string
  timeAgo: string
  status: ApplicationStatus
}

const applications: Application[] = [
  { id: "1", jobTitle: "Senior Frontend Developer", company: "Stripe",      logo: "S", logoColor: "from-indigo-500 to-purple-600", dateApplied: "Nov 7, 2026",  timeAgo: "2 days ago",   status: "Shortlisted"  },
  { id: "2", jobTitle: "Product Designer",          company: "Figma",       logo: "F", logoColor: "from-pink-500 to-rose-600",    dateApplied: "Nov 5, 2026",  timeAgo: "4 days ago",   status: "Under Review" },
  { id: "3", jobTitle: "DevOps Engineer",           company: "Cloudflare",  logo: "C", logoColor: "from-orange-500 to-amber-500", dateApplied: "Nov 3, 2026",  timeAgo: "6 days ago",   status: "Applied"      },
  { id: "4", jobTitle: "ML Engineer",               company: "OpenAI",      logo: "O", logoColor: "from-emerald-500 to-teal-500", dateApplied: "Nov 1, 2026",  timeAgo: "8 days ago",   status: "Offered"      },
  { id: "5", jobTitle: "Backend Engineer",          company: "Supabase",    logo: "S", logoColor: "from-green-500 to-emerald-600",dateApplied: "Oct 29, 2026", timeAgo: "11 days ago",  status: "Rejected"     },
  { id: "6", jobTitle: "React Native Developer",    company: "Vercel",      logo: "V", logoColor: "from-gray-700 to-gray-900",    dateApplied: "Oct 25, 2026", timeAgo: "15 days ago",  status: "Under Review" },
  { id: "7", jobTitle: "Growth Engineer",           company: "Linear",      logo: "L", logoColor: "from-violet-500 to-indigo-600",dateApplied: "Oct 20, 2026", timeAgo: "20 days ago",  status: "Rejected"     },
]

const statusOptions: ApplicationStatus[] = ["Applied", "Under Review", "Shortlisted", "Rejected", "Offered"]

export default function MyApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All")

  const filtered = filter === "All" ? applications : applications.filter(a => a.status === filter)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        title="My Applications"
        subtitle={`Tracking ${applications.length} total applications`}
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["All", ...statusOptions] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
              filter === s
                ? "border-purple-500 bg-purple-500/15 text-purple-300"
                : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {s}
            <span className="ml-1.5 text-gray-600">
              {s === "All" ? applications.length : applications.filter(a => a.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-white/10 bg-white/5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Job & Company</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-32">Date Applied</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-32">Status</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-24 text-right">Action</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/10">
          {filtered.map(app => (
            <div key={app.id} className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto] items-start md:items-center gap-3 md:gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
              {/* Job info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${app.logoColor} flex items-center justify-center text-xs font-bold text-white`}>
                  {app.logo}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight truncate">{app.jobTitle}</p>
                  <p className="text-xs text-gray-400">{app.company}</p>
                </div>
              </div>

              {/* Date */}
              <div className="w-32">
                <p className="text-xs font-medium text-white">{app.dateApplied}</p>
                <p className="text-[11px] text-gray-500">{app.timeAgo}</p>
              </div>

              {/* Status */}
              <div className="w-32">
                <StatusBadge status={app.status} />
              </div>

              {/* Action */}
              <div className="w-24 flex justify-end">
                <button className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                  View <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No applications with this status</p>
          </div>
        )}
      </div>
    </div>
  )
}

