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

const roleBadgeStyle: Record<UserRole, string> = {
  seeker:    "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  recruiter: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  admin:     "bg-pink-500/20 text-pink-300 border-pink-500/30",
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
          className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
        />
      )
    }
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-semibold text-white ring-2 ring-white/10">
        {user.name?.charAt(0).toUpperCase() ?? "U"}
      </div>
    )
  }

  return (
    <Sidebar className="border-r border-white/10 bg-[#111111]">
      {/* ── Header ── */}
      <SidebarHeader className="px-4 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoImage}
            alt="HireLoop"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="text-base font-bold tracking-tight text-white">
            HireLoop
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Main Nav ── */}
      <SidebarContent className="px-3 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {role === "admin" ? "Admin Panel" : role === "recruiter" ? "Recruiter" : "Job Seeker"}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-purple-400" : "text-gray-500"
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-3 w-3 text-purple-400" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-3 bg-white/10" />

        {/* Public nav links */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Explore
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5">
            {publicNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-white/5 hover:text-gray-300"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-gray-600" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User Info ── */}
      <SidebarFooter className="border-t border-white/10 px-4 py-4">
        {isPending ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-32 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3">
              {renderAvatar()}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-white leading-tight">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-gray-500 leading-none mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
            {/* Role badge */}
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                roleBadgeStyle[role]
              )}
            >
              {role}
            </span>
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
