import { validateOptionalString } from "./shared.validation"
import { validateUrl } from "./shared.validation"
import { validateStringArray } from "./shared.validation"

export interface ValidateUpdateRecruiterProfileInputResult {
  success: true
  name: string | null
  headline: string | null
  bio: string | null
  profileImage: string | null
  skills: string[] | undefined
}

export function validateUpdateRecruiterProfileInput(
  input: unknown
): ValidateUpdateRecruiterProfileInputResult | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    errors.push("Profile data must be an object")
    return { success: false, errors }
  }

  const data = input as Record<string, unknown>

  const keys = Object.keys(data)
  if (keys.length === 0) {
    errors.push("At least one field must be provided for update")
    return { success: false, errors }
  }

  const protectedFields = ["_id", "userId", "email", "createdAt", "updatedAt"]
  for (const field of protectedFields) {
    if (field in data) {
      errors.push(`${field} cannot be updated`)
    }
  }

  const result: ValidateUpdateRecruiterProfileInputResult = {
    success: true,
    name: null,
    headline: null,
    bio: null,
    profileImage: null,
    skills: undefined,
  }

  if (data.name !== undefined) {
    const nameResult = validateOptionalString(data.name, "name", 100)
    if (!nameResult.success) {
      errors.push(...nameResult.errors)
    } else {
      result.name = nameResult.value
    }
  }

  if (data.headline !== undefined) {
    const headlineResult = validateOptionalString(data.headline, "headline", 200)
    if (!headlineResult.success) {
      errors.push(...headlineResult.errors)
    } else {
      result.headline = headlineResult.value
    }
  }

  if (data.bio !== undefined) {
    const bioResult = validateOptionalString(data.bio, "bio", 2000)
    if (!bioResult.success) {
      errors.push(...bioResult.errors)
    } else {
      result.bio = bioResult.value
    }
  }

  if (data.profileImage !== undefined) {
    const imageResult = validateUrl(data.profileImage, "profileImage")
    if (!imageResult.success) {
      errors.push(...imageResult.errors)
    } else {
      result.profileImage = imageResult.value
    }
  }

  if (data.skills !== undefined) {
    const skillsResult = validateStringArray(data.skills, "skills", 50, 100)
    if (!skillsResult.success) {
      errors.push(...skillsResult.errors)
    } else {
      result.skills = skillsResult.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return result
}
