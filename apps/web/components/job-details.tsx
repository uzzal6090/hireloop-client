"use client"

import {
  ArrowLeft,
  Building2,
  Clock,
  MapPin,
  Bookmark,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Send,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export interface PublicCompany {
  _id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  industry: string | null
  companySize: string | null
  location: string | null
  foundedYear: number | null
}

export interface PublicJob {
  _id: string
  title: string
  slug: string
  description: string
  requirements: string | null
  responsibilities: string | null
  benefits: string | null
  employmentType: string
  workplaceType: string
  location: string | null
  salary: string | null
  experienceLevel: string | null
  skills: string[]
  category: string | null
  applicationDeadline: string | null
  createdAt: string
  company: PublicCompany
}

export type ViewerRole = "seeker" | "recruiter" | "admin" | null

interface JobDetailsProps {
  job: PublicJob
  company: PublicCompany
  viewerRole: ViewerRole
  isAuthenticated: boolean
  isJobOwner: boolean
  isApplied: boolean
  isApplying: boolean
  isSaved: boolean
  isSaving: boolean
  appError: string | null
  onApply: () => void
  onSave?: () => void
  onEdit?: () => void
  onManage?: () => void
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

function renderCompanyLogo({ logo, name }: { logo: string | null; name: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        className="h-full w-full object-cover rounded-2xl"
        loading="lazy"
      />
    )
  }
  return (
    <span className="text-sm font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function primaryActionButton({
  isJobOwner,
  viewerRole,
  isAuthenticated,
  isApplied,
  isApplying,
  onEdit,
  onManage,
  onApply,
}: {
  isJobOwner: boolean
  viewerRole: ViewerRole
  isAuthenticated: boolean
  isApplied: boolean
  isApplying: boolean
  onEdit?: () => void
  onManage?: () => void
  onApply: () => void
}) {
  if (isJobOwner && viewerRole === "recruiter" && onEdit && onManage) {
    return (
      <>
        <Button
          onClick={onEdit}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all mb-3"
        >
          <Send className="h-4 w-4 mr-2" /> Edit Job
        </Button>
        <Button
          onClick={onManage}
          variant="outline"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
        >
          Manage
        </Button>
      </>
    )
  }

  if (isAuthenticated && viewerRole === "seeker") {
    if (isApplied) {
      return (
        <Button
          disabled
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" /> Applied
        </Button>
      )
    }
    return (
      <Button
        onClick={onApply}
        disabled={isApplying}
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isApplying ? (
          <>
            <Send className="h-4 w-4 mr-2" /> Applying...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" /> Apply Now
          </>
        )}
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
      >
        Sign in to Apply
      </Button>
    )
  }

  return (
    <Button
      disabled
      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
    >
      Not Eligible to Apply
    </Button>
  )
}

function saveButton({
  isSaved,
  isSaving,
  onSave,
}: {
  isSaved: boolean
  isSaving: boolean
  onSave: () => void
}) {
  return (
    <Button
      onClick={onSave}
      disabled={isSaving}
      variant="ghost"
      size="sm"
      aria-label={isSaved ? "Unsave job" : "Save job"}
      className={cn(
        "w-auto text-xs",
        isSaved
          ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
          : "text-gray-500 hover:bg-white/10 hover:text-white"
      )}
    >
      <Bookmark
        className="h-4 w-4"
        fill={isSaved ? "currentColor" : "none"}
      />
      <span className="ml-1.5">{isSaved ? "Saved" : "Save"}</span>
    </Button>
  )
}

function applyStatusCard({
  isAuthenticated,
  isApplied,
  isApplying,
  appError,
  onApply,
}: {
  isAuthenticated: boolean
  isApplied: boolean
  isApplying: boolean
  appError: string | null
  onApply: () => void
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-sm font-semibold text-white mb-3">
        Ready to apply?
      </h3>
      {isApplied ? (
        <p className="text-xs text-emerald-400 mt-1">
          You have already applied to this job.
        </p>
      ) : appError ? (
        <p className="text-xs text-red-400 mt-1">{appError}</p>
      ) : !isAuthenticated ? (
        <p className="text-xs text-gray-400 mt-1">
          Sign in to submit your application.
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-1">
          Submit your application in one click.
        </p>
      )}
      {!isAuthenticated && (
        <Link
          href="/signin"
          className="block mt-3 text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4"
        >
          Sign in to apply
        </Link>
      )}
    </div>
  )
}

