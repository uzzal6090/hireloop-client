import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import type { CreateJobInput } from "@/lib/models/job.model"
import { createJob, getJobsByRecruiter } from "@/lib/repositories/job.repository"
import { getCompanyById, getCompaniesByOwner } from "@/lib/repositories/company.repository"
import { validateJobInput } from "@/lib/validations/job.validation"

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
}

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

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
    const status = searchParams.get("status") || undefined
    const category = searchParams.get("category") || undefined
    const location = searchParams.get("location") || undefined

    const jobs = await getJobsByRecruiter(session.userId)

    // Filter by recruiter-owned companies is implicit: getJobsByRecruiter
    // already scopes by recruiterId. Apply optional filters in-memory since
    // the repository function does not accept filter args.
    let filtered = jobs
    if (status) filtered = filtered.filter((j) => j.status === status)
    if (category) filtered = filtered.filter((j) => j.category === category)
    if (location) filtered = filtered.filter((j) => j.location === location)

    const total = filtered.length
    const skip = (page - 1) * limit
    const pageJobs = filtered.slice(skip, skip + limit)

    // Attach company name for display
    const companies = await getCompaniesByOwner(session.userId)
    const companyMap = new Map<string, string>()
    for (const c of companies) {
      companyMap.set(c._id.toString(), c.name)
    }

    const jobsWithCompany = pageJobs.map((j) => ({
      ...j,
      companyName: companyMap.get(j.companyId.toString()) ?? null,
    }))

    return NextResponse.json({
      success: true,
      jobs: jobsWithCompany,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch jobs", 500)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole("recruiter")

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
        { success: false, error: "Invalid input", errors: ["Job data must be an object"] },
        { status: 400 }
      )
    }

    const data = body as Record<string, unknown>

    // Auto-generate a slug from the title when the client does not supply one.
    const title = typeof data.title === "string" ? data.title : ""
    const providedSlug =
      typeof data.slug === "string" ? data.slug.trim() : ""
    const slug = providedSlug || slugify(title)

    // Derive recruiterId exclusively from the authenticated session. The
    // validator requires recruiterId, so we inject the session value then
    // override any client-provided value below.
    const input = { ...data, recruiterId: session.userId, slug } as unknown

    const validation = validateJobInput(input)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validation.errors },
        { status: 400 }
      )
    }

    // Never trust client-provided recruiterId or status.
    const createInput = {
      ...validation,
      recruiterId: session.userId,
      status: "draft" as const,
    } as CreateJobInput

    // Validate that the selected company exists and belongs to the recruiter.
    const company = await getCompanyByOwnerCheck(createInput.companyId, session.userId)
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          errors: ["Company not found or not owned by this recruiter"],
        },
        { status: 400 }
      )
    }

    try {
      const job = await createJob(createInput)
      return NextResponse.json({ success: true, job }, { status: 201 })
    } catch (err: unknown) {
      const mongoErr = err as { code?: number; message?: string } | undefined
      if (mongoErr?.code === 11000) {
        return errorResponse("A job with this slug already exists", 409)
      }
      throw err
    }
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to create job", 500)
  }
}

async function getCompanyByOwnerCheck(
  companyId: unknown,
  ownerId: string
): Promise<{ _id: string; name: string } | null> {
  // companyId may arrive as a string (from JSON body) or as an ObjectId
  // (if validateJobInput converted it). Normalize to a hex string.
  const idStr =
    typeof companyId === "string" ? companyId : String(companyId)
  if (idStr.trim() === "") {
    return null
  }
  if (!/^[0-9a-fA-F]{24}$/.test(idStr)) {
    return null
  }
  const company = await getCompanyById(idStr)
  if (!company || company.ownerId !== ownerId) {
    return null
  }
  return { _id: company._id.toString(), name: company.name }
}
