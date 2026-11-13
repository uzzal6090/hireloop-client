import { db } from "../db"
import { ObjectId } from "mongodb"
import type { RecruiterProfile, RecruiterProfileDocument } from "../models/recruiterProfile.model"

const RECRUITER_PROFILES_COLLECTION = "recruiter_profiles"

let profileIndexInitialized = false

async function ensureRecruiterProfileIndexes(): Promise<void> {
  if (profileIndexInitialized) return
  await db.collection(RECRUITER_PROFILES_COLLECTION).createIndex({ userId: 1 }, { unique: true })
  profileIndexInitialized = true
}

function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export async function getRecruiterProfileByUserId(
  userId: string
): Promise<RecruiterProfile | null> {
  await ensureRecruiterProfileIndexes()
  const doc = await db
    .collection<RecruiterProfileDocument>(RECRUITER_PROFILES_COLLECTION)
    .findOne({ userId })
  return doc ? (doc as unknown as RecruiterProfile) : null
}

export async function upsertRecruiterProfile(
  userId: string,
  input: {
    headline?: string | null
    bio?: string | null
    skills?: string[]
  }
): Promise<RecruiterProfile> {
  await ensureRecruiterProfileIndexes()

  const update: Record<string, unknown> = {}
  if (input.headline !== undefined) update.headline = input.headline
  if (input.bio !== undefined) update.bio = input.bio
  if (input.skills !== undefined) update.skills = input.skills
  update.updatedAt = new Date()

  const existing = await getRecruiterProfileByUserId(userId)

  if (existing) {
    await db
      .collection<RecruiterProfileDocument>(RECRUITER_PROFILES_COLLECTION)
      .updateOne({ userId }, { $set: update })
    const updated = await getRecruiterProfileByUserId(userId)
    if (!updated) {
      throw new Error("Failed to persist recruiter profile")
    }
    return updated
  }

  const now = new Date()
  const doc: Omit<RecruiterProfileDocument, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    userId,
    headline: input.headline ?? null,
    bio: input.bio ?? null,
    skills: input.skills ?? [],
    updatedAt: now,
  }

  await db
    .collection<RecruiterProfileDocument>(RECRUITER_PROFILES_COLLECTION)
    .insertOne(doc as RecruiterProfileDocument)

  return {
    userId: doc.userId,
    headline: doc.headline,
    bio: doc.bio,
    skills: doc.skills,
    updatedAt: doc.updatedAt,
  }
}
