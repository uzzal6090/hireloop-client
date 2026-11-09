"use client"

import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { SectionHeader } from "../../components/ui"

export default function RecruiterApplicationsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Applications"
        subtitle="Review and manage applications submitted to your job posts."
      />

      {/* Empty state — no backend API data available yet */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
          <FileText className="h-7 w-7 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No application data available
        </h3>
        <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
          Application records are not yet connected to a backend data source.
          Once the applications API is integrated, this page will list applicants
          who applied to your job posts, with their name, email, applied job,
          application date, resume, and current status.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/dashboard/recruiter/jobs"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowRight className="h-4 w-4" /> View Manage Jobs
          </Link>
        </div>
      </div>

      {/* Placeholder for future application table */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Backend Integration Required
        </h4>
        <ul className="text-sm text-gray-500 space-y-2 list-disc pl-5 max-w-md mx-auto">
          <li>Applications API endpoint not yet implemented</li>
          <li>Recruiter-scoped application data not available</li>
          <li>Status update flow (Applied → Offered/Rejected) pending backend</li>
        </ul>
      </div>
    </div>
  )
}
