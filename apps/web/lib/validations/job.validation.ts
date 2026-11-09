import { validateRequiredString } from "./shared.validation"
import { validateOptionalString } from "./shared.validation"
import { validateUrl } from "./shared.validation"
import { validateEnum } from "./shared.validation"
import { validatePositiveNumber } from "./shared.validation"
import { validateDate } from "./shared.validation"
import { validateObjectId } from "./shared.validation"
import { validateNonEmptyString } from "./shared.validation"
import { validateStringArray } from "./shared.validation"
import type { JobStatus, EmploymentType, WorkplaceType, ExperienceLevel } from "../models/job.model"

const JOB_STATUSES: JobStatus[] = [
  "draft",
  "pending",
  "published",
  "closed",
  "rejected",
]

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full-time",
  "part-time",
  "contract",
  "internship",
]

const WORKPLACE_TYPES: WorkplaceType[] = [
  "on-site",
  "remote",
  "hybrid",
]

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
]

export interface ValidateJobInputResult {
  success: true
  title: string
  slug: string
  description: string
  requirements: string | null
  responsibilities: string | null
  benefits: string | null
  companyId: ObjectId
  recruiterId: string
  employmentType: EmploymentType
  workplaceType: WorkplaceType
  location: string | null
  salary: string | null
  experienceLevel: ExperienceLevel | null
  skills: string[]
  category: string | null
  status: JobStatus
  applicationDeadline: Date | null
}

import { ObjectId } from "mongodb"

