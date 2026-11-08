import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function middleware(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const pathname = new URL(request.url).pathname

  // Not authenticated - redirect to signin for dashboard routes
  if (!session) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }
    return NextResponse.next()
  }

  const userRole = ((session.user as { role?: string })?.role || "seeker") as "seeker" | "recruiter" | "admin"

  // Role-based route access map
  const roleRouteMap: Record<"seeker" | "recruiter" | "admin", string> = {
    seeker: "/dashboard/seekers",
    recruiter: "/dashboard/recruiter",
    admin: "/dashboard/admin",
  }

  const allowedPrefix = roleRouteMap[userRole]

  if (pathname.startsWith("/dashboard")) {
    const isOwnRoleRoute = pathname.startsWith(allowedPrefix)
    if (!isOwnRoleRoute) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
