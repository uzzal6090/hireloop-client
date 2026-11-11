import { requireRole } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  try {
    await requireRole("recruiter")
  } catch {
    redirect("/")
  }

  return <>{children}</>
}
