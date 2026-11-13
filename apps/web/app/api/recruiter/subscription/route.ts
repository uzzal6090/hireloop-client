import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { ensureDefaultSubscription } from "@/lib/repositories/subscription.repository"

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

export async function GET(_req: Request) {
  try {
    const session = await requireRole("recruiter")
    const userId = session.userId

    // Ensure a default Free subscription exists for this recruiter.
    // userId comes exclusively from the authenticated session; client-supplied
    // userId is never accepted.
    const subscription = await ensureDefaultSubscription(userId)

    // Count published jobs across all companies owned by this recruiter.
    const publishedJobsCount = await db.collection("jobs").countDocuments({
      recruiterId: userId,
      status: "published",
    })

    const jobLimit = subscription.jobLimit
    const remainingJobs = Math.max(0, jobLimit - publishedJobsCount)

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id.toString(),
        userId: subscription.userId,
        planId: subscription.planId,
        planName: subscription.planName,
        jobLimit: subscription.jobLimit,
        status: subscription.status,
      },
      usage: {
        activeJobs: publishedJobsCount,
        jobLimit,
        remainingJobs,
      },
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch subscription", 500)
  }
}
