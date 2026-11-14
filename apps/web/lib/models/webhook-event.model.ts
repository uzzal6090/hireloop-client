import { ObjectId } from "mongodb"

export type WebhookEventStatus = "pending" | "claimed" | "processed" | "failed"

export interface WebhookEvent {
  _id: ObjectId
  eventId: string
  type: string
  status: WebhookEventStatus
  claimToken?: string
  claimedAt?: Date
  createdAt: Date
  processedAt?: Date
}

export interface CreateWebhookEventInput {
  eventId: string
  type: string
}

export type WebhookEventDocument = WebhookEvent & Record<string, unknown>
