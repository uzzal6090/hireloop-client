import { NextResponse } from "next/server"
import { getJobBySlug } from "@/lib/repositories/job.repository"
import { getCompanyById } from "@/lib/repositories/company.repository"

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
      return errorResponse("Invalid slug", 400)
    }

    const job = await getJobBySlug(slug)
    if (!job) {
      return errorResponse("Job not found", 404)
    }

    if (job.status !== "published") {
      return errorResponse("Job not found", 404)
    }

    const company = await getCompanyById(job.companyId.toString())
    if (!company) {
      return errorResponse("Job not found", 404)
    }

    if (company.status !== "approved") {
      return errorResponse("Job not found", 404)
    }

    return NextResponse.json({
      success: true,
      data: {
        job: {
          _id: job._id.toString(),
          title: job.title,
          slug: job.slug,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          benefits: job.benefits,
          employmentType: job.employmentType,
          workplaceType: job.workplaceType,
          location: job.location,
          salary: job.salary,
          experienceLevel: job.experienceLevel,
          skills: job.skills,
          category: job.category,
          applicationDeadline: job.applicationDeadline,
          createdAt: job.createdAt,
        },
        company: {
          _id: company._id.toString(),
          name: company.name,
          slug: company.slug,
          description: company.description,
          logo: company.logo,
          website: company.website,
          industry: company.industry,
          companySize: company.companySize,
          location: company.location,
          foundedYear: company.foundedYear,
        },
      },
    })
  } catch (err) {
    return errorResponse("Failed to fetch job", 500)
  }
}
