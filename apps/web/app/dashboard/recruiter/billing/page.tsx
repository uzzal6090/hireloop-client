"use client"

import { useState } from "react"
import { CreditCard, Zap, CheckCircle2, ArrowUpRight, Calendar, Hash, Link as LinkIcon } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 3 active job posts",
      "Basic applicant management",
      "Standard listing visibility",
    ],
    current: true,
    gradient: "from-gray-700 to-gray-800",
    jobLimit: 3,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/month",
    features: [
      "Up to 10 active job posts",
      "Applicant tracking",
      "Basic analytics",
      "Email support",
    ],
    current: false,
    gradient: "from-indigo-600 to-purple-600",
    popular: true,
    jobLimit: 10,
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/month",
    features: [
      "Up to 50 active job posts",
      "Advanced analytics dashboard",
      "Featured job listings",
      "Team collaboration",
      "Custom branding",
      "Priority support",
    ],
    current: false,
    gradient: "from-purple-600 to-pink-600",
    jobLimit: 50,
  },
]

const paymentHistory = [
  { id: "txn_001", date: "Nov 5, 2026", plan: "Growth", amount: "$49.00", status: "Paid" },
  { id: "txn_002", date: "Oct 5, 2026", plan: "Growth", amount: "$49.00", status: "Paid" },
  { id: "txn_003", date: "Sep 5, 2026", plan: "Free", amount: "$0.00", status: "Free" },
]

const company = {
  name: "Acme Corp",
  plan: "Growth" as const,
  activeJobs: 7,
  planLimit: 10,
}

export default function RecruiterBillingPage() {
  const [saved, setSaved] = useState(false)

  const handleUpgrade = (planName: string) => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SectionHeader
        title="Subscription & Billing"
        subtitle="Manage your company's plan and payment history."
      />

      {/* Current plan summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Current plan: <span className="text-purple-400">{company.plan}</span>
            </p>
            <p className="text-xs text-gray-500">
              {company.activeJobs} of {company.planLimit} active job posts used
            </p>
          </div>
        </div>
        <div className="flex-1 max-w-md sm:w-64">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full w-[${(company.activeJobs / company.planLimit) * 100}%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full`}
            />
          </div>
          <p className="text-[11px] text-gray-500 text-right mt-1">
            {company.activeJobs} / {company.planLimit} used
          </p>
        </div>
        <Link href="/dashboard/recruiter/jobs/new">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all">
            <LinkIcon className="h-4 w-4" /> Post a Job
          </button>
        </Link>
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
                  ? "border-purple-500/50 bg-purple-500/5"
                  : plan.popular
                  ? "border-purple-500/30 bg-purple-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-lg">
                  Most Popular
                </span>
              )}
              {plan.current && (
                <span className="absolute -top-3 right-4 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-0.5 text-[11px] font-semibold text-purple-400">
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
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full rounded-full bg-gradient-to-r ${plan.gradient} py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5`}
                >
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
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-white/10 bg-white/5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Transaction ID
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-28">
              Date
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-20">
              Plan
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-20">
              Amount
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 w-20 text-right">
              Status
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {paymentHistory.map(tx => (
              <div
                key={tx.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto] items-start md:items-center gap-2 md:gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-gray-600" />
                  <span className="font-mono text-xs text-gray-400">{tx.id}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 w-28">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {tx.date}
                </div>
                <StatusBadge status={tx.plan} />
                <span className="text-sm font-semibold text-white w-20">
                  {tx.amount}
                </span>
                <div className="w-20 flex justify-end">
                  <StatusBadge status={tx.status === "Paid" ? "offered" : "free"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">
            Plan upgraded successfully!
          </span>
        </div>
      )}
    </div>
  )
}

