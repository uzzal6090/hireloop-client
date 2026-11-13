import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { getJobById, updateJob, deleteJob } from "@/lib/repositories/job.repository"
import { getCompanyById } from "@/lib/repositories/company.repository"
import { ensureDefaultSubscription } from "@/lib/repositories/subscription.repository"
import { validateUpdateJobInput } from "@/lib/validations/job.validation"

const JOB_ID_REGEX = /^[0-9a-fA-F]{24}$/

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

function invalidJobId() {
  return errorResponse("Invalid job ID", 400)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole("recruiter")

    const { jobId } = await params
    if (typeof jobId !== "string" || !JOB_ID_REGEX.test(jobId)) {
      return invalidJobId()
    }

    const job = await getJobById(jobId)
    if (!job) {
      return errorResponse("Job not found", 404)
    }

    if (job.recruiterId !== session.userId) {
      return errorResponse(
        "Forbidden: job is owned by another recruiter",
        403
      )
    }

    return NextResponse.json({ success: true, job })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch job", 500)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole("recruiter")

    const { jobId } = await params
    if (typeof jobId !== "string" || !JOB_ID_REGEX.test(jobId)) {
      return invalidJobId()
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse("Invalid request body", 400)
    }

    const validation = validateUpdateJobInput(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validation.errors },
        { status: 400 }
      )
    }

    const existing = await getJobById(jobId)
    if (!existing) {
      return errorResponse("Job not found", 404)
    }

    if (existing.recruiterId !== session.userId) {
      return errorResponse(
        "Forbidden: job is owned by another recruiter",
        403
      )
    }

    // If companyId is being updated, verify the new company belongs to the
    // same recruiter. The validator rejects companyId as a protected field,
    // but we defend in depth by checking the raw body as well.
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const raw = body as Record<string, unknown>
      if ("companyId" in raw && raw.companyId !== undefined) {
        const company = await getCompanyById(
          String(raw.companyId)
        )
        if (!company || company.ownerId !== session.userId) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid input",
              errors: ["Company not found or not owned by this recruiter"],
            },
            { status: 400 }
          )
        }
      }
    }

    // If the job is being published, verify the associated company is
    // approved before allowing the transition.
    if (validation.status === "published") {
      const company = await getCompanyById(
        existing.companyId.toString()
      )
      if (!company) {
        return errorResponse(
          "Forbidden: job's company does not exist",
          403
        )
      }
      if (company.ownerId !== session.userId) {
        return errorResponse(
          "Forbidden: job's company is owned by another recruiter",
          403
        )
      }
      if (company.status !== "approved") {
        return errorResponse(
          "Forbidden: company must be approved before publishing a job",
          403
        )
      }

      // Enforce job limit: only count when transitioning from a non-published
      // state. An already published job being updated does not consume an
      // additional slot. Published jobs are counted across all companies owned
      // by this recruiter.
      if (existing.status !== "published") {
        const subscription = await ensureDefaultSubscription(existing.recruiterId)
        const publishedJobsCount = await db.collection("jobs").countDocuments({
          recruiterId: existing.recruiterId,
          status: "published",
        })
        if (publishedJobsCount >= subscription.jobLimit) {
          return errorResponse(
            `Job limit reached: you can publish at most ${subscription.jobLimit} jobs on your current plan.`,
            403
          )
        }
      }
    }

    // The validator already strips protected fields (_id, companyId,
    // recruiterId, createdAt). Pass the validated updates directly.
    const updates: Record<string, unknown> = { ...validation }
    // Status changes are allowed (close/reopen), but recruiterId is never
    // permitted to change.
    delete updates.recruiterId

    if (Object.keys(updates).length === 0) {
      return errorResponse("No updatable fields provided", 400)
    }

    const updated = await updateJob(jobId, updates as never)
    if (!updated) {
      return errorResponse("Job not found or nothing to update", 404)
    }

    return NextResponse.json({ success: true, job: updated })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to update job", 500)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole("recruiter")

    const { jobId } = await params
    if (typeof jobId !== "string" || !JOB_ID_REGEX.test(jobId)) {
      return invalidJobId()
    }

    const existing = await getJobById(jobId)
    if (!existing) {
      return errorResponse("Job not found", 404)
    }

    if (existing.recruiterId !== session.userId) {
      return errorResponse(
        "Forbidden: job is owned by another recruiter",
        403
      )
    }

    const deleted = await deleteJob(jobId)
    if (!deleted) {
      return errorResponse("Job not found or could not be deleted", 404)
    }

    return NextResponse.json({ success: true, message: "Job deleted" })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to delete job", 500)
  }
}
