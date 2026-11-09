"use client"

import { useState } from "react"
import {
  Search,
  User,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../components/ui"
import Link from "next/link"

type UserRole = "seeker" | "recruiter" | "admin"
type UserStatus = "active" | "suspended"

interface PlatformUser {
  id: string
  name: string
  email: string
  role: UserRole
  joinDate: string
  status: UserStatus
}

const users: PlatformUser[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@techcorp.com", role: "seeker", joinDate: "Oct 10, 2026", status: "active" },
  { id: "2", name: "Mike Chen", email: "mike@startup.io", role: "recruiter", joinDate: "Sep 15, 2026", status: "active" },
  { id: "3", name: "Emma Davis", email: "emma@design.co", role: "seeker", joinDate: "Sep 22, 2026", status: "active" },
  { id: "4", name: "David Kim", email: "david@fintech.com", role: "recruiter", joinDate: "Aug 5, 2026", status: "active" },
  { id: "5", name: "Lisa Wang", email: "lisa@health.io", role: "seeker", joinDate: "Oct 1, 2026", status: "suspended" },
  { id: "6", name: "Robert Smith", email: "robert@enterprise.com", role: "admin", joinDate: "Jan 10, 2026", status: "active" },
  { id: "7", name: "Alice Brown", email: "alice@creative.com", role: "seeker", joinDate: "Oct 20, 2026", status: "active" },
  { id: "8", name: "James Wilson", email: "james@corp.io", role: "recruiter", joinDate: "Sep 10, 2026", status: "suspended" },
]

const roleLabels: Record<UserRole, string> = {
  seeker: "Job Seeker",
  recruiter: "Recruiter",
  admin: "Admin",
}

const roleColors: Record<UserRole, string> = {
  seeker: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  recruiter: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  admin: "bg-pink-500/15 text-pink-400 border-pink-500/30",
}

export default function ManageUsersPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [suspendDialog, setSuspendDialog] = useState<{ id: string; action: "suspend" | "activate" } | null>(null)

  const filteredUsers = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // Simulate role change
    console.log(`Changing user ${userId} to ${newRole}`)
  }

  const handleSuspend = (id: string, action: "suspend" | "activate") => {
    setSuspendDialog({ id, action })
  }

  const handleConfirmSuspend = () => {
    setSuspendDialog(null)
  }

  const handleCancelSuspend = () => {
    setSuspendDialog(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Manage Users"
        subtitle="Search, filter, and manage all platform users."
        action={
          <Link href="/dashboard/admin/users/new">
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
              <Plus className="h-4 w-4" /> Add User
            </button>
          </Link>
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <div className="relative sm:w-64">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole | "all")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all text-white"
          >
            <option value="all">All Roles</option>
            <option value="seeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[11px] text-gray-500">Name</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Role</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-20">Join Date</th>
              <th className="px-5 py-3 text-center font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-24">Status</th>
              <th className="px-5 py-3 text-right font-semibold uppercase tracking-widest text-[11px] text-gray-500 w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">

          {filteredUsers.map(user => (
            <tr key={user.id} className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
              <td className="px-5 py-4 text-left min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleColors[user.role]}`}
                  style={{ maxWidth: "100%" }}
                >
                  {roleLabels[user.role]}
                </span>
              </td>
              <td className="px-5 py-4 text-center w-20 whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="text-xs text-gray-400">{user.joinDate}</span>
              </td>
              <td className="px-5 py-4 text-center w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-5 py-4 text-right w-40 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleRoleChange(user.id, user.role === "seeker" ? "recruiter" : "seeker")}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
                    >
                      {user.role === "seeker" ? "Make Recruiter" : "Make Seeker"}
                    </button>
                  )}
                  {user.status === "active" ? (
                    <button
                      onClick={() => handleSuspend(user.id, "suspend")}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all whitespace-nowrap"
                    >
                      <XCircle className="h-3 w-3" /> Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(user.id, "activate")}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Activate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <User className="mx-auto h-10 w-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No users found</p>
              <p className="text-xs text-gray-600 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </tbody>
        </table>
      </div>

      {/* Suspend/Activate dialog */}
      {suspendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelSuspend} />
          <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-white mb-1">
              {suspendDialog.action === "suspend" ? "Suspend Account" : "Activate Account"}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to {suspendDialog.action} this user's account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelSuspend}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

