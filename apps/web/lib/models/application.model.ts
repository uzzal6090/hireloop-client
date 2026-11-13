import { ObjectId } from "mongodb"

export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "rejected"
  | "offered"
  | "accepted"

export interface Application {
  _id: ObjectId
  seekerId: string
  jobId: ObjectId
  companyId: ObjectId
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateApplicationInput {
  seekerId: string
  jobId: ObjectId
  companyId: ObjectId
  status?: ApplicationStatus
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus
}

export type ApplicationDocument = Application & Record<string, unknown>
