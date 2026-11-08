"use client"

import {
  Briefcase,
  Users,
  Building2,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { SectionHeader, StatusBadge } from "../components/ui"

const statCards = [
  {
    label: "Total Users",
    value: "12.4K",
    icon: Users,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    trend: { value: "12% this month", positive: true },
  },
  {
    label: "Total Recruiters",
    value: "842",
    icon: Briefcase,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    trend: { value: "8% this week", positive: true },
  },
  {
    label: "Total Companies",
    value: "312",
    icon: Building2,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    trend: { value: "5% this month", positive: true },
  },
  {
    label: "Total Jobs Posted",
    value: "2.1K",
    icon: BarChart3,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/10",
    trend: { value: "15% this week", positive: true },
  },
  {
    label: "Platform Revenue",
    value: "$45.2K",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    trend: { value: "22% this month", positive: true },
  },
]

const barData = [
  { category: "Engineering", jobs: 450 },
  { category: "Design", jobs: 320 },
  { category: "Product", jobs: 280 },
  { category: "Marketing", jobs: 210 },
  { category: "DevOps", jobs: 180 },
  { category: "Data", jobs: 150 },
  { category: "Sales", jobs: 120 },
]

const lineData = [
  { date: "Oct 25", users: 120 },
  { date: "Oct 26", users: 180 },
  { date: "Oct 27", users: 150 },
  { date: "Oct 28", users: 240 },
  { date: "Oct 29", users: 310 },
  { date: "Oct 30", users: 280 },
  { date: "Oct 31", users: 350 },
  { date: "Nov 1", users: 420 },
  { date: "Nov 2", users: 380 },
  { date: "Nov 3", users: 450 },
  { date: "Nov 4", users: 520 },
  { date: "Nov 5", users: 480 },
]

const recentPayments = [
  { id: "txn_001", user: "sarah@techcorp.com", plan: "Enterprise", amount: "$149.00", date: "Nov 5, 2026", status: "Paid" },
  { id: "txn_002", user: "mike@startup.io", plan: "Growth", amount: "$49.00", date: "Nov 4, 2026", status: "Paid" },
  { id: "txn_003", user: "emma@design.co", plan: "Pro", amount: "$19.00", date: "Nov 3, 2026", status: "Paid" },
  { id: "txn_004", user: "david@fintech.com", plan: "Enterprise", amount: "$149.00", date: "Nov 2, 2026", status: "Paid" },
  { id: "txn_005", user: "lisa@health.io", plan: "Premium", amount: "$39.00", date: "Nov 1, 2026", status: "Paid" },
]

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title="Admin Overview"
        subtitle="Monitor platform activity and manage the HireLoop ecosystem."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {card.label}
              </span>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none">{card.value}</p>
              {card.trend && (
                <p className="mt-1.5 text-xs font-medium text-emerald-400">
                  ↑ {card.trend.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Jobs per Category */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Jobs Posted by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
              />
              <Bar dataKey="jobs" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - User Registrations */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-base font-semibold text-white mb-4">New User Registrations</h3>
          <p className="text-xs text-gray-500 mb-4">Last 30 days</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
              />
              <Line type="monotone" dataKey="users" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">Recent Payments</h3>
          <p className="text-xs text-gray-500">Latest subscription transactions</p>
        </div>
        <div className="divide-y divide-white/10">
          {recentPayments.map(payment => (
            <div key={payment.id} className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {payment.user.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{payment.user}</p>
                  <p className="text-xs text-gray-500">{payment.plan} Plan</p>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{payment.amount}</p>
                  <p className="text-xs text-gray-500">{payment.date}</p>
                </div>
                <StatusBadge status={payment.status.toLowerCase()} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

