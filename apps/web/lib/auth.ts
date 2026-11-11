import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

// Environment variables
const uri = process.env.BETTER_AUTH_DB_URI
const secret = process.env.BETTER_AUTH_SECRET

if (!uri) {
  throw new Error("BETTER_AUTH_DB_URI is missing")
}

if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters")
}

// Reuse MongoDB connection
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient
}

export const client = globalForMongo.mongoClient ?? new MongoClient(uri)

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client
}

// Select database
const db = client.db("hireloopdb")

// Better Auth configuration
export const auth = betterAuth({
  secret,
  baseURL: process.env.BETTER_AUTH_URL,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ['seeker', 'recruiter', 'admin'],
        input: true,
        output: true,
      },
    },
  },

  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
})
