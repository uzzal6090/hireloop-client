import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type UserRole = "seeker" | "recruiter" | "admin"

const ROLE_BASE_PATHS: Record<UserRole, string> = {
  seeker: "/dashboard/seekers",
  recruiter: "/dashboard/recruiter",
  admin: "/dashboard/admin",
}

function matchesRolePath(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(basePath + "/")
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  // Read session server-side using Better Auth API
  const result = await auth.api.getSession({
    headers: request.headers,
  })

  // Unauthenticated users: redirect to signin
  if (!result || !result.session) {
    const signinUrl = new URL("/signin", request.url)
    signinUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signinUrl)
  }

  const userRole = result.user.role as UserRole | undefined

  // Role-based access control using segment-aware matching
  if (matchesRolePath(pathname, ROLE_BASE_PATHS.seeker)) {
    if (userRole !== "seeker") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } else if (matchesRolePath(pathname, ROLE_BASE_PATHS.recruiter)) {
    if (userRole !== "recruiter") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } else if (matchesRolePath(pathname, ROLE_BASE_PATHS.admin)) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  } else if (pathname === "/dashboard") {
    // Redirect root dashboard to role-specific landing
    const target = userRole ? ROLE_BASE_PATHS[userRole] : "/"
    return NextResponse.redirect(new URL(target, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
