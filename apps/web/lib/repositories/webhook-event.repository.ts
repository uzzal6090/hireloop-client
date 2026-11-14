import { db } from "../db"
import { ObjectId, type ClientSession } from "mongodb"
import type { WebhookEvent, CreateWebhookEventInput } from "../models/webhook-event.model"

const WEBHOOK_EVENTS_COLLECTION = "webhookEvents"

let webhookEventIndexInitialized = false

async function ensureWebhookEventIndexes(): Promise<void> {
  if (webhookEventIndexInitialized) return
  await db.collection(WEBHOOK_EVENTS_COLLECTION).createIndex({ eventId: 1 }, { unique: true })
  webhookEventIndexInitialized = true
}

export async function recordWebhookEvent(
  input: CreateWebhookEventInput
): Promise<{ created: boolean; event: WebhookEvent | null }> {
  await ensureWebhookEventIndexes()
  const now = new Date()
  const doc: Omit<WebhookEvent, "_id"> & { _id: ObjectId } = {
    _id: new ObjectId(),
    eventId: input.eventId,
    type: input.type,
    status: "pending",
    createdAt: now,
  }

  try {
    await db.collection(WEBHOOK_EVENTS_COLLECTION).insertOne(doc)
    return { created: true, event: doc as WebhookEvent }
  } catch (err: unknown) {
    const mongoErr = err as { code?: number } | undefined
    if (mongoErr?.code === 11000) {
      const existing = await db
        .collection(WEBHOOK_EVENTS_COLLECTION)
        .findOne({ eventId: input.eventId })
      return {
        created: false,
        event: existing ? (existing as WebhookEvent) : null,
      }
    }
    throw err
  }
}

export interface ClaimWebhookEventResult {
  claimed: boolean
  event: WebhookEvent | null
  claimToken?: string
}

/**
 * Atomically claim a webhook event for processing with a unique claim token.
 *
 * The claim token is a cryptographically secure UUID that serves as a fencing
 * identifier. Only the worker holding the current valid token can mark the
 * event processed or apply subscription changes within a fenced transaction.
 *
 * Uses MongoDB findOneAndUpdate with upsert to ensure only one worker can
 * claim a given event ID at a time. The claim is a lease: if the worker
 * crashes before marking the event processed, the claimedAt timestamp ages
 * and a subsequent retry can reclaim it after the lease duration expires.
 *
 * Duplicate-key errors (11000) from concurrent first-time deliveries are
 * handled by re-reading the existing event and evaluating its state.
 *
 * @param eventId - Stripe event ID
 * @param eventType - Stripe event type (used only on insert)
 * @param leaseDurationMs - How long the claim is held before expiry
 */
export async function claimWebhookEvent(
  eventId: string,
  eventType: string,
  leaseDurationMs: number
): Promise<ClaimWebhookEventResult> {
  await ensureWebhookEventIndexes()
  const now = new Date()
  const leaseExpiry = new Date(now.getTime() - leaseDurationMs)
  const claimToken = crypto.randomUUID()

  const attemptClaim = async (): Promise<ClaimWebhookEventResult> => {
    const result = await db
      .collection(WEBHOOK_EVENTS_COLLECTION)
      .findOneAndUpdate(
        {
          eventId,
          $or: [
            { status: "pending" },
            { status: "claimed", claimedAt: { $lt: leaseExpiry } },
          ],
        },
        {
          $set: { status: "claimed", claimedAt: now, claimToken },
          $setOnInsert: {
            _id: new ObjectId(),
            eventId,
            type: eventType,
            status: "pending",
            createdAt: now,
          },
        },
        { upsert: true, returnDocument: "after" }
      )

    if (!result) {
      return { claimed: false, event: null }
    }

    return { claimed: true, event: result as WebhookEvent, claimToken }
  }

  try {
    return await attemptClaim()
  } catch (err: unknown) {
    const mongoErr = err as { code?: number } | undefined
    if (mongoErr?.code !== 11000) {
      throw err
    }

    // Duplicate key: another request inserted this eventId concurrently.
    // Re-read the existing event and determine its state.
    const existing = await db
      .collection(WEBHOOK_EVENTS_COLLECTION)
      .findOne({ eventId })
    if (!existing) {
      return { claimed: false, event: null }
    }

    const event = existing as WebhookEvent

    if (event.status === "processed") {
      return { claimed: false, event }
    }

    if (event.status === "claimed") {
      const claimedAt = event.claimedAt
        ? new Date(event.claimedAt).getTime()
        : 0
      if (claimedAt < leaseExpiry.getTime()) {
        // Another worker holds an active lease
        return { claimed: false, event }
      }
      // Lease expired — retry the claim
      return attemptClaim()
    }

    // status is "pending" but insert failed with duplicate key — retry
    return attemptClaim()
  }
}

export async function getWebhookEvent(eventId: string): Promise<WebhookEvent | null> {
  await ensureWebhookEventIndexes()
  const doc = await db.collection(WEBHOOK_EVENTS_COLLECTION).findOne({ eventId })
  return doc ? (doc as WebhookEvent) : null
}

/**
 * Mark an event as processed. Only transitions from "claimed" to "processed"
 * when the claimToken matches the current holder. Returns true if the update
 * matched and modified the document; false if the token does not match
 * (another worker reclaimed) or the event is not in "claimed" state.
 */
export async function markWebhookEventProcessed(
  eventId: string,
  claimToken: string,
  session?: ClientSession
): Promise<boolean> {
  await ensureWebhookEventIndexes()
  const opts: { session?: ClientSession } = {}
  if (session) {
    opts.session = session
  }
  const result = await db.collection(WEBHOOK_EVENTS_COLLECTION).updateOne(
    { eventId, status: "claimed", claimToken },
    { $set: { status: "processed", processedAt: new Date() } },
    opts
  )
  return result.modifiedCount > 0
}
