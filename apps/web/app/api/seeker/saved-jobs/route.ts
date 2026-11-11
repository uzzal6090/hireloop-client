import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import {
  saveJob,
  getSavedJobs,
} from "@/lib/repositories/saved-job.repository"
import { getJobById } from "@/lib/repositories/job.repository"
import { getCompanyById } from "@/lib/repositories/company.repository"
import { validateObjectId } from "@/lib/validations/shared.validation"

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
    const session = await requireRole("seeker")

    const savedJobs = await getSavedJobs(session.userId)

    return NextResponse.json({
      success: true,
      savedJobs,
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch saved jobs", 500)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole("seeker")

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse("Invalid request body", 400)
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: ["Request body must be an object"] },
        { status: 400 }
      )
    }

    const data = body as Record<string, unknown>

    const jobIdResult = validateObjectId(data.jobId, "jobId")
    if (!jobIdResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: jobIdResult.errors },
        { status: 400 }
      )
    }

    const job = await getJobById(jobIdResult.value)
    if (!job) {
      return errorResponse("Job not found", 404)
    }

    if (job.status !== "published") {
      return errorResponse("Job not found", 404)
    }

    const company = await getCompanyById(job.companyId.toString())
    if (!company) {
      return errorResponse("Job not found", 404)
    }

    if (company.status !== "approved") {
      return errorResponse("Job not found", 404)
    }

    const result = await saveJob(session.userId, jobIdResult.value)
    if (!result.success) {
      if (result.error === "Job already saved") {
        return errorResponse("Job already saved", 409)
      }
      return errorResponse("Failed to save job", 500)
    }

    return NextResponse.json(
      { success: true, savedJob: result.savedJob },
      { status: 201 }
    )
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to save job", 500)
  }
}
