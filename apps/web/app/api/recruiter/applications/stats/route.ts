import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { getJobsByRecruiter } from "@/lib/repositories/job.repository"
import { validateDate } from "@/lib/validations/shared.validation"

const APPLICATIONS_COLLECTION = "applications"

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

function sessionError(err: unknown): NextResponse | null {
  if (err instanceof Error) {
    if (err.message === "Unauthorized: No valid session") {
      return errorResponse("Unauthorized: session required", 401)
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

    // Get recruiter's jobs to establish ownership boundary
    const recruiterJobs = await getJobsByRecruiter(recruiterId)
    const recruiterJobIds = recruiterJobs.map((j) => j._id)
    const jobMap = new Map(
      recruiterJobs.map((j) => [j._id.toString(), { title: j.title }])
    )

    if (recruiterJobIds.length === 0) {
      return NextResponse.json({
        success: true,
        stats: [],
      })
    }

    // Build date range filter (UTC boundaries)
    const dateFilter: Record<string, unknown> = {}
    if (startDateUtc) {
      dateFilter.$gte = startDateUtc
    }
    if (endDateUtc) {
      const endDateExclusive = new Date(endDateUtc)
      endDateExclusive.setUTCDate(endDateExclusive.getUTCDate() + 1)
      dateFilter.$lt = endDateExclusive
    }

    // Aggregate application counts per job at the database level
    const stats = await db
      .collection(APPLICATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            jobId: { $in: recruiterJobIds },
            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
          },
        },
        {
          $group: {
            _id: "$jobId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Map aggregated results to include job titles
    const statsWithTitles = stats.map((s) => {
      const jobId = s._id.toString()
      const jobInfo = jobMap.get(jobId)
      return {
        jobId,
        jobTitle: jobInfo?.title || "Unknown Job",
        applicantCount: s.count,
      }
    })

    // Include all recruiter jobs, even those with zero applicants
    const allJobsStats = recruiterJobs.map((job) => {
      const existing = statsWithTitles.find((r) => r.jobId === job._id.toString())
      return {
        jobId: job._id.toString(),
        jobTitle: job.title,
        applicantCount: existing?.applicantCount || 0,
      }
    })

    return NextResponse.json({
      success: true,
      stats: allJobsStats,
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch application stats", 500)
  }
}
