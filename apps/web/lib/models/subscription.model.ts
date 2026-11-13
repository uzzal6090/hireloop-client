import { ObjectId } from "mongodb"

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "expired"

export interface Subscription {
  _id: ObjectId
  userId: string
  planId: string
  planName: string
  jobLimit: number
  status: SubscriptionStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateSubscriptionInput {
  userId: string
  planId: string
  planName: string
  jobLimit: number
  status?: SubscriptionStatus
}

export interface UpdateSubscriptionInput {
  planId?: string
  planName?: string
  jobLimit?: number
  status?: SubscriptionStatus
}

export type SubscriptionDocument = Subscription & Record<string, unknown>
