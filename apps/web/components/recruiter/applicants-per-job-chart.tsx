"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { FileText } from "lucide-react"

interface JobStat {
  jobId: string
  jobTitle: string
  applicantCount: number
}

interface ApplicantsPerJobChartProps {
  jobStats: JobStat[]
}

export function ApplicantsPerJobChart({ jobStats }: ApplicantsPerJobChartProps) {
  const hasData = jobStats.length > 0 && jobStats.some((j) => j.applicantCount > 0)

  if (!hasData) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <FileText className="h-12 w-12 text-gray-600" />
        <p className="text-sm text-gray-400">No application data yet.</p>
        <p className="text-xs text-gray-500">
          Applications will appear here as candidates apply to your jobs.
        </p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={jobStats.slice(0, 10)} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="jobTitle"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar
            dataKey="applicantCount"
            fill="url(#barGrad)"
            radius={[6, 6, 0, 0]}
          />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