export function JobDetails({
  job,
  company,
  viewerRole,
  isAuthenticated,
  isJobOwner,
  isApplied,
  isApplying,
  isSaved,
  isSaving,
  appError,
  onApply,
  onSave,
  onEdit,
  onManage,
}: JobDetailsProps) {
  const canApply = isAuthenticated && viewerRole === "seeker" && !isApplied
  const canSave = isAuthenticated && viewerRole === "seeker" && !!onSave

  return (
    <div className="min-h-svh bg-[#0a0a0a] px-6 lg:px-10 py-12">
      {/* Breadcrumb / Back Navigation */}
      <div className="mb-8">
        <Link href="/jobs">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Jobs
          </Button>
        </Link>
      </div>

      {/* Job Hero */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
            {renderCompanyLogo({ logo: company.logo, name: company.name })}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                {company.industry}
              </span>
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                {job.employmentType}
              </span>
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                {job.workplaceType}
              </span>
              {job.experienceLevel && (
                <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                  {job.experienceLevel}
                </span>
              )}
              {isJobOwner && viewerRole === "recruiter" && (
                <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300">
                  Your Job
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {job.title}
            </h1>
            <p className="text-lg font-medium text-white mb-1">
              {company.name}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{job.location ?? "Remote"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDate(job.createdAt)} posted</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-shrink-0">
            {primaryActionButton({
              isJobOwner,
              viewerRole,
              isAuthenticated,
              isApplied,
              isApplying,
              onEdit,
              onManage,
              onApply,
            })}
            {canSave && saveButton({ isSaved, isSaving, onSave: onSave! })}
          </div>
        </div>
      </div>

      {/* Job Metadata Grid */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Job Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {job.salary && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Salary
              </p>
              <p className="text-sm text-white">{job.salary}</p>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Category
            </p>
            <p className="text-sm text-white">{job.category ?? "—"}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Application Deadline
            </p>
            <p className="text-sm text-white">
              {job.applicationDeadline ?? "Not specified"}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {job.skills.length > 0 ? (
                job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-medium text-gray-500">
                  Not specified
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Employment Type
            </p>
            <p className="text-sm text-white">{job.employmentType}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Workplace
            </p>
            <p className="text-sm text-white">{job.workplaceType}</p>
          </div>
          {job.experienceLevel && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Experience
              </p>
              <p className="text-sm text-white">{job.experienceLevel}</p>
            </div>
          )}
          {job.location && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Location
              </p>
              <p className="text-sm text-white">{job.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Description / Content */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          Job Description
        </h2>
        <div className="space-y-6">
          <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
            {job.description}
          </div>
          {job.responsibilities && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Responsibilities
              </h3>
              <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {job.responsibilities}
              </div>
            </div>
          )}
          {job.requirements && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Requirements
              </h3>
              <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}
          {job.benefits && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Benefits
              </h3>
              <div className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {job.benefits}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        {(canApply || isApplied || !!appError) && applyStatusCard({
          isAuthenticated,
          isApplied,
          isApplying,
          appError,
          onApply,
        })}

        {/* About Company */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            About {company.name}
          </h2>
          <div className="flex items-start gap-4 mb-4">
            <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
              {renderCompanyLogo({ logo: company.logo, name: company.name })}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white">{company.name}</h3>
              {company.industry && (
                <p className="text-xs text-gray-400">{company.industry}</p>
              )}
              {company.location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{company.location}</span>
                </div>
              )}
            </div>
          </div>
          {company.description && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Description
              </p>
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {company.description}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {company.companySize && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>{company.companySize}</span>
              </div>
            )}
            {company.foundedYear && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Founded {company.foundedYear}</span>
              </div>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Visit Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Similar Jobs placeholder - only if data support exists */}
        {/* Similar jobs section intentionally omitted - no existing API support */}
      </div>
    </div>
  )
}
