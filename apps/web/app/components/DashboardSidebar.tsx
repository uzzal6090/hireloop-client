"use client"

import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,

} from "@workspace/ui/components/sidebar"
import { Plus } from "lucide-react"

type UserRole = "admin" | "recruiter" | "seeker"

interface MenuItem {
  name: string
  url: string
  icon: React.ComponentType
}

const menuItemsByRole: Record<UserRole, MenuItem[]> = {
  admin: [],

  recruiter: [],

  seeker: [],
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession()

  const userRole = (session?.user as { role?: string })?.role
  const role: UserRole =
    userRole === "admin" || userRole === "recruiter" || userRole === "seeker"
      ? userRole
      : "seeker"

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
        <SidebarGroup>
          <SidebarMenu>
            {menuItemsByRole[role].map((project) => (
              <SidebarMenuItem key={project.name}>
                <SidebarMenuButton render={<a href={project.url} />}>
                  <project.icon />
                  <span>{project.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
