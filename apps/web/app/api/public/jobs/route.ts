import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const JOBS_COLLECTION = "jobs"
const COMPANIES_COLLECTION = "companies"

const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship"]
const WORKPLACE_TYPES = ["on-site", "remote", "hybrid"]
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "lead", "executive"]

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10
const DEFAULT_PAGE = 1

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

function validatePagination(
  pageParam: string | null,
  limitParam: string | null
): { page: number; limit: number } | { error: string } {
  const pageStr = pageParam ?? String(DEFAULT_PAGE)
  const limitStr = limitParam ?? String(DEFAULT_LIMIT)

  const pageNum = Number(pageStr)
  const limitNum = Number(limitStr)

  if (!Number.isFinite(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
    return { error: "Invalid page parameter" }
  }

  if (!Number.isFinite(limitNum) || limitNum < 1 || !Number.isInteger(limitNum)) {
    return { error: "Invalid limit parameter" }
  }

  return {
    page: Math.floor(pageNum),
    limit: Math.min(Math.floor(limitNum), MAX_LIMIT),
  }
}

function validateStringFilter(
  value: string | null,
  fieldName: string,
  maxLength: number,
  allowedValues?: string[]
): { value: string } | { error: string } {
  if (value === null || value === "") {
    return { value: "" }
  }

  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    return { error: `${fieldName} is too long` }
  }

  if (allowedValues && !allowedValues.includes(trimmed)) {
    return { error: `Invalid ${fieldName}` }
  }

  return { value: trimmed }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Validate pagination
    const paginationResult = validatePagination(
      searchParams.get("page"),
      searchParams.get("limit")
    )
    if ("error" in paginationResult) {
      return errorResponse(paginationResult.error, 400)
    }
    const { page: safePage, limit: safeLimit } = paginationResult

    // Validate and normalize string filters
    const searchResult = validateStringFilter(
      searchParams.get("search"),
      "search",
      200
    )
    if ("error" in searchResult) {
      return errorResponse(searchResult.error, 400)
    }
    const search = searchResult.value || undefined

    const categoryResult = validateStringFilter(
      searchParams.get("category"),
      "category",
      100
    )
    if ("error" in categoryResult) {
      return errorResponse(categoryResult.error, 400)
    }
    const category = categoryResult.value || undefined

    const locationResult = validateStringFilter(
      searchParams.get("location"),
      "location",
      200
    )
    if ("error" in locationResult) {
      return errorResponse(locationResult.error, 400)
    }
    const location = locationResult.value || undefined

    const employmentTypeResult = validateStringFilter(
      searchParams.get("employmentType"),
      "employmentType",
      50,
      EMPLOYMENT_TYPES
    )
    if ("error" in employmentTypeResult) {
      return errorResponse(employmentTypeResult.error, 400)
    }
    const employmentType = employmentTypeResult.value || undefined

    const workplaceTypeResult = validateStringFilter(
      searchParams.get("workplaceType"),
      "workplaceType",
      50,
      WORKPLACE_TYPES
    )
    if ("error" in workplaceTypeResult) {
      return errorResponse(workplaceTypeResult.error, 400)
    }
    const workplaceType = workplaceTypeResult.value || undefined

    const experienceLevelResult = validateStringFilter(
      searchParams.get("experienceLevel"),
      "experienceLevel",
      50,
      EXPERIENCE_LEVELS
    )
    if ("error" in experienceLevelResult) {
      return errorResponse(experienceLevelResult.error, 400)
    }
    const experienceLevel = experienceLevelResult.value || undefined

    // Build aggregation pipeline
    const pipeline: Record<string, unknown>[] = []

    // Stage 1: Only published jobs
    const firstMatch: Record<string, unknown> = { status: "published" }
    if (search) {
      firstMatch.$text = { $search: search }
    }
    pipeline.push({ $match: firstMatch })

    // Stage 2: Lookup company
    pipeline.push({
      $lookup: {
        from: COMPANIES_COLLECTION,
        localField: "companyId",
        foreignField: "_id",
        as: "company",
      },
    })

    // Stage 3: Unwind company (inner join - only jobs with a valid company)
    pipeline.push({
      $unwind: {
        path: "$company",
        preserveNullAndEmptyArrays: false,
      },
    })

    // Stage 4: Only approved companies
    pipeline.push({ $match: { "company.status": "approved" } })

    // Stage 5: Additional job filters
    const jobFilter: Record<string, unknown> = {}
    if (category) jobFilter.category = category
    if (location) jobFilter.location = location
    if (employmentType) jobFilter.employmentType = employmentType
    if (workplaceType) jobFilter.workplaceType = workplaceType
    if (experienceLevel) jobFilter.experienceLevel = experienceLevel

    if (Object.keys(jobFilter).length > 0) {
      pipeline.push({ $match: jobFilter })
    }

    // Stage 6: Sort newest first
    pipeline.push({ $sort: { createdAt: -1 } })

    // Stage 7: Facet for count + paginated data
    const skip = (safePage - 1) * safeLimit
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: safeLimit },
          {
            $project: {
              _id: { $toString: "$_id" },
              title: 1,
              slug: 1,
              description: 1,
              requirements: 1,
              responsibilities: 1,
              benefits: 1,
              employmentType: 1,
              workplaceType: 1,
              location: 1,
              salary: 1,
              experienceLevel: 1,
              skills: 1,
              category: 1,
              applicationDeadline: 1,
              createdAt: 1,
              company: {
                _id: { $toString: "$company._id" },
                name: 1,
                slug: 1,
                logo: 1,
                industry: 1,
                location: 1,
              },
            },
          },
        ],
      },
    })

    const result = await db.collection(JOBS_COLLECTION).aggregate(pipeline).toArray()

    const facet = result[0]
    const total = facet?.metadata?.[0]?.total ?? 0
    const jobs = facet?.data ?? []

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    })
  } catch (err) {
    console.error("Public jobs API error:", err)
    return errorResponse("Failed to fetch jobs", 500)
  }
}
