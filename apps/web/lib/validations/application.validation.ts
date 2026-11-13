import { validateObjectId } from "./shared.validation"
import { validateEnum } from "./shared.validation"
import type { ApplicationStatus } from "../models/application.model"

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "applied",
  "under_review",
  "shortlisted",
  "rejected",
  "offered",
  "accepted",
]

export interface ValidateApplicationInputResult {
  success: true
  seekerId: string
  jobId: string
  companyId: string
  status: ApplicationStatus
}

export function validateApplicationInput(
  input: unknown
): ValidateApplicationInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Application data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const seekerIdResult = validateObjectId(data.seekerId, "seekerId")
  const jobIdResult = validateObjectId(data.jobId, "jobId")
  const companyIdResult = validateObjectId(data.companyId, "companyId")
  const statusResult: { success: true; value: ApplicationStatus } | { success: false; errors: string[] } =
    data.status === undefined || data.status === null
      ? { success: true, value: "applied" as ApplicationStatus }
      : (validateEnum(data.status, "status", APPLICATION_STATUSES) as { success: true; value: ApplicationStatus } | { success: false; errors: string[] })

  for (const result of [seekerIdResult, jobIdResult, companyIdResult, statusResult]) {
    if (!result.success) {
      errors.push(...result.errors)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const result: ValidateApplicationInputResult | { success: false; errors: string[] } = {
    success: true,
    seekerId: (seekerIdResult as { success: true; value: string }).value,
    jobId: (jobIdResult as { success: true; value: string }).value,
    companyId: (companyIdResult as { success: true; value: string }).value,
    status: (statusResult as { success: true; value: string }).value as ApplicationStatus,
  }
  return result
}

export interface ValidateUpdateApplicationStatusResult {
  success: true
  status: ApplicationStatus
}

export function validateUpdateApplicationStatus(
  input: unknown
): ValidateUpdateApplicationStatusResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Application update data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const keys = Object.keys(data)
  if (keys.length === 0) {
    errors.push("At least one field must be provided for update")
    return { success: false, errors }
  }

  const protectedFields = ["_id", "seekerId", "jobId", "companyId", "createdAt", "updatedAt"]
  for (const field of protectedFields) {
    if (field in data) {
      errors.push(`${field} cannot be updated`)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const statusResult: { success: true; value: ApplicationStatus } | { success: false; errors: string[] } =
    data.status === undefined || data.status === null
      ? { success: false, errors: ["status is required"] }
      : (validateEnum(data.status, "status", APPLICATION_STATUSES) as { success: true; value: ApplicationStatus } | { success: false; errors: string[] })

  if (!statusResult.success) {
    errors.push(...statusResult.errors)
    return { success: false, errors }
  }

  return {
    success: true,
    status: (statusResult as { success: true; value: string }).value as ApplicationStatus,
  }
}
