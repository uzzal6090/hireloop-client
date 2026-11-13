import { db } from "../db"
import { ObjectId } from "mongodb"
import type { Application, CreateApplicationInput, UpdateApplicationInput } from "../models/application.model"

const APPLICATIONS_COLLECTION = "applications"

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export async function createApplication(
  input: CreateApplicationInput
): Promise<{ success: true; application: Application } | { success: false; error: string }> {
  if (!isValidObjectId(input.seekerId)) {
    return { success: false, error: "Invalid seeker ID" }
  }
  if (!isValidObjectId(input.jobId.toString())) {
    return { success: false, error: "Invalid job ID" }
  }
  if (!isValidObjectId(input.companyId.toString())) {
    return { success: false, error: "Invalid company ID" }
  }

  const now = new Date()
  const doc: Omit<Application, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    seekerId: input.seekerId,
    jobId: input.jobId,
    companyId: input.companyId,
    status: input.status ?? "applied",
    createdAt: now,
    updatedAt: now,
  }

  try {
    await db.collection(APPLICATIONS_COLLECTION).insertOne(doc)
    return { success: true, application: doc as Application }
  } catch (err: unknown) {
    const mongoErr = err as { code?: number } | undefined
    if (mongoErr?.code === 11000) {
      return { success: false, error: "Application already exists for this job" }
    }
    throw err
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  if (!isValidObjectId(id)) {
    return null
  }

  const doc = await db.collection(APPLICATIONS_COLLECTION).findOne({ _id: new ObjectId(id) })
  return doc ? (doc as Application) : null
}

export async function getApplicationBySeekerAndJob(
  seekerId: string,
  jobId: string
): Promise<Application | null> {
  if (!isValidObjectId(seekerId) || !isValidObjectId(jobId)) {
    return null
  }

  const doc = await db.collection(APPLICATIONS_COLLECTION).findOne({
    seekerId,
    jobId: new ObjectId(jobId),
  })
  return doc ? (doc as Application) : null
}

export async function getApplicationsBySeeker(seekerId: string): Promise<Application[]> {
  if (!isValidObjectId(seekerId)) {
    return []
  }

  const docs = await db.collection(APPLICATIONS_COLLECTION)
    .find({ seekerId })
    .sort({ createdAt: -1 })
    .toArray()
  return docs as Application[]
}

export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  if (!isValidObjectId(jobId)) {
    return []
  }

  const docs = await db.collection(APPLICATIONS_COLLECTION)
    .find({ jobId: new ObjectId(jobId) })
    .sort({ createdAt: -1 })
    .toArray()
  return docs as Application[]
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<Application | null> {
  if (!isValidObjectId(id)) {
    return null
  }

  const protectedFields = ["_id", "seekerId", "jobId", "companyId", "createdAt", "updatedAt"]
  const updateDoc: Record<string, unknown> = {}

  for (const [key, value] of Object.entries({ status })) {
    if (protectedFields.includes(key)) {
      continue
    }
    updateDoc[key] = value
  }

  updateDoc.updatedAt = new Date()

  const result = await db.collection(APPLICATIONS_COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: "after" }
  )

  return result ? (result as Application) : null
}
