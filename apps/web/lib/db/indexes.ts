import { db } from "../db"
import type { Collection } from "mongodb"

export const COMPANIES_COLLECTION = "companies"
export const JOBS_COLLECTION = "jobs"
export const SAVED_JOBS_COLLECTION = "saved_jobs"
export const APPLICATIONS_COLLECTION = "applications"
export const RECRUITER_PROFILES_COLLECTION = "recruiter_profiles"
export const SUBSCRIPTIONS_COLLECTION = "subscriptions"

let indexInitPromise: Promise<void> | null = null
let indexInitialized = false

async function runIndexInitialization(): Promise<void> {
  await ensureCompanyIndexes()
  await ensureJobIndexes()
  await ensureSavedJobIndexes()
  await ensureApplicationIndexes()
  await ensureRecruiterProfileIndexes()
  await ensureSubscriptionIndexes()
}

export async function ensureIndexesInitialized(): Promise<void> {
  if (indexInitialized) {
    return
  }

  if (!indexInitPromise) {
    indexInitPromise = runIndexInitialization()
      .then(() => {
        indexInitialized = true
      })
      .catch((err) => {
        indexInitialized = false
        indexInitPromise = null
        throw err
      })
  }

  return indexInitPromise
}

export async function ensureCompanyIndexes(): Promise<void> {
  const collection: Collection = db.collection(COMPANIES_COLLECTION)

  await collection.createIndex({ slug: 1 }, { unique: true })
  await collection.createIndex({ ownerId: 1 })
  await collection.createIndex({ status: 1 })
  await collection.createIndex({ createdAt: -1 })
}

export async function ensureJobIndexes(): Promise<void> {
  const collection: Collection = db.collection(JOBS_COLLECTION)

  await collection.createIndex({ companyId: 1 })
  await collection.createIndex({ recruiterId: 1 })
  await collection.createIndex({ status: 1 })
  await collection.createIndex({ category: 1 })
  await collection.createIndex({ location: 1 })
  await collection.createIndex({ applicationDeadline: 1 })
  await collection.createIndex({ createdAt: -1 })
  await collection.createIndex(
    { title: "text", description: "text", skills: "text" },
    { name: "jobs_text_search" }
  )
}

export async function ensureAllIndexes(): Promise<void> {
  await ensureCompanyIndexes()
  await ensureJobIndexes()
  await ensureSavedJobIndexes()
  await ensureApplicationIndexes()
  await ensureRecruiterProfileIndexes()
}

export async function ensureSavedJobIndexes(): Promise<void> {
  const collection: Collection = db.collection(SAVED_JOBS_COLLECTION)

  await collection.createIndex({ userId: 1, jobId: 1 }, { unique: true })
  await collection.createIndex({ userId: 1, createdAt: -1 })
}

export async function ensureApplicationIndexes(): Promise<void> {
  const collection: Collection = db.collection(APPLICATIONS_COLLECTION)

  await collection.createIndex({ seekerId: 1, jobId: 1 }, { unique: true })
  await collection.createIndex({ seekerId: 1, createdAt: -1 })
  await collection.createIndex({ jobId: 1, createdAt: -1 })
}

export async function ensureRecruiterProfileIndexes(): Promise<void> {
  const collection: Collection = db.collection(RECRUITER_PROFILES_COLLECTION)

  await collection.createIndex({ userId: 1 }, { unique: true })
}

export async function ensureSubscriptionIndexes(): Promise<void> {
  const collection: Collection = db.collection(SUBSCRIPTIONS_COLLECTION)

  await collection.createIndex({ userId: 1 }, { unique: true })
}
