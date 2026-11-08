import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
})

export const { signIn, signUp, signOut, useSession } = authClient

export type Session = typeof auth.$Infer.Session
