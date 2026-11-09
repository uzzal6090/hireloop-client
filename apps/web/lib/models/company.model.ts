import { ObjectId } from "mongodb"

export type CompanyStatus = "pending" | "approved" | "rejected" | "suspended"

export interface Company {
  _id: ObjectId
  name: string
  slug: string
  description: string
  logo: string | null
  website: string | null
  industry: string | null
  companySize: string | null
  location: string | null
  foundedYear: number | null
  ownerId: string
  status: CompanyStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateCompanyInput {
  name: string
  slug: string
  description?: string
  logo?: string | null
  website?: string | null
  industry?: string | null
  companySize?: string | null
  location?: string | null
  foundedYear?: number | null
  ownerId: string
  status?: CompanyStatus
}

export interface UpdateCompanyInput {
  name?: string
  slug?: string
  description?: string | null
  logo?: string | null
  website?: string | null
  industry?: string | null
  companySize?: string | null
  location?: string | null
  foundedYear?: number | null
  status?: CompanyStatus
}

export type CompanyDocument = Company & Record<string, unknown>
