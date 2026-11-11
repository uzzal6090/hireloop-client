import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { ObjectId } from "mongodb"
import { normalizePagination } from "@/lib/validations/shared.validation"

const COMPANIES_COLLECTION = "companies"
const USERS_COLLECTION = "user"

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

const COMPANY_STATUSES: string[] = ["pending", "approved", "rejected", "suspended"]

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

export async function GET(req: Request) {
  try {
    const session = await requireRole("admin")

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const { page: safePage, limit: safeLimit } = normalizePagination(
      searchParams.get("page"),
      searchParams.get("limit")
    )

    const filter: Record<string, unknown> = {}
    if (status && COMPANY_STATUSES.includes(status)) {
      filter.status = status
    }

    const skip = (safePage - 1) * safeLimit

    const [docs, total] = await Promise.all([
      db.collection(COMPANIES_COLLECTION)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .toArray(),
      db.collection(COMPANIES_COLLECTION).countDocuments(filter),
    ])

    const companiesWithOwner = await Promise.all(
      docs.map(async (doc) => {
        const ownerInfo = await getOwnerInfo(doc.ownerId as string)
        return {
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
        }
      })
    )

    return NextResponse.json({
      success: true,
      companies: companiesWithOwner,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    })
  } catch (err) {
    const handled = sessionError(err)
    if (handled) return handled
    return errorResponse("Failed to fetch companies", 500)
  }
}
