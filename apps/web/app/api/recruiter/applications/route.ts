import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { requireRole } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { getJobsByRecruiter } from "@/lib/repositories/job.repository"
import { getCompanyById } from "@/lib/repositories/company.repository"
import {
  normalizePagination,
  validateDate,
} from "@/lib/validations/shared.validation"
import { validateObjectId } from "@/lib/validations/shared.validation"
import type { Application } from "@/lib/models/application.model"

const APPLICATIONS_COLLECTION = "applications"
const USERS_COLLECTION = "user"

const APPLICATION_STATUSES = [
  "applied",
  "under_review",
  "shortlisted",
  "rejected",
  "offered",
  "accepted",
] as const

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

function sessionError(err: unknown): NextResponse | null {
  if (err instanceof Error) {
    if (err.message === "Unauthorized: No valid session") {
      return errorResponse("Unauthenticated: session required", 401)
    }
    if (err.message.startsWith("Forbidden:")) {
      return errorResponse(err.message, 403)
    }
  }
  return null
}

export async function GET(req: Request) {
  try {
    const session = await requireRole("recruiter")
    const recruiterId = session.userId

    const { searchParams } = new URL(req.url)
    const jobIdParam = searchParams.get("jobId") || undefined
    const statusParam = searchParams.get("status") || undefined
    const { page: safePage, limit: safeLimit } = normalizePagination(
      searchParams.get("page"),
      searchParams.get("limit")
    )

    // Validate jobId if provided
    if (jobIdParam) {
      const jobIdResult = validateObjectId(jobIdParam, "jobId")
      if (!jobIdResult.success) {
        return errorResponse("Invalid job ID", 400)
      }
    }

    // Validate status if provided
    if (statusParam && !APPLICATION_STATUSES.includes(statusParam as typeof APPLICATION_STATUSES[number])) {
      return errorResponse("Invalid status", 400)
    }

    // Validate date range parameters
    let startDateUtc: Date | null = null
    let endDateUtc: Date | null = null

    const startDateParam = searchParams.get("startDate") || undefined
    const endDateParam = searchParams.get("endDate") || undefined

    if (startDateParam) {
      const startDateResult = validateDate(startDateParam, "startDate")
      if (!startDateResult.success) {
        return errorResponse(startDateResult.errors.join(", "), 400)
      }
      startDateUtc = startDateResult.value
    }

    if (endDateParam) {
      const endDateResult = validateDate(endDateParam, "endDate")
      if (!endDateResult.success) {
        return errorResponse(endDateResult.errors.join(", "), 400)
      }
      endDateUtc = endDateResult.value
    }

    if (startDateUtc && endDateUtc && startDateUtc > endDateUtc) {
      return errorResponse("startDate must be before or equal to endDate", 400)
    }

    // Get recruiter's owned jobs to establish the ownership boundary
    const recruiterJobs = await getJobsByRecruiter(recruiterId)
    const recruiterJobIds = recruiterJobs.map((j) => j._id)
    const jobMap = new Map(
      recruiterJobs.map((j) => [j._id.toString(), { title: j.title, companyId: j.companyId }])
    )

    // If jobId supplied, verify it belongs to this recruiter
    if (jobIdParam && !jobMap.has(jobIdParam)) {
      return errorResponse("Job not found or not owned by this recruiter", 404)
    }

    // Build MongoDB filter at the database level
    const filter: Record<string, unknown> = {}
    if (jobIdParam) {
      filter.jobId = new ObjectId(jobIdParam)
    } else if (recruiterJobIds.length > 0) {
      filter.jobId = { $in: recruiterJobIds }
    } else {
      // Recruiter has no jobs; match nothing
      filter.jobId = { $in: [] }
    }
    if (statusParam) {
      filter.status = statusParam
    }

    // Apply date range filter (UTC boundaries)
    if (startDateUtc || endDateUtc) {
      const dateFilter: Record<string, unknown> = {}
      if (startDateUtc) {
        dateFilter.$gte = startDateUtc
      }
      if (endDateUtc) {
        const endDateExclusive = new Date(endDateUtc)
        endDateExclusive.setUTCDate(endDateExclusive.getUTCDate() + 1)
        dateFilter.$lt = endDateExclusive
      }
      filter.createdAt = dateFilter
    }

    const skip = (safePage - 1) * safeLimit

    const [applications, total] = await Promise.all([
      db.collection(APPLICATIONS_COLLECTION)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .toArray(),
      db.collection(APPLICATIONS_COLLECTION).countDocuments(filter),
    ])

    if (applications.length === 0) {
      return NextResponse.json({
        success: true,
        applications: [],
        total: 0,
        page: safePage,
        limit: safeLimit,
        totalPages: 0,
      })
    }

    // Batch fetch company names
    const companyIds = [...new Set(applications.map((a) => a.companyId.toString()))]
    const companies = await db.collection("companies").find(
      { _id: { $in: companyIds.map((id) => new ObjectId(id)) } },
      { projection: { _id: 1, name: 1 } }
    ).toArray()
    const companyMap = new Map(companies.map((c) => [c._id.toString(), c.name]))

    // Batch fetch seeker info (name and email only — never password or secrets)
    const seekerIds = [...new Set(applications.map((a) => a.seekerId))]
    const seekers = await db.collection(USERS_COLLECTION).find(
      { _id: { $in: seekerIds.map((id) => new ObjectId(id)) } },
      { projection: { _id: 1, name: 1, email: 1 } }
    ).toArray()
    const seekerMap = new Map(seekers.map((s) => [s._id.toString(), { name: s.name, email: s.email }]))

    // Enrich applications with job title, company name, seeker name/email
    const enriched = applications.map((app) => {
      const a = app as Application
      const jobInfo = jobMap.get(a.jobId.toString())
      const companyName = companyMap.get(a.companyId.toString()) || null
      const seekerInfo = seekerMap.get(a.seekerId) || { name: null, email: null }

      return {
        _id: a._id.toString(),
        seekerId: a.seekerId,
        seekerName: seekerInfo.name,
        seekerEmail: seekerInfo.email,
        jobId: a.jobId.toString(),
        jobTitle: jobInfo?.title || null,
        companyId: a.companyId.toString(),
        companyName,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      applications: enriched,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch applications", 500)
  }
}
