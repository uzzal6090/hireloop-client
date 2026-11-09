"use client"

import { CreditCard, Zap, CheckCircle2, ArrowUpRight, Calendar, Hash } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 applications/month", "Save up to 10 jobs", "Basic profile", "Email alerts"],
    current: true,
    gradient: "from-gray-700 to-gray-800",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: ["30 applications/month", "Unlimited saved jobs", "Application tracking", "Salary insights"],
    current: false,
    gradient: "from-indigo-600 to-purple-600",
    popular: true,
  },
  {
    name: "Premium",
    price: "$39",
    period: "/month",
    features: ["Unlimited applications", "Profile boost to recruiters", "Early access to new jobs", "Priority support"],
    current: false,
    gradient: "from-purple-600 to-pink-600",
  },
]

const paymentHistory = [
  { id: "txn_001", date: "Nov 1, 2026",  plan: "Pro",     amount: "$19.00", status: "Paid" },
  { id: "txn_002", date: "Oct 1, 2026",  plan: "Pro",     amount: "$19.00", status: "Paid" },
  { id: "txn_003", date: "Sep 1, 2026",  plan: "Free",    amount: "$0.00",  status: "Free" },
]

export default function SeekerBillingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SectionHeader
        title="Subscription & Billing"
        subtitle="Manage your plan and payment history."
      />

      {/* Current plan summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Current plan: <span className="text-indigo-400">Free</span></p>
            <p className="text-xs text-gray-500">1 of 3 applications used this month</p>
          </div>
        </div>
        <div className="h-1.5 sm:w-48 w-full rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
        </div>
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 flex flex-col gap-5 transition-all ${
                plan.current
                  ? "border-indigo-500/50 bg-indigo-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-lg">
                  Most Popular
                </span>
              )}
              {plan.current && (
                <span className="absolute -top-3 right-4 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-3 py-0.5 text-[11px] font-semibold text-indigo-400">
                  Current
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-white">{plan.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <button disabled className="w-full rounded-full border border-white/10 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button className={`w-full rounded-full bg-gradient-to-r ${plan.gradient} py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5`}>
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment history */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Payment History</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Transaction ID</th>
                <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-28">Date</th>
                <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Plan</th>
                <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Amount</th>
                <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paymentHistory.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                  <td className="px-5 py-4 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-gray-600" />
                      <span className="font-mono text-xs text-gray-400 truncate">{tx.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center w-28 whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {tx.date}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                    <StatusBadge status={tx.plan} />
                  </td>
                  <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="text-sm font-semibold text-white">{tx.amount}</span>
                  </td>
                  <td className="px-5 py-4 text-right w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                    <StatusBadge status={tx.status === "Paid" ? "offered" : "free"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

