import { db } from "../db"
import type { Collection } from "mongodb"

export const COMPANIES_COLLECTION = "companies"
export const JOBS_COLLECTION = "jobs"
export const SAVED_JOBS_COLLECTION = "saved_jobs"

let indexInitPromise: Promise<void> | null = null
let indexInitialized = false

async function runIndexInitialization(): Promise<void> {
  await ensureCompanyIndexes()
  await ensureJobIndexes()
  await ensureSavedJobIndexes()
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
}

export async function ensureSavedJobIndexes(): Promise<void> {
  const collection: Collection = db.collection(SAVED_JOBS_COLLECTION)

  await collection.createIndex({ userId: 1, jobId: 1 }, { unique: true })
  await collection.createIndex({ userId: 1, createdAt: -1 })
}
