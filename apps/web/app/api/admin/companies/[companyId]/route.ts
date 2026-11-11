import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { validateUpdateCompanyInput } from "@/lib/validations/company.validation"

const COMPANIES_COLLECTION = "companies"
const USERS_COLLECTION = "user"
const COMPANY_ID_REGEX = /^[0-9a-fA-F]{24}$/
const COMPANY_STATUSES: string[] = ["pending", "approved", "rejected", "suspended"]

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

async function getOwnerInfo(ownerId: string): Promise<{ email?: string; name?: string } | null> {
  try {
    const user = await db.collection(USERS_COLLECTION).findOne(
      { _id: new ObjectId(ownerId) },
      { projection: { email: 1, name: 1 } }
    )
    return user ? { email: user.email as string | undefined, name: user.name as string | undefined } : null
  } catch {
    return null
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<unknown> }
) {
  try {
    const session = await requireRole("admin")

    const { companyId } = (await params) as { companyId: string }
    if (typeof companyId !== "string" || !COMPANY_ID_REGEX.test(companyId)) {
      return invalidCompanyId()
    }

    const doc = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(companyId) })
    if (!doc) {
      return errorResponse("Company not found", 404)
    }

    const ownerInfo = await getOwnerInfo(doc.ownerId as string)

    return NextResponse.json({
      success: true,
      company: {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        logo: doc.logo,
        website: doc.website,
        industry: doc.industry,
        companySize: doc.companySize,
        location: doc.location,
        foundedYear: doc.foundedYear,
        ownerId: doc.ownerId,
        ownerEmail: ownerInfo?.email,
        ownerName: ownerInfo?.name,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch company", 500)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<unknown> }
) {
  try {
    const session = await requireRole("admin")

    const { companyId } = (await params) as { companyId: string }
    if (typeof companyId !== "string" || !COMPANY_ID_REGEX.test(companyId)) {
      return invalidCompanyId()
    }

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

    const validation = validateUpdateCompanyInput(data)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", errors: validation.errors },
        { status: 400 }
      )
    }

    const existing = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(companyId) })
    if (!existing) {
      return errorResponse("Company not found", 404)
    }

    // Validate status transition if status is being changed
    if (validation.status !== undefined && validation.status !== existing.status) {
      if (!COMPANY_STATUSES.includes(validation.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid input", errors: [`Status must be one of: ${COMPANY_STATUSES.join(", ")}`] },
          { status: 400 }
        )
      }
    }

    const updateDoc: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(validation)) {
      if (key === "status") {
        updateDoc.status = value
      }
    }

    if (Object.keys(updateDoc).length === 0) {
      return errorResponse("No updatable fields provided", 400)
    }

    updateDoc.updatedAt = new Date()

    const result = await db.collection(COMPANIES_COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(companyId) },
      { $set: updateDoc },
      { returnDocument: "after" }
    )

    if (!result) {
      return errorResponse("Company not found", 404)
    }

    const updatedDoc = result as { _id: ObjectId; ownerId: string; status: string; [key: string]: unknown }
    const ownerInfo = await getOwnerInfo(updatedDoc.ownerId)

    return NextResponse.json({
      success: true,
      company: {
        _id: updatedDoc._id.toString(),
        name: updatedDoc.name,
        slug: updatedDoc.slug,
        description: updatedDoc.description,
        logo: updatedDoc.logo,
        website: updatedDoc.website,
        industry: updatedDoc.industry,
        companySize: updatedDoc.companySize,
        location: updatedDoc.location,
        foundedYear: updatedDoc.foundedYear,
        ownerId: updatedDoc.ownerId,
        ownerEmail: ownerInfo?.email,
        ownerName: ownerInfo?.name,
        status: updatedDoc.status,
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
      },
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to update company", 500)
  }
}
