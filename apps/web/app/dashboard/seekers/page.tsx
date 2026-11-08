"use client"

import { Bookmark, FileText, CalendarCheck, Trophy } from "lucide-react"
import { StatCard, SectionHeader } from "../components/ui"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { useSession } from "@/lib/auth-client"

const applicationStatusData = [
  { name: "Applied",      value: 12, color: "#6366f1" },
  { name: "Under Review", value: 7,  color: "#eab308" },
  { name: "Shortlisted",  value: 5,  color: "#a855f7" },
  { name: "Offered",      value: 3,  color: "#10b981" },
  { name: "Rejected",     value: 4,  color: "#ef4444" },
]

const recentActivity = [
  { id: 1, text: "Your application to Frontend Developer at Stripe was shortlisted", time: "2h ago", color: "bg-purple-500" },
  { id: 2, text: "New job alert: Senior React Engineer at Vercel matches your profile", time: "5h ago", color: "bg-indigo-500" },
  { id: 3, text: "Application to UX Designer at Figma is under review", time: "1d ago", color: "bg-yellow-500" },
  { id: 4, text: "Offer received from Cloudflare for DevOps Engineer role", time: "2d ago", color: "bg-emerald-500" },
  { id: 5, text: "Application to Backend Engineer at Supabase was rejected", time: "3d ago", color: "bg-red-500" },
]

export default function SeekerHomePage() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? "there"

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title={`Welcome back, ${name.split(" ")[0]} 👋`}
        subtitle="Here's what's happening with your job search."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Saved Jobs"           value={18} icon={Bookmark}      iconColor="text-indigo-400"  iconBg="bg-indigo-500/10"  trend={{ value: "3 this week", positive: true }} />
        <StatCard label="Applications Sent"    value={31} icon={FileText}      iconColor="text-purple-400"  iconBg="bg-purple-500/10"  trend={{ value: "5 this month", positive: true }} />
        <StatCard label="Interviews Scheduled" value={4}  icon={CalendarCheck} iconColor="text-yellow-400"  iconBg="bg-yellow-500/10" />
        <StatCard label="Offers Received"      value={2}  icon={Trophy}        iconColor="text-emerald-400" iconBg="bg-emerald-500/10" trend={{ value: "1 pending", positive: true }} />
      </div>

      {/* Profile card + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Profile card */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/10">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-[#111]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-sm text-gray-400">{session?.user?.email}</p>
            <span className="mt-2 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400">
              Free Plan
            </span>
          </div>

          {/* Usage bar */}
          <div className="w-full border-t border-white/10 pt-4 space-y-2 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <span>Applications used</span>
              <span className="font-semibold text-white">1 / 3</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>
            <p className="text-[11px] text-gray-500">Upgrade to Pro for 30 applications/month</p>
          </div>

          <button className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
            Edit Profile
          </button>
        </div>

        {/* Pie chart */}
        <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-base font-semibold text-white mb-1">Application Status</h3>
          <p className="text-xs text-gray-500 mb-4">Distribution of your 31 applications</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={applicationStatusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={3}
                dataKey="value"
              >
                {applicationStatusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-base font-semibold text-white mb-5">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">{item.text}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
