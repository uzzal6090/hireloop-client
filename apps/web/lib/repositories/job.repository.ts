import { db } from "../db"
import { ObjectId } from "mongodb"
import type { Job, CreateJobInput, UpdateJobInput } from "../models/job.model"
import { normalizePagination } from "../validations/shared.validation"

const JOBS_COLLECTION = "jobs"

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const now = new Date()
  const doc: Omit<Job, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    title: input.title,
    slug: input.slug,
    description: input.description,
    requirements: input.requirements ?? null,
    responsibilities: input.responsibilities ?? null,
    benefits: input.benefits ?? null,
    companyId: input.companyId,
    recruiterId: input.recruiterId,
    employmentType: input.employmentType,
    workplaceType: input.workplaceType,
    location: input.location ?? null,
    salary: input.salary ?? null,
    experienceLevel: input.experienceLevel ?? null,
    skills: input.skills ?? [],
    category: input.category ?? null,
    status: input.status ?? "draft",
    applicationDeadline: input.applicationDeadline ?? null,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(JOBS_COLLECTION).insertOne(doc)

  return doc as Job
}

export async function getJobById(id: string): Promise<Job | null> {
  if (!isValidObjectId(id)) {
    return null
  }

  const doc = await db.collection(JOBS_COLLECTION).findOne({ _id: new ObjectId(id) })
  return doc ? (doc as Job) : null
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const doc = await db.collection(JOBS_COLLECTION).findOne({ slug })
  return doc ? (doc as Job) : null
}

export async function getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
  if (typeof recruiterId !== "string" || recruiterId.trim() === "") {
    return []
  }

  const docs = await db.collection(JOBS_COLLECTION)
    .find({ recruiterId })
    .sort({ createdAt: -1 })
    .toArray()
  return docs as Job[]
}

export async function getJobsByCompany(companyId: string): Promise<Job[]> {
  if (!isValidObjectId(companyId)) {
    return []
  }

  const docs = await db.collection(JOBS_COLLECTION)
    .find({ companyId: new ObjectId(companyId) })
    .sort({ createdAt: -1 })
    .toArray()
  return docs as Job[]
}

export async function getJobs({
  page = 1,
  limit = 20,
  status,
  category,
  location,
}: { page?: number; limit?: number; status?: string; category?: string; location?: string } = {}): Promise<{ jobs: Job[]; total: number }> {
  const { page: safePage, limit: safeLimit } = normalizePagination(page, limit)

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (category) filter.category = category
  if (location) filter.location = location

  const skip = (safePage - 1) * safeLimit

  const [docs, total] = await Promise.all([
    db.collection(JOBS_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray(),
    db.collection(JOBS_COLLECTION).countDocuments(filter),
  ])

  return {
    jobs: docs as Job[],
    total,
  }
}

export async function updateJob(id: string, input: UpdateJobInput): Promise<Job | null> {
  if (!isValidObjectId(id)) {
    return null
  }

  const protectedFields = ["_id", "companyId", "recruiterId", "createdAt", "updatedAt"]
  const updateDoc: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (protectedFields.includes(key)) {
      continue
    }
    updateDoc[key] = value
  }

  updateDoc.updatedAt = new Date()

  const result = await db.collection(JOBS_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: "after" }
  )

  return result ? (result as Job) : null
}

export async function deleteJob(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false
  }

  const result = await db.collection(JOBS_COLLECTION).deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}
