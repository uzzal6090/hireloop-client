import { type LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: string; positive: boolean }
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-purple-400",
  iconBg = "bg-purple-500/10",
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </span>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white leading-none">{value}</p>
        {trend && (
          <p
            className={cn(
              "mt-1.5 text-xs font-medium",
              trend.positive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  applied:        "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "under review": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  shortlisted:    "bg-purple-500/15 text-purple-400 border-purple-500/30",
  rejected:       "bg-red-500/15 text-red-400 border-red-500/30",
  offered:        "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  paid:           "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  active:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  closed:         "bg-gray-500/15 text-gray-400 border-gray-500/30",
  draft:          "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  pending:        "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  approved:       "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  suspended:      "bg-red-500/15 text-red-400 border-red-500/30",
  seeker:         "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  recruiter:      "bg-purple-500/15 text-purple-400 border-purple-500/30",
  admin:          "bg-pink-500/15 text-pink-400 border-pink-500/30",
  free:           "bg-gray-500/15 text-gray-400 border-gray-500/30",
  pro:            "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  premium:        "bg-purple-500/15 text-purple-400 border-purple-500/30",
  growth:         "bg-blue-500/15 text-blue-400 border-blue-500/30",
  enterprise:     "bg-pink-500/15 text-pink-400 border-pink-500/30",
}

export function StatusBadge({ status }: { status: string }) {
  const style =
    statusStyles[status.toLowerCase()] ??
    "bg-gray-500/15 text-gray-400 border-gray-500/30"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        style
      )}
    >
      {status}
    </span>
  )
}
