"use client"

import { useSession, signOut } from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarMenuSkeleton,
} from "@workspace/ui/components/sidebar"
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  CreditCard,
  Settings,
  Building2,
  Users,
  Building,
  DollarSign,
  LogOut,
  Upload,
  Plus,
  House,
  type LucideIcon,
} from "lucide-react"
import Image from "next/image"
import logoImage from "@/app/assest/logo.png"

type Role = "seeker" | "recruiter" | "admin"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  seeker: [
    { name: "Dashboard", url: "/dashboard/seekers", icon: LayoutDashboard },
    { name: "Jobs", url: "/dashboard/seekers/jobs", icon: Briefcase },
    { name: "Saved Jobs", url: "/dashboard/seekers/saved", icon: Bookmark },
    { name: "Applications", url: "/dashboard/seekers/applications", icon: FileText },
    { name: "Billing", url: "/dashboard/seekers/billing", icon: CreditCard },
    { name: "Settings", url: "/dashboard/seekers/settings", icon: Settings },
  ],
  recruiter: [
    { name: "Dashboard", url: "/dashboard/recruiter", icon: LayoutDashboard },
    { name: "Add Job", url: "/dashboard/recruiter/jobs/new", icon: Plus },
    { name: "Manage Jobs", url: "/dashboard/recruiter/jobs", icon: Briefcase },
    { name: "Applications", url: "/dashboard/recruiter/jobs", icon: FileText },
    { name: "My Company", url: "/dashboard/recruiter/company", icon: Building2 },
    { name: "Settings", url: "/dashboard/recruiter/settings", icon: Settings },
  ],
  admin: [
    { name: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Users", url: "/dashboard/admin/users", icon: Users },
    { name: "Companies", url: "/dashboard/admin/companies", icon: Building },
    { name: "Jobs", url: "/dashboard/admin/jobs", icon: Briefcase },
    { name: "Payments", url: "/dashboard/admin/payments", icon: DollarSign },
    { name: "Settings", url: "/dashboard/admin/settings", icon: Settings },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  seeker: "Seeker",
  recruiter: "Recruiter",
  admin: "Admin",
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const user = session?.user
  const rawRole = (user as { role?: string })?.role
  const role: Role | null =
    rawRole === "seeker" || rawRole === "recruiter" || rawRole === "admin"
      ? rawRole
      : null

  const items = role ? NAV_ITEMS[role] : []
  const isActive = (url: string) => pathname === url

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  if (isPending) {
    return (
      <Sidebar>
        <SidebarHeader className="px-3 pt-4 pb-2">
          <SidebarMenuSkeleton showIcon width="60%" />
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarGroup className="px-3 py-3">
            <SidebarMenuSkeleton showIcon width="70%" />
          </SidebarGroup>
          <SidebarSeparator className="mx-2 my-1" />
          <SidebarGroup className="px-3 py-1">
            <SidebarMenu>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={`skeleton-${i}`}>
                  <SidebarMenuSkeleton showIcon width={`${55 + i * 15}%`} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-3 py-2">
          <SidebarMenuSkeleton showIcon width="60%" />
          <SidebarMenuSkeleton showIcon width="75%" />
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      {/* 1. LOGO - at the very top */}
      <SidebarHeader className="px-3 pt-4 pb-2">
        <Image
          src={logoImage}
          alt="HireLoop Logo"
          width={154}
          height={44}
          className="block shrink-0"
          unoptimized
          priority
        />
      </SidebarHeader>

      {/* 2. USER PROFILE - immediately below logo */}
      <SidebarContent className="px-2">
        <SidebarGroup className="px-3 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-white/10"
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/10">
                    {initials}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.name ?? "User"}
                </p>
                {user?.email && (
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user.email}
                  </p>
                )}
                <p className="text-[10px] font-medium text-sidebar-primary uppercase tracking-wider">
                  {role ? ROLE_LABELS[role] : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </SidebarGroup>

        {/* 3. DIVIDER */}
        <SidebarSeparator className="mx-2 my-1" />

        {/* 4. ROLE-SPECIFIC NAVIGATION */}
        <SidebarGroup className="px-3 py-1">
          <SidebarMenu>
            {items.map((item) => {
              const active = isActive(item.url)
              const ItemIcon = item.icon
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    className={cn(
                      active
                        ? "border-l-2 border-l-sidebar-primary bg-sidebar-accent/40 text-sidebar-primary! [&_svg]:text-sidebar-primary!"
                        : "text-sidebar-foreground/50 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground!",
                    )}
                    render={
                      <Link
                        href={item.url}
                        className="flex w-full items-center gap-2.5"
                      >
                        <ItemIcon className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* 5 & 6. BACK TO HOME and LOGOUT at bottom */}
      <SidebarFooter className="flex flex-col gap-2 p-3">
        {role === "seeker" && (
          <Link
            href="/dashboard/seekers/settings"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 bg-sidebar-accent/10 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground transition-colors"
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span>Post Resume</span>
          </Link>
        )}
        <Link
          href="/"
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 bg-sidebar-accent/10 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground transition-colors"
        >
          <House className="h-4 w-4 shrink-0" />
          <span>Back to Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 bg-sidebar-accent/10 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
