import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import type { CreateCompanyInput } from "@/lib/models/company.model"
import { createCompany, getCompaniesByOwner } from "@/lib/repositories/company.repository"
import { validateCompanyInput } from "@/lib/validations/company.validation"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
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

export async function GET() {
  try {
    const session = await requireRole("recruiter")
    const companies = await getCompaniesByOwner(session.userId)
    return NextResponse.json({ success: true, companies })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch companies", 500)
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
        { success: false, error: "Invalid input", errors: ["Company data must be an object"] },
        { status: 400 }
      )
    }

    const data = body as Record<string, unknown>

    // Auto-generate a slug from the company name when the client does not
    // supply one. The slug is required by the validator but is not part of
    // the registration form UI.
    const name = typeof data.name === "string" ? data.name : ""
    const providedSlug =
      typeof data.slug === "string" ? data.slug.trim() : ""
    const slug = providedSlug || slugify(name)

    // Derive ownerId exclusively from the authenticated session so the
    // existing validator (which requires a valid ownerId) can run, then
    // override any client-provided ownerId below.
    const input = { ...data, ownerId: session.userId, slug } as unknown

    const validation = validateCompanyInput(input)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validation.errors },
        { status: 400 }
      )
    }

    // Never trust client-provided ownerId or status.
    const createInput = {
      ...validation,
      ownerId: session.userId,
      status: "pending" as const,
    } as CreateCompanyInput

    try {
      const company = await createCompany(createInput)
      return NextResponse.json({ success: true, company }, { status: 201 })
    } catch (err: unknown) {
      const mongoErr = err as { code?: number; message?: string } | undefined
      if (mongoErr?.code === 11000) {
        return errorResponse("A company with this slug already exists", 409)
      }
      throw err
    }
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to create company", 500)
  }
}
