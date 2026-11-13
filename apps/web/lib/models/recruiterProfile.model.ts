import { ObjectId } from "mongodb"

export type RecruiterProfile = {
  userId: string
  headline: string | null
  bio: string | null
  skills: string[]
  updatedAt: Date
}

export interface RecruiterProfileDocument {
  _id: ObjectId
  userId: string
  headline: string | null
  bio: string | null
  skills: string[]
  updatedAt: Date
}
