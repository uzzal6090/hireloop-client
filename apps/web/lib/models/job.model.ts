import { ObjectId } from "mongodb"

export type JobStatus = "draft" | "pending" | "published" | "closed" | "rejected"
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship"
export type WorkplaceType = "on-site" | "remote" | "hybrid"
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive"

export interface Job {
  _id: ObjectId
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
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobInput {
  title: string
  slug: string
  description: string
  requirements?: string | null
  responsibilities?: string | null
  benefits?: string | null
  companyId: ObjectId
  recruiterId: string
  employmentType: EmploymentType
  workplaceType: WorkplaceType
  location?: string | null
  salary?: string | null
  experienceLevel?: ExperienceLevel | null
  skills?: string[]
  category?: string | null
  status?: JobStatus
  applicationDeadline?: Date | null
}

export interface UpdateJobInput {
  title?: string
  slug?: string
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

export type JobDocument = Job & Record<string, unknown>