export function validateJobInput(
  input: unknown
): ValidateJobInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Job data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const titleResult = validateRequiredString(data.title, "title", 2, 200)
  const slugResult = validateRequiredString(data.slug, "slug", 2, 200)
  const descriptionResult = validateRequiredString(data.description, "description", 10, 5000)
  const requirementsResult = validateOptionalString(data.requirements, "requirements", 5000)
  const responsibilitiesResult = validateOptionalString(data.responsibilities, "responsibilities", 5000)
  const benefitsResult = validateOptionalString(data.benefits, "benefits", 5000)
  const companyIdResult = validateObjectId(data.companyId, "companyId")
  const recruiterIdResult = validateNonEmptyString(data.recruiterId, "recruiterId")
  const employmentTypeResult = validateEnum(data.employmentType, "employmentType", EMPLOYMENT_TYPES)
  const workplaceTypeResult = validateEnum(data.workplaceType, "workplaceType", WORKPLACE_TYPES)
  const locationResult = validateOptionalString(data.location, "location", 200)
  const salaryResult = validateOptionalString(data.salary, "salary", 100)
  const experienceLevelResult = validateEnum(data.experienceLevel, "experienceLevel", EXPERIENCE_LEVELS)
  const skillsResult = validateStringArray(data.skills, "skills")
  const categoryResult = validateOptionalString(data.category, "category", 100)
  const statusResult: { success: true; value: JobStatus } | { success: false; errors: string[] } = data.status === undefined || data.status === null
    ? { success: true, value: "draft" as JobStatus }
    : (validateEnum(data.status, "status", JOB_STATUSES) as { success: true; value: JobStatus } | { success: false; errors: string[] })
  const applicationDeadlineResult = validateDate(data.applicationDeadline, "applicationDeadline")

  for (const result of [titleResult, slugResult, descriptionResult, requirementsResult, responsibilitiesResult, benefitsResult, companyIdResult, recruiterIdResult, employmentTypeResult, workplaceTypeResult, locationResult, salaryResult, experienceLevelResult, skillsResult, categoryResult, statusResult, applicationDeadlineResult]) {
    if (!result.success) {
      errors.push(...result.errors)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const result: ValidateJobInputResult | { success: false; errors: string[] } = {
    success: true,
    title: (titleResult as { success: true; value: string }).value,
    slug: (slugResult as { success: true; value: string }).value,
    description: (descriptionResult as { success: true; value: string }).value,
    requirements: (requirementsResult as { success: true; value: string | null }).value,
    responsibilities: (responsibilitiesResult as { success: true; value: string | null }).value,
    benefits: (benefitsResult as { success: true; value: string | null }).value,
    companyId: new ObjectId((companyIdResult as { success: true; value: string }).value),
    recruiterId: (recruiterIdResult as { success: true; value: string }).value,
    employmentType: (employmentTypeResult as { success: true; value: string }).value as EmploymentType,
    workplaceType: (workplaceTypeResult as { success: true; value: string }).value as WorkplaceType,
    location: (locationResult as { success: true; value: string | null }).value,
    salary: (salaryResult as { success: true; value: string | null }).value,
    experienceLevel: (experienceLevelResult as { success: true; value: string }).value as ExperienceLevel | null,
    skills: (skillsResult as { success: true; value: string[] }).value,
    category: (categoryResult as { success: true; value: string | null }).value,
    status: (statusResult as { success: true; value: string }).value as JobStatus,
    applicationDeadline: (applicationDeadlineResult as { success: true; value: Date | null }).value,
  }
  return result as ValidateJobInputResult | { success: false; errors: string[] }
}

export interface ValidateUpdateJobInputResult {
  success: true
  title?: string | null
  slug?: string | null
  description?: string | null
  requirements?: string | null
  responsibilities?: string | null
  benefits?: string | null
  employmentType?: EmploymentType
  workplaceType?: WorkplaceType
  location?: string | null
  salary?: string | null
  experienceLevel?: ExperienceLevel | null
  skills?: string[]
  category?: string | null
  status?: JobStatus
  applicationDeadline?: Date | null
}

export function validateUpdateJobInput(
  input: unknown
): ValidateUpdateJobInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Job update data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const keys = Object.keys(data)
  if (keys.length === 0) {
    errors.push("At least one field must be provided for update")
    return { success: false, errors }
  }

  const protectedFields = ["_id", "companyId", "recruiterId", "createdAt"]
  for (const field of protectedFields) {
    if (field in data) {
      errors.push(`${field} cannot be updated`)
    }
  }

  const result: ValidateUpdateJobInputResult = { success: true }

  if (data.title !== undefined) {
    const titleResult = validateOptionalString(data.title, "title", 200)
    if (!titleResult.success) {
      errors.push(...titleResult.errors)
    } else {
      result.title = titleResult.value
    }
  }

  if (data.slug !== undefined) {
    const slugResult = validateOptionalString(data.slug, "slug", 200)
    if (!slugResult.success) {
      errors.push(...slugResult.errors)
    } else {
      result.slug = slugResult.value
    }
  }

  if (data.description !== undefined) {
    const descResult = validateOptionalString(data.description, "description", 5000)
    if (!descResult.success) {
      errors.push(...descResult.errors)
    } else {
      result.description = descResult.value
    }
  }

  if (data.requirements !== undefined) {
    const reqResult = validateOptionalString(data.requirements, "requirements", 5000)
    if (!reqResult.success) {
      errors.push(...reqResult.errors)
    } else {
      result.requirements = reqResult.value
    }
  }

  if (data.responsibilities !== undefined) {
    const respResult = validateOptionalString(data.responsibilities, "responsibilities", 5000)
    if (!respResult.success) {
      errors.push(...respResult.errors)
    } else {
      result.responsibilities = respResult.value
    }
  }

  if (data.benefits !== undefined) {
    const benefitsResult = validateOptionalString(data.benefits, "benefits", 5000)
    if (!benefitsResult.success) {
      errors.push(...benefitsResult.errors)
    } else {
      result.benefits = benefitsResult.value
    }
  }

  if (data.employmentType !== undefined) {
    const empResult = validateEnum(data.employmentType, "employmentType", EMPLOYMENT_TYPES)
    if (!empResult.success) {
      errors.push(...empResult.errors)
    } else {
      result.employmentType = empResult.value as EmploymentType
    }
  }

  if (data.workplaceType !== undefined) {
    const wpResult = validateEnum(data.workplaceType, "workplaceType", WORKPLACE_TYPES)
    if (!wpResult.success) {
      errors.push(...wpResult.errors)
    } else {
      result.workplaceType = wpResult.value as WorkplaceType
    }
  }

  if (data.location !== undefined) {
    const locResult = validateOptionalString(data.location, "location", 200)
    if (!locResult.success) {
      errors.push(...locResult.errors)
    } else {
      result.location = locResult.value
    }
  }

  if (data.salary !== undefined) {
    const salaryResult = validateOptionalString(data.salary, "salary", 100)
    if (!salaryResult.success) {
      errors.push(...salaryResult.errors)
    } else {
      result.salary = salaryResult.value
    }
  }

  if (data.experienceLevel !== undefined) {
    const expResult = validateEnum(data.experienceLevel, "experienceLevel", EXPERIENCE_LEVELS)
    if (!expResult.success) {
      errors.push(...expResult.errors)
    } else {
      result.experienceLevel = expResult.value as ExperienceLevel | null
    }
  }

  if (data.skills !== undefined) {
    const skillsResult = validateStringArray(data.skills, "skills")
    if (!skillsResult.success) {
      errors.push(...skillsResult.errors)
    } else {
      result.skills = skillsResult.value
    }
  }

  if (data.category !== undefined) {
    const catResult = validateOptionalString(data.category, "category", 100)
    if (!catResult.success) {
      errors.push(...catResult.errors)
    } else {
      result.category = catResult.value
    }
  }

  if (data.status !== undefined) {
    const statusResult: { success: true; value: JobStatus | undefined } | { success: false; errors: string[] } = data.status === null
      ? { success: true, value: undefined as JobStatus | undefined }
      : (validateEnum(data.status, "status", JOB_STATUSES) as { success: true; value: JobStatus | undefined } | { success: false; errors: string[] })
    if (!statusResult.success) {
      errors.push(...statusResult.errors)
    } else {
      result.status = statusResult.value as JobStatus | undefined
    }
  }

  if (data.applicationDeadline !== undefined) {
    const deadlineResult = validateDate(data.applicationDeadline, "applicationDeadline")
    if (!deadlineResult.success) {
      errors.push(...deadlineResult.errors)
    } else {
      result.applicationDeadline = deadlineResult.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return result
}
