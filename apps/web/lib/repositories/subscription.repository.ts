import { db } from "../db"
import { ObjectId, type ClientSession } from "mongodb"
import type { Subscription, CreateSubscriptionInput, UpdateSubscriptionInput } from "../models/subscription.model"

const SUBSCRIPTIONS_COLLECTION = "subscriptions"

let subscriptionIndexInitialized = false

async function ensureSubscriptionIndexes(): Promise<void> {
  if (subscriptionIndexInitialized) return
  await db.collection(SUBSCRIPTIONS_COLLECTION).createIndex({ userId: 1 }, { unique: true })
  await db.collection(SUBSCRIPTIONS_COLLECTION).createIndex({ stripeCustomerId: 1 }, { sparse: true })
  await db.collection(SUBSCRIPTIONS_COLLECTION).createIndex({ stripeSubscriptionId: 1 }, { sparse: true })
  subscriptionIndexInitialized = true
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
  await ensureSubscriptionIndexes()
  const doc = await db.collection(SUBSCRIPTIONS_COLLECTION).findOne({ userId })
  return doc ? (doc as Subscription) : null
}

export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  await ensureSubscriptionIndexes()
  const now = new Date()
  const doc: Omit<Subscription, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    userId: input.userId,
    planId: input.planId,
    planName: input.planName,
    jobLimit: input.jobLimit,
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  }

  await db.collection(SUBSCRIPTIONS_COLLECTION).insertOne(doc)

  return doc as Subscription
}

export async function ensureDefaultSubscription(userId: string): Promise<Subscription> {
  const existing = await getSubscriptionByUserId(userId)
  if (existing) {
    return existing
  }

  return createSubscription({
    userId,
    planId: "free",
    planName: "Free",
    jobLimit: 3,
    status: "active",
  })
}

export async function updateSubscription(
  userId: string,
  input: UpdateSubscriptionInput,
  session?: ClientSession
): Promise<Subscription | null> {
  await ensureSubscriptionIndexes()

  const protectedFields = ["_id", "userId", "createdAt"]
  const updateDoc: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (protectedFields.includes(key)) {
      continue
    }
    if (value === undefined) {
      continue
    }
    updateDoc[key] = value
  }

  if (Object.keys(updateDoc).length === 0) {
    return getSubscriptionByUserId(userId)
  }

  updateDoc.updatedAt = new Date()

  const result = await db.collection(SUBSCRIPTIONS_COLLECTION).findOneAndUpdate(
    { userId },
    { $set: updateDoc },
    { returnDocument: "after", session }
  )

  return result ? (result as Subscription) : null
}

export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  await ensureSubscriptionIndexes()
  const doc = await db.collection(SUBSCRIPTIONS_COLLECTION).findOne({ stripeCustomerId })
  return doc ? (doc as Subscription) : null
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  await ensureSubscriptionIndexes()
  const doc = await db.collection(SUBSCRIPTIONS_COLLECTION).findOne({ stripeSubscriptionId })
  return doc ? (doc as Subscription) : null
}

export async function updateStripeFields(
  userId: string,
  fields: {
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    paymentStatus?: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
  }
): Promise<Subscription | null> {
  await ensureSubscriptionIndexes()

  const updateDoc: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue
    updateDoc[key] = value
  }

  if (Object.keys(updateDoc).length === 0) {
    return getSubscriptionByUserId(userId)
  }

  updateDoc.updatedAt = new Date()

  const result = await db.collection(SUBSCRIPTIONS_COLLECTION).findOneAndUpdate(
    { userId },
    { $set: updateDoc },
    { returnDocument: "after" }
  )

  return result ? (result as Subscription) : null
}
