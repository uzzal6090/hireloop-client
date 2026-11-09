"use client"

import {
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  Hash,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"

interface Payment {
  id: string
  userEmail: string
  plan: string
  amount: string
  date: string
  relativeDate: string
  status: "paid" | "pending" | "failed"
}

const summaryCards = [
  {
    label: "Total Revenue",
    value: "$128.4K",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Monthly Revenue",
    value: "$24.6K",
    icon: Calendar,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    label: "Active Seeker Subscriptions",
    value: "3.2K",
    icon: Users,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    label: "Active Recruiter Subscriptions",
    value: "842",
    icon: Briefcase,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
]

const payments: Payment[] = [
  { id: "txn_001", userEmail: "sarah@techcorp.com", plan: "Enterprise", amount: "$149.00", date: "Nov 5, 2026", relativeDate: "3 days ago", status: "paid" },
  { id: "txn_002", userEmail: "mike@startup.io", plan: "Growth", amount: "$49.00", date: "Nov 4, 2026", relativeDate: "4 days ago", status: "paid" },
  { id: "txn_003", userEmail: "emma@design.co", plan: "Pro", amount: "$19.00", date: "Nov 3, 2026", relativeDate: "5 days ago", status: "paid" },
  { id: "txn_004", userEmail: "david@fintech.com", plan: "Enterprise", amount: "$149.00", date: "Nov 2, 2026", relativeDate: "6 days ago", status: "paid" },
  { id: "txn_005", userEmail: "lisa@health.io", plan: "Premium", amount: "$39.00", date: "Nov 1, 2026", relativeDate: "7 days ago", status: "paid" },
  { id: "txn_006", userEmail: "alice@vercel.com", plan: "Growth", amount: "$49.00", date: "Oct 30, 2026", relativeDate: "9 days ago", status: "paid" },
  { id: "txn_007", userEmail: "bob@studio.com", plan: "Pro", amount: "$19.00", date: "Oct 28, 2026", relativeDate: "11 days ago", status: "failed" },
]

export default function AdminPaymentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title="Payments & Subscriptions"
        subtitle="View all platform subscription payments and revenue."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
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
            </div>
          </div>
        ))}
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">User Email</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Plan</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Amount</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Date</th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Transaction ID</th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                <td className="px-5 py-4 text-left min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight truncate">{payment.userEmail}</p>
                </td>
                <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                  <StatusBadge status={payment.plan} />
                </td>
                <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-sm font-semibold text-white">{payment.amount}</span>
                </td>
                <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs font-medium text-white">{payment.date}</div>
                    <div className="text-[11px] text-gray-500">{payment.relativeDate}</div>
                  </div>
                </td>
                <td className="px-5 py-4 text-right w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="font-mono text-xs text-gray-400 truncate">{payment.id}</span>
                </td>
                <td className="px-5 py-4 text-right w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

