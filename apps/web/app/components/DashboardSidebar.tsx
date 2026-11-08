"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  CreditCard,
  Settings,
  Building2,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Home,
  Search,
  DollarSign,
  ListChecks,
  UserCog,
  BarChart3,
  PlusSquare,
} from "lucide-react"
import logoImage from "@/app/assest/logo.png"

type UserRole = "admin" | "recruiter" | "seeker"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const seekerNav: NavItem[] = [
  { label: "Overview",         href: "/dashboard/seekers",              icon: LayoutDashboard },
  { label: "Browse & Apply",   href: "/dashboard/seekers/jobs",         icon: Search },
  { label: "Saved Jobs",       href: "/dashboard/seekers/saved",        icon: Bookmark },
  { label: "My Applications",  href: "/dashboard/seekers/applications", icon: FileText },
  { label: "Billing",          href: "/dashboard/seekers/billing",      icon: CreditCard },
  { label: "Settings",         href: "/dashboard/seekers/settings",     icon: Settings },
]

const recruiterNav: NavItem[] = [
  { label: "Overview",       href: "/dashboard/recruiter",                   icon: LayoutDashboard },
  { label: "My Company",     href: "/dashboard/recruiter/company",           icon: Building2 },
  { label: "Manage Jobs",    href: "/dashboard/recruiter/jobs",              icon: Briefcase },
  { label: "Post a Job",     href: "/dashboard/recruiter/jobs/new",          icon: PlusSquare },
  { label: "Billing",        href: "/dashboard/recruiter/billing",           icon: CreditCard },
  { label: "Settings",       href: "/dashboard/recruiter/settings",          icon: Settings },
]

const adminNav: NavItem[] = [
  { label: "Overview",       href: "/dashboard/admin",           icon: LayoutDashboard },
  { label: "Manage Users",   href: "/dashboard/admin/users",     icon: Users },
  { label: "Companies",      href: "/dashboard/admin/companies", icon: Building2 },
  { label: "Manage Jobs",    href: "/dashboard/admin/jobs",      icon: Briefcase },
  { label: "Payments",       href: "/dashboard/admin/payments",  icon: DollarSign },
  { label: "Settings",       href: "/dashboard/admin/settings",  icon: Settings },
]

const publicNav: NavItem[] = [
  { label: "Home",        href: "/",          icon: Home },
  { label: "Browse Jobs", href: "/jobs",       icon: Search },
  { label: "Companies",   href: "/companies",  icon: Building2 },
  { label: "Pricing",     href: "/pricing",    icon: DollarSign },
]

const navByRole: Record<UserRole, NavItem[]> = {
  seeker:    seekerNav,
  recruiter: recruiterNav,
  admin:     adminNav,
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const rawRole = (session?.user as { role?: string })?.role
  const role: UserRole =
    rawRole === "admin" || rawRole === "recruiter" || rawRole === "seeker"
      ? rawRole
      : "seeker"

  const navItems = navByRole[role]
  const user = session?.user

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const renderAvatar = () => {
    if (!user) return null
    if (user.image) {
      return (
        <Image
          src={user.image}
          alt={user.name ?? "User"}
          width={36}
          height={36}
          unoptimized
          className="h-9 w-9 rounded-full object-cover ring-2 ring-sidebar-border"
        />
      )
    }
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-semibold ring-2 ring-sidebar-border">
        {user.name?.charAt(0).toUpperCase() ?? "U"}
      </div>
    )
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      {/* ── Header ── */}
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoImage}
            alt="HireLoop"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">
            HireLoop
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Main Nav ── */}
      <SidebarContent className="px-3 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/70">
            {role === "admin" ? "Admin Panel" : role === "recruiter" ? "Recruiter" : "Job Seeker"}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      !isActive && "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60"
                      )}
                    />
                    <span className={isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70"}>
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-3 w-3 text-sidebar-accent-foreground" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-3" />

        {/* Public nav links */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/70">
            Explore
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5">
            {publicNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
                  <span className="text-sidebar-foreground/70">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User Info ── */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        {isPending ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-sidebar-accent animate-pulse" />
              <div className="h-2.5 w-32 rounded bg-sidebar-accent animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3">
              {renderAvatar()}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground leading-tight">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-sidebar-foreground/50 leading-none mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
            {/* Role badge */}
            <span
              className="inline-flex items-center rounded-full border border-sidebar-accent bg-sidebar-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-accent-foreground"
            >
              {role}
            </span>
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}
