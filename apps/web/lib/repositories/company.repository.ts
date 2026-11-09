import { db, client } from "../db"
import { ObjectId } from "mongodb"
import type { Company, CreateCompanyInput, UpdateCompanyInput } from "../models/company.model"
import { normalizePagination } from "../validations/shared.validation"

const COMPANIES_COLLECTION = "companies"

function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const now = new Date()
  const doc: Omit<Company, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    name: input.name,
    slug: input.slug,
    description: input.description ?? "",
    logo: input.logo ?? null,
    website: input.website ?? null,
    industry: input.industry ?? null,
    companySize: input.companySize ?? null,
    location: input.location ?? null,
    foundedYear: input.foundedYear ?? null,
    ownerId: input.ownerId,
    status: input.status ?? "pending",
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(COMPANIES_COLLECTION).insertOne(doc)

  return doc as Company
}

export async function getCompanyById(id: string): Promise<Company | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return null
  }

  const doc = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(id) })
  return doc ? (doc as Company) : null
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const doc = await db.collection(COMPANIES_COLLECTION).findOne({ slug })
  return doc ? (doc as Company) : null
}

export async function getCompaniesByOwner(ownerId: string): Promise<Company[]> {
  const docs = await db.collection(COMPANIES_COLLECTION)
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray()
  return docs as Company[]
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<Company | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return null
  }

  const protectedFields = ["_id", "ownerId", "createdAt"]
  const updateDoc: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (protectedFields.includes(key)) {
      continue
    }
    updateDoc[key] = value
  }

  if (Object.keys(updateDoc).length === 0) {
    return null
  }

  updateDoc.updatedAt = new Date()

  const result = await db.collection(COMPANIES_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: "after" }
  )

  return result ? (result as Company) : null
}

export async function getCompanies({
  page = 1,
  limit = 20,
  status,
}: { page?: number; limit?: number; status?: string } = {}): Promise<{ companies: Company[]; total: number }> {
  const { page: safePage, limit: safeLimit } = normalizePagination(page, limit)

  const filter: Record<string, unknown> = {}
  if (status) {
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

  return {
    companies: docs as Company[],
    total,
  }
}
