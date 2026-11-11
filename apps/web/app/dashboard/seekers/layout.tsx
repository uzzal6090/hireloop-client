import { requireRole } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export default async function SeekerDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  try {
    await requireRole("seeker")
  } catch {
    redirect("/")
  }

  return <>{children}</>
}
