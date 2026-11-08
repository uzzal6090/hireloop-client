"use client"

import { Briefcase, Users, CheckCircle2, XCircle } from "lucide-react"
import { StatCard, SectionHeader, StatusBadge } from "../components/ui"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

const barData = [
  { job: "Frontend Dev",  applicants: 42 },
  { job: "Backend Dev",   applicants: 28 },
  { job: "DevOps Eng.",   applicants: 19 },
  { job: "UX Designer",   applicants: 35 },
  { job: "Data Analyst",  applicants: 24 },
]

const recentApplications = [
  { id: 1, name: "Alice Johnson",  job: "Frontend Developer",  time: "12m ago",  color: "bg-indigo-500" },
  { id: 2, name: "Bob Martinez",   job: "Backend Developer",   time: "1h ago",   color: "bg-purple-500" },
  { id: 3, name: "Clara Smith",    job: "UX Designer",         time: "3h ago",   color: "bg-pink-500"   },
  { id: 4, name: "David Kim",      job: "DevOps Engineer",     time: "5h ago",   color: "bg-blue-500"   },
  { id: 5, name: "Eva Chen",       job: "Data Analyst",        time: "1d ago",   color: "bg-emerald-500"},
]

export default function RecruiterHomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title="Recruiter Overview"
        subtitle="Monitor your job postings and incoming applications."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Job Posts"   value={12}  icon={Briefcase}     iconColor="text-indigo-400"  iconBg="bg-indigo-500/10"  trend={{ value: "2 this month", positive: true }} />
        <StatCard label="Total Applicants"  value={148} icon={Users}         iconColor="text-purple-400"  iconBg="bg-purple-500/10"  trend={{ value: "23 this week", positive: true }} />
        <StatCard label="Active Jobs"       value={7}   icon={CheckCircle2}  iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard label="Jobs Closed"       value={5}   icon={XCircle}       iconColor="text-gray-400"    iconBg="bg-gray-500/10" />
      </div>

      {/* Company card + Bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Company card */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/10">
            A
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Acme Corp</h3>
            <p className="text-sm text-gray-400">Technology · San Francisco, USA</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <StatusBadge status="Approved" />
              <StatusBadge status="Growth" />
            </div>
          </div>
          <div className="w-full border-t border-white/10 pt-4 space-y-2 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <span>Active job posts</span>
              <span className="font-semibold text-white">7 / 10</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
            <p className="text-[11px] text-gray-500">3 slots remaining on Growth plan</p>
          </div>
          <button className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
            Edit Company
          </button>
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Applicants per Job</h3>
          <p className="text-xs text-gray-500 mb-6">Last 30 days</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="job" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="applicants" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-base font-semibold text-white mb-5">Recent Applications</h3>
        <div className="space-y-4">
          {recentApplications.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`h-8 w-8 shrink-0 rounded-full ${item.color} flex items-center justify-center text-xs font-bold text-white`}>
                {item.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-gray-500">Applied to <span className="text-gray-400">{item.job}</span></p>
              </div>
              <span className="text-xs text-gray-600 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
