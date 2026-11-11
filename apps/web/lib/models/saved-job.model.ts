import { ObjectId } from "mongodb"

export interface SavedJob {
  _id: ObjectId
  userId: string
  jobId: ObjectId
  createdAt: string
}

export interface CreateSavedJobInput {
  userId: string
  jobId: ObjectId
}
