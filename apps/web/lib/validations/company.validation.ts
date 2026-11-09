import { validateRequiredString } from "./shared.validation"
import { validateOptionalString } from "./shared.validation"
import { validateUrl } from "./shared.validation"
import { validateEnum } from "./shared.validation"
import { validatePositiveNumber } from "./shared.validation"
import { validateObjectId } from "./shared.validation"
import type { CompanyStatus } from "../models/company.model"

const COMPANY_STATUSES: CompanyStatus[] = [
  "pending",
  "approved",
  "rejected",
  "suspended",
]

export interface ValidateCompanyInputResult {
  success: true
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
  industry: string | null
  companySize: string | null
  location: string | null
  foundedYear: number | null
  ownerId: string
  status: CompanyStatus
}

export function validateCompanyInput(
  input: unknown
): ValidateCompanyInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Company data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const nameResult = validateRequiredString(data.name, "name", 2, 100)
  const slugResult = validateRequiredString(data.slug, "slug", 2, 100)
  const descriptionResult = validateOptionalString(data.description, "description", 2000)
  const logoResult = validateOptionalString(data.logo, "logo", 500)
  const websiteResult = validateUrl(data.website, "website")
  const industryResult = validateOptionalString(data.industry, "industry", 100)
  const companySizeResult = validateOptionalString(data.companySize, "companySize", 50)
  const locationResult = validateOptionalString(data.location, "location", 100)
  const foundedYearResult = validatePositiveNumber(data.foundedYear, "foundedYear")
  const ownerIdResult = validateObjectId(data.ownerId, "ownerId")
  const statusResult: { success: true; value: CompanyStatus } | { success: false; errors: string[] } = data.status === undefined || data.status === null
    ? { success: true, value: "pending" as CompanyStatus }
    : (validateEnum(data.status, "status", COMPANY_STATUSES) as { success: true; value: CompanyStatus } | { success: false; errors: string[] })

  for (const result of [nameResult, slugResult, descriptionResult, logoResult, websiteResult, industryResult, companySizeResult, locationResult, foundedYearResult, ownerIdResult, statusResult]) {
    if (!result.success) {
      errors.push(...result.errors)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const result: ValidateCompanyInputResult | { success: false; errors: string[] } = {
    success: true,
    name: (nameResult as { success: true; value: string }).value,
    slug: (slugResult as { success: true; value: string }).value,
    description: (descriptionResult as { success: true; value: string | null }).value,
    logo: (logoResult as { success: true; value: string | null }).value,
    website: (websiteResult as { success: true; value: string | null }).value,
    industry: (industryResult as { success: true; value: string | null }).value,
    companySize: (companySizeResult as { success: true; value: string | null }).value,
    location: (locationResult as { success: true; value: string | null }).value,
    foundedYear: (foundedYearResult as { success: true; value: number }).value,
    ownerId: (ownerIdResult as { success: true; value: string }).value,
    status: (statusResult as { success: true; value: string }).value as CompanyStatus,
  }
  return result as ValidateCompanyInputResult | { success: false; errors: string[] }
}

export interface ValidateUpdateCompanyInputResult {
  success: true
  name?: string | null
  slug?: string | null
  description?: string | null
  logo?: string | null
  website?: string | null
  industry?: string | null
  companySize?: string | null
  location?: string | null
  foundedYear?: number | null
  status?: CompanyStatus
}

export function validateUpdateCompanyInput(
  input: unknown
): ValidateUpdateCompanyInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Company update data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const keys = Object.keys(data)
  if (keys.length === 0) {
    errors.push("At least one field must be provided for update")
    return { success: false, errors }
  }

  const protectedFields = ["_id", "ownerId", "createdAt"]
  for (const field of protectedFields) {
    if (field in data) {
      errors.push(`${field} cannot be updated`)
    }
  }

  const result: ValidateUpdateCompanyInputResult = { success: true }

  if (data.name !== undefined) {
    const nameResult = validateOptionalString(data.name, "name", 100)
    if (!nameResult.success) {
      errors.push(...nameResult.errors)
    } else {
      result.name = nameResult.value
    }
  }

  if (data.slug !== undefined) {
    const slugResult = validateOptionalString(data.slug, "slug", 100)
    if (!slugResult.success) {
      errors.push(...slugResult.errors)
    } else {
      result.slug = slugResult.value
    }
  }

  if (data.description !== undefined) {
    const descResult = validateOptionalString(data.description, "description", 2000)
    if (!descResult.success) {
      errors.push(...descResult.errors)
    } else {
      result.description = descResult.value
    }
  }

  if (data.logo !== undefined) {
    const logoResult = validateOptionalString(data.logo, "logo", 500)
    if (!logoResult.success) {
      errors.push(...logoResult.errors)
    } else {
      result.logo = logoResult.value
    }
  }

  if (data.website !== undefined) {
    const websiteResult = validateUrl(data.website, "website")
    if (!websiteResult.success) {
      errors.push(...websiteResult.errors)
    } else {
      result.website = websiteResult.value
    }
  }

  if (data.industry !== undefined) {
    const industryResult = validateOptionalString(data.industry, "industry", 100)
    if (!industryResult.success) {
      errors.push(...industryResult.errors)
    } else {
      result.industry = industryResult.value
    }
  }

  if (data.companySize !== undefined) {
    const companySizeResult = validateOptionalString(data.companySize, "companySize", 50)
    if (!companySizeResult.success) {
      errors.push(...companySizeResult.errors)
    } else {
      result.companySize = companySizeResult.value
    }
  }

  if (data.location !== undefined) {
    const locationResult = validateOptionalString(data.location, "location", 100)
    if (!locationResult.success) {
      errors.push(...locationResult.errors)
    } else {
      result.location = locationResult.value
    }
  }

  if (data.foundedYear !== undefined) {
    const foundedYearResult = validatePositiveNumber(data.foundedYear, "foundedYear")
    if (!foundedYearResult.success) {
      errors.push(...foundedYearResult.errors)
    } else {
      result.foundedYear = foundedYearResult.value
    }
  }

  if (data.status !== undefined) {
    const statusResult: { success: true; value: CompanyStatus | undefined } | { success: false; errors: string[] } = data.status === null
      ? { success: true, value: undefined as CompanyStatus | undefined }
      : (validateEnum(data.status, "status", COMPANY_STATUSES) as { success: true; value: CompanyStatus | undefined } | { success: false; errors: string[] })
    if (!statusResult.success) {
      errors.push(...statusResult.errors)
    } else {
      result.status = statusResult.value as CompanyStatus | undefined
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return result
}
