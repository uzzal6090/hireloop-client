import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { getCompanyById, updateCompany } from "@/lib/repositories/company.repository"
import { validateUpdateCompanyInput } from "@/lib/validations/company.validation"

const COMPANY_ID_REGEX = /^[0-9a-fA-F]{24}$/

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

function invalidCompanyId() {
  return errorResponse("Invalid company ID", 400)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await requireRole("recruiter")

    const { companyId } = await params
    if (typeof companyId !== "string" || !COMPANY_ID_REGEX.test(companyId)) {
      return invalidCompanyId()
    }

    const company = await getCompanyById(companyId)
    if (!company) {
      return errorResponse("Company not found", 404)
    }

    if (company.ownerId !== session.userId) {
      return errorResponse(
        "Forbidden: company is owned by another recruiter",
        403
      )
    }

    return NextResponse.json({ success: true, company })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch company", 500)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    await requireRole("recruiter")

    const { companyId } = await params
    if (typeof companyId !== "string" || !COMPANY_ID_REGEX.test(companyId)) {
      return invalidCompanyId()
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse("Invalid request body", 400)
    }

    const validation = validateUpdateCompanyInput(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validation.errors },
        { status: 400 }
      )
    }

    const existing = await getCompanyById(companyId)
    if (!existing) {
      return errorResponse("Company not found", 404)
    }

    const session = await requireRole("recruiter")
    if (existing.ownerId !== session.userId) {
      return errorResponse(
        "Forbidden: company is owned by another recruiter",
        403
      )
    }

    // Never allow modification of protected fields. `status` is accepted by
    // the update validator but must not be modifiable here; `_id`, `ownerId`
    // and `createdAt` are already rejected by the validator.
    const { status: _status, ...updates } = validation

    if (Object.keys(updates).length === 0) {
      return errorResponse("No updatable fields provided", 400)
    }

    const updated = await updateCompany(companyId, updates as never)
    if (!updated) {
      return errorResponse("Company not found or nothing to update", 404)
    }

    return NextResponse.json({ success: true, company: updated })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to update company", 500)
  }
}
