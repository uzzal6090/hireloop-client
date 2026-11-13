"use client"

import { useEffect, useState } from "react"
import { CreditCard, Zap, CheckCircle2, ArrowUpRight, Calendar, Hash, Link as LinkIcon, RefreshCw } from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"
import { useToast } from "@workspace/ui/components/toast"

interface SubscriptionData {
  subscription: {
    id: string
    userId: string
    planId: string
    planName: string
    jobLimit: number
    status: string
  }
  usage: {
    activeJobs: number
    jobLimit: number
    remainingJobs: number
  }
}

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
    gradient: "from-gray-700 to-gray-800",
    jobLimit: 3,
    available: true,
  },
  {
    name: "Growth",
    price: "—",
    period: "/month",
    features: [
      "Up to 10 active job posts",
      "Applicant tracking",
      "Basic analytics",
      "Email support",
    ],
    gradient: "from-indigo-600 to-purple-600",
    popular: true,
    jobLimit: 10,
    available: false,
  },
  {
    name: "Enterprise",
    price: "—",
    period: "/month",
    features: [
      "Up to 50 active job posts",
      "Advanced analytics dashboard",
      "Featured job listings",
      "Team collaboration",
      "Custom branding",
      "Priority support",
    ],
    gradient: "from-purple-600 to-pink-600",
    jobLimit: 50,
    available: false,
  },
]

export default function RecruiterBillingPage() {
  const { toast } = useToast()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/recruiter/subscription", { cache: "no-store" })
      if (!res.ok) {
        throw new Error("Failed to load subscription")
      }
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Failed to load subscription")
      }
      setData(json as SubscriptionData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load subscription"
      setError(message)
      toast({
        title: "Failed to load subscription",
        description: message,
        type: "error",
        timeout: 3500,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <SectionHeader title="Subscription & Billing" subtitle="Manage your company's plan and payment history." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading subscription...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <SectionHeader title="Subscription & Billing" subtitle="Manage your company's plan and payment history." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <RefreshCw className="mx-auto h-12 w-12 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchSubscription}
            className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <SectionHeader title="Subscription & Billing" subtitle="Manage your company's plan and payment history." />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <p className="text-sm text-gray-400">No subscription data available.</p>
        </div>
      </div>
    )
  }

  const planName = data.subscription.planName
  const planId = data.subscription.planId
  const jobLimit = data.subscription.jobLimit
  const activeJobs = data.usage.activeJobs
  const remainingJobs = data.usage.remainingJobs
  const subscriptionStatus = data.subscription.status
  const isAtLimit = remainingJobs <= 0

  // Dynamically calculate progress percentage from live API data.
  // Clamp between 0 and 100; guard against zero or invalid jobLimit.
  const progressPercent =
    jobLimit && jobLimit > 0
      ? Math.min(100, Math.max(0, (activeJobs / jobLimit) * 100))
      : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SectionHeader title="Subscription & Billing" subtitle="Manage your company's plan and payment history." />

      {/* Current plan summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Current plan: <span className="text-purple-400">{planName}</span>
            </p>
            <p className="text-xs text-gray-500">
              Status: {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
            </p>
            <p className="text-xs text-gray-500">
              {activeJobs} of {jobLimit} active job posts used
            </p>
          </div>
        </div>
        <div className="flex-1 max-w-md sm:w-64">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressPercent >= 100 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 text-right mt-1">
            {activeJobs} / {jobLimit} used
          </p>
          <p className="text-[11px] text-gray-500 text-right mt-0.5">
            {progressPercent.toFixed(0)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            isAtLimit
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}>
            {isAtLimit ? "Limit reached" : `${remainingJobs} slots remaining`}
          </span>
          <Link href="/dashboard/recruiter/jobs/new">
            <button
              disabled={isAtLimit}
              className={`flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium transition-all ${
                isAtLimit
                  ? "bg-gray-600 cursor-not-allowed text-gray-500 border-gray-600 hover:shadow-none"
                  : "bg-white/5 text-white hover:bg-white/10 hover:text-white"
              }`}
            >
              <LinkIcon className="h-4 w-4" /> Post a Job
            </button>
          </Link>
        </div>
      </div>

      {/* Current plan details */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Current Subscription</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Plan Name</p>
            <p className="text-sm font-medium text-white">{planName}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Job Limit</p>
            <p className="text-sm font-medium text-white">{jobLimit} published jobs</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Status</p>
            <p className={`text-sm font-medium ${
              subscriptionStatus === "active" ? "text-emerald-400" : "text-red-400"
            }`}>
              {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
            </p>
          </div>
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
                plan.name === planId
                  ? "border-purple-500/50 bg-purple-500/5"
                  : plan.available
                  ? "border-white/10 bg-white/5 hover:border-white/20"
                  : "border-white/10 bg-white/5 opacity-60"
              }`}
            >
              {!plan.available && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-lg">
                  Coming Soon
                </span>
              )}
              {plan.name === planId && (
                <span className="absolute -top-3 right-4 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-0.5 text-[11px] font-semibold text-purple-400">
                  Current
                </span>
              )}
              {plan.popular && plan.available && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-lg">
                  Most Popular
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

              {!plan.available ? (
                <button disabled className="w-full rounded-full border border-white/10 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed">
                  Coming Soon
                </button>
              ) : plan.name === planId ? (
                <button disabled className="w-full rounded-full border border-white/10 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  disabled
                  className={`w-full rounded-full bg-gradient-to-r ${plan.gradient} py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 cursor-not-allowed`}
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Paid plan upgrades are not yet available. Payment processing will be activated in a future update.
        </p>
      </div>

      {/* Payment history - empty state */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Payment History</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center space-y-4">
          <Hash className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-sm font-medium text-white">No payment history available</p>
          <p className="text-xs text-gray-500">
            Payment processing has not been activated. Transaction history will appear here once you upgrade to a paid plan.
          </p>
        </div>
      </div>
    </div>
  )
}
