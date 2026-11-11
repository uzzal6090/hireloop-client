import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { removeSavedJob } from "@/lib/repositories/saved-job.repository"
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

function invalidJobId() {
  return errorResponse("Invalid job ID", 400)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireRole("seeker")

    const { jobId } = await params

    const jobIdResult = validateObjectId(jobId, "jobId")
    if (!jobIdResult.success) {
      return invalidJobId()
    }

    const result = await removeSavedJob(session.userId, jobIdResult.value)
    if (!result.success) {
      if (result.error === "Saved job not found") {
        return errorResponse("Saved job not found", 404)
      }
      return errorResponse("Failed to remove saved job", 500)
    }

    return NextResponse.json({ success: true, message: "Job unsaved" })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to remove saved job", 500)
  }
}
