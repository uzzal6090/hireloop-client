export type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] }

export function validateRequiredString(
  value: unknown,
  fieldName: string,
  minLength = 1,
  maxLength = 255
): { success: true; value: string } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${fieldName} is required`)
    return { success: false, errors }
  }

  const trimmed = value.trim()

  if (trimmed.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} character(s)`)
  }

  if (trimmed.length > maxLength) {
    errors.push(`${fieldName} must be at most ${maxLength} character(s)`)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, value: trimmed }
}

export function validateNonEmptyString(
  value: unknown,
  fieldName: string
): { success: true; value: string } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${fieldName} is required`)
    return { success: false, errors }
  }

  return { success: true, value: value.trim() }
}

export function validateOptionalString(
  value: unknown,
  fieldName: string,
  maxLength = 255
): { success: true; value: string | null } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (value === null || value === undefined || value === "") {
    return { success: true, value: null }
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`)
    return { success: false, errors }
  }

  const trimmed = value.trim()

  if (trimmed.length > maxLength) {
    errors.push(`${fieldName} must be at most ${maxLength} character(s)`)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, value: trimmed }
}

export function validateUrl(
  value: unknown,
  fieldName: string
): { success: true; value: string | null } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (value === null || value === undefined || value === "") {
    return { success: true, value: null }
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`)
    return { success: false, errors }
  }

  const trimmed = value.trim()

  if (trimmed === "") {
    return { success: true, value: null }
  }

  try {
    new URL(trimmed)
  } catch {
    errors.push(`${fieldName} must be a valid URL`)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, value: trimmed }
}

export function validateEnum(
  value: unknown,
  fieldName: string,
  allowedValues: string[]
): { success: true; value: string } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof value !== "string" || !allowedValues.includes(value)) {
    errors.push(`${fieldName} must be one of: ${allowedValues.join(", ")}`)
    return { success: false, errors }
  }

  return { success: true, value: value }
}

export function validatePositiveNumber(
  value: unknown,
  fieldName: string
): { success: true; value: number } | { success: false; errors: string[] } {
  const errors: string[] = []

  const num = typeof value === "string" ? parseFloat(value) : value

  if (typeof num !== "number" || isNaN(num) || num <= 0) {
    errors.push(`${fieldName} must be a positive number`)
    return { success: false, errors }
  }

  return { success: true, value: num }
}

export function validateDate(
  value: unknown,
  fieldName: string
): { success: true; value: Date | null } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (value === null || value === undefined || value === "") {
    return { success: true, value: null }
  }

  const date = typeof value === "string" ? new Date(value) : value

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    errors.push(`${fieldName} must be a valid date`)
    return { success: false, errors }
  }

  return { success: true, value: date }
}

export function validateObjectId(
  value: unknown,
  fieldName: string
): { success: true; value: string } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${fieldName} is required`)
    return { success: false, errors }
  }

  if (!/^[0-9a-fA-F]{24}$/.test(value.trim())) {
    errors.push(`${fieldName} must be a valid MongoDB ObjectId`)
    return { success: false, errors }
  }

  return { success: true, value: value.trim() }
}

export function validateStringArray(
  value: unknown,
  fieldName: string,
  maxItems = 50,
  maxItemLength = 100
): { success: true; value: string[] } | { success: false; errors: string[] } {
  const errors: string[] = []

  if (value === null || value === undefined) {
    return { success: true, value: [] }
  }

  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array`)
    return { success: false, errors }
  }

  if (value.length > maxItems) {
    errors.push(`${fieldName} must have at most ${maxItems} item(s)`)
  }

  const cleaned: string[] = []

  for (let i = 0; i < value.length; i++) {
    const item = value[i]
    if (typeof item !== "string" || item.trim() === "") {
      errors.push(`${fieldName}[${i}] must be a non-empty string`)
      continue
    }

    const trimmed = item.trim()
    if (trimmed.length > maxItemLength) {
      errors.push(`${fieldName}[${i}] must be at most ${maxItemLength} character(s)`)
      continue
    }

    cleaned.push(trimmed)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, value: cleaned }
}

export function normalizePagination(
  page: unknown,
  limit: unknown
): { page: number; limit: number } {
  const MAX_LIMIT = 100

  const pageNum = typeof page === "number" ? page : Number(page)
  const limitNum = typeof limit === "number" ? limit : Number(limit)

  const safePage = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1
  const safeLimit = Number.isFinite(limitNum) && limitNum > 0 ? Math.min(Math.floor(limitNum), MAX_LIMIT) : 20

  return {
    page: safePage < 1 ? 1 : safePage,
    limit: safeLimit < 1 ? 20 : safeLimit,
  }
}
