import { db } from "../db"
import { ObjectId } from "mongodb"
import type { SavedJob, CreateSavedJobInput } from "../models/saved-job.model"

const SAVED_JOBS_COLLECTION = "saved_jobs"
const JOBS_COLLECTION = "jobs"
const COMPANIES_COLLECTION = "companies"

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export async function saveJob(
  userId: string,
  jobId: string
): Promise<{ success: true; savedJob: SavedJob } | { success: false; error: string }> {
  if (!isValidObjectId(userId) || !isValidObjectId(jobId)) {
    return { success: false, error: "Invalid user ID or job ID" }
  }

  const now = new Date()
  const nowStr = now.toISOString()
  const doc: Omit<SavedJob, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    userId,
    jobId: new ObjectId(jobId),
    createdAt: nowStr,
  }

  try {
    await db.collection(SAVED_JOBS_COLLECTION).insertOne(doc)
    return { success: true, savedJob: doc as SavedJob }
  } catch (err: unknown) {
    const mongoErr = err as { code?: number } | undefined
    if (mongoErr?.code === 11000) {
      return { success: false, error: "Job already saved" }
    }
    throw err
  }
}

export async function getSavedJobs(userId: string): Promise<
  Array<{
    _id: string
    userId: string
    jobId: string
    createdAt: string
    isAvailable: boolean
    job: {
      _id: string
      title: string
      slug: string
      description: string
      requirements: string | null
      responsibilities: string | null
      benefits: string | null
      employmentType: string
      workplaceType: string
      location: string | null
      salary: string | null
      experienceLevel: string | null
      skills: string[]
      category: string | null
      applicationDeadline: string | null
      createdAt: string
    } | null
    company: {
      _id: string
      name: string
      slug: string
      description: string | null
      logo: string | null
      website: string | null
      industry: string | null
      companySize: string | null
      location: string | null
      foundedYear: number | null
    } | null
  }>
> {
  if (!isValidObjectId(userId)) {
    return []
  }

  const docs = await db.collection(SAVED_JOBS_COLLECTION)
    .aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: JOBS_COLLECTION,
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: COMPANIES_COLLECTION,
          localField: "job.companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: { $toString: "$_id" },
          userId: 1,
          jobId: { $toString: "$jobId" },
          createdAt: { $toString: "$createdAt" },
          isAvailable: {
            $and: [
              { $eq: ["$job.status", "published"] },
              { $eq: ["$company.status", "approved"] },
            ],
          },
          job: {
            _id: { $toString: "$job._id" },
            title: "$job.title",
            slug: "$job.slug",
            description: "$job.description",
            requirements: "$job.requirements",
            responsibilities: "$job.responsibilities",
            benefits: "$job.benefits",
            employmentType: "$job.employmentType",
            workplaceType: "$job.workplaceType",
            location: "$job.location",
            salary: "$job.salary",
            experienceLevel: "$job.experienceLevel",
            skills: "$job.skills",
            category: "$job.category",
            applicationDeadline: "$job.applicationDeadline",
            createdAt: { $toString: "$job.createdAt" },
          },
          company: {
            _id: { $toString: "$company._id" },
            name: "$company.name",
            slug: "$company.slug",
            description: "$company.description",
            logo: "$company.logo",
            website: "$company.website",
            industry: "$company.industry",
            companySize: "$company.companySize",
            location: "$company.location",
            foundedYear: "$company.foundedYear",
          },
        },
      },
    ])
    .toArray()

  return docs as Array<{
    _id: string
    userId: string
    jobId: string
    createdAt: string
    isAvailable: boolean
    job: {
      _id: string
      title: string
      slug: string
      description: string
      requirements: string | null
      responsibilities: string | null
      benefits: string | null
      employmentType: string
      workplaceType: string
      location: string | null
      salary: string | null
      experienceLevel: string | null
      skills: string[]
      category: string | null
      applicationDeadline: string | null
      createdAt: string
    } | null
    company: {
      _id: string
      name: string
      slug: string
      description: string | null
      logo: string | null
      website: string | null
      industry: string | null
      companySize: string | null
      location: string | null
      foundedYear: number | null
    } | null
  }>
}

export async function removeSavedJob(
  userId: string,
  jobId: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isValidObjectId(userId) || !isValidObjectId(jobId)) {
    return { success: false, error: "Invalid user ID or job ID" }
  }

  const result = await db.collection(SAVED_JOBS_COLLECTION).deleteOne({
    userId,
    jobId: new ObjectId(jobId),
  })

  if (result.deletedCount === 0) {
    return { success: false, error: "Saved job not found" }
  }

  return { success: true }
}
