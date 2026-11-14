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
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  paymentStatus?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
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
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  paymentStatus?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

export type SubscriptionDocument = Subscription & Record<string, unknown>
