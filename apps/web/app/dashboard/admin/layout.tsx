import { requireRole } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  try {
    await requireRole("admin")
  } catch {
    redirect("/")
  }

  return <>{children}</>
}
