import { validateOptionalString, validateEnum } from "./shared.validation"
import type { SubscriptionStatus } from "../models/subscription.model"

const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["active", "past_due", "canceled", "expired"]

// Protected fields that clients must never be allowed to change through
// public subscription update payloads.
const PROTECTED_FIELDS = ["userId", "planId", "jobLimit", "status"]

export interface ValidateSubscriptionUpdateInputResult {
  success: true
  planName?: string | null
  status?: SubscriptionStatus
}

export function validateSubscriptionUpdateInput(
  input: unknown
): ValidateSubscriptionUpdateInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Subscription update data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  for (const field of PROTECTED_FIELDS) {
    if (field in data) {
      errors.push(`${field} cannot be updated`)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const result: ValidateSubscriptionUpdateInputResult = { success: true }

  if (data.planName !== undefined) {
    const planNameResult = validateOptionalString(data.planName, "planName", 100)
    if (!planNameResult.success) {
      errors.push(...planNameResult.errors)
    } else {
      result.planName = planNameResult.value
    }
  }

  if (data.status !== undefined) {
    const statusResult = validateEnum(data.status, "status", SUBSCRIPTION_STATUSES)
    if (!statusResult.success) {
      errors.push(...statusResult.errors)
    } else {
      result.status = statusResult.value as SubscriptionStatus
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return result
}
