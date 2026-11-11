import { auth } from "./auth"
import { headers } from "next/headers"

type UserRole = "seeker" | "recruiter" | "admin"

async function getServerSession() {
  const headerList = await headers()
  return auth.api.getSession({ headers: headerList })
}

export async function requireSession() {
  const result = await getServerSession()

  if (!result || !result.session) {
    throw new Error("Unauthorized: No valid session")
  }

  return result.session
}

export async function requireRole(role: UserRole) {
  const result = await getServerSession()

  if (!result || !result.session) {
    throw new Error("Unauthorized: No valid session")
  }

  if (result.user.role !== role) {
    throw new Error(`Forbidden: Role "${role}" required`)
  }

  return result.session
}

export async function requireAnyRole(roles: UserRole[]) {
  const result = await getServerSession()

  if (!result || !result.session) {
    throw new Error("Unauthorized: No valid session")
  }

  if (!roles.includes(result.user.role as UserRole)) {
    throw new Error(`Forbidden: One of roles ${roles.join(", ")} required`)
  }

  return result.session
}

export { type UserRole }
