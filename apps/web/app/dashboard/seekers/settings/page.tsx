"use client"

import { useState } from "react"
import { User, Mail, Lock, Image as ImageIcon, FileText, Plus, X, Eye, EyeOff, Save } from "lucide-react"
import { SectionHeader } from "../../components/ui"

const initialSkills = ["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js"]

export default function SeekerSettingsPage() {
  const [passwordVisible, setPasswordVisible]       = useState(false)
  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const [skills, setSkills]                         = useState(initialSkills)
  const [newSkill, setNewSkill]                     = useState("")
  const [saved, setSaved]                           = useState(false)

  const addSkill = () => {
    const s = newSkill.trim()
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setNewSkill("")
  }

  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeader title="Settings" subtitle="Update your profile information." />

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
          ✓ Changes saved successfully
        </div>
      )}

      {/* Profile info */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">Profile Information</h2>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input defaultValue="John Doe" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input defaultValue="john.doe@example.com" type="email" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Profile Image URL</label>
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input placeholder="https://example.com/avatar.jpg" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Headline</label>
          <input placeholder="e.g. Senior Frontend Developer" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 px-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell recruiters about yourself..."
            className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 px-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <span key={s} className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {s}
              <button onClick={() => removeSkill(s)} className="text-purple-400 hover:text-white transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSkill()}
            placeholder="Add a skill..."
            className="flex-1 rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-2.5 px-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <button onClick={addSkill} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Resume */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">Resume</h2>
        <div className="rounded-xl border-2 border-dashed border-white/10 p-8 text-center hover:border-purple-500/30 transition-colors cursor-pointer">
          <FileText className="mx-auto h-10 w-10 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400 font-medium">Upload your resume (PDF)</p>
          <p className="text-xs text-gray-600 mt-1">Drag & drop or click to browse</p>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">Change Password</h2>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type={passwordVisible ? "text" : "password"} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            <button type="button" onClick={() => setPasswordVisible(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
              {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type={newPasswordVisible ? "text" : "password"} placeholder="Min. 8 characters" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-11 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            <button type="button" onClick={() => setNewPasswordVisible(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
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

