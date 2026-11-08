"use client"

import { useState } from "react"
import {
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Save,
  Building2 as Building2Icon,
} from "lucide-react"
import { SectionHeader } from "../../components/ui"

export default function AdminSettingsPage() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Settings" subtitle="Update your admin profile information." />

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          ✓ Changes saved successfully
        </div>
      )}

      {/* Profile info */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
          Profile Information
        </h2>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              defaultValue="Admin User"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              defaultValue="admin@hireloop.com"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Profile Image URL
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Role
          </label>
          <div className="relative">
            <Building2Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
              defaultValue="admin"
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all border-white/10 bg-[#0a0a0a]/60 text-white"
            >
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
          Change Password
        </h2>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type={newPasswordVisible ? "text" : "password"}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setNewPasswordVisible(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {newPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
        <Save className="h-4 w-4" />
        Save Changes
      </button>
    </div>
  )
}

