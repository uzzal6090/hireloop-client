"use client"

import { useState } from "react"
import {
  Building2,
  MapPin,
  Globe,
  Users,
  FileText,
  X,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../../components/ui"
import Link from "next/link"

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-Commerce",
  "AI & Machine Learning",
  "Developer Tools",
  "Design",
  "Marketing",
  "Other",
]

const employeeCounts = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]

export default function RegisterCompanyPage() {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    location: "",
    employeeCount: "",
    description: "",
    logo: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Company name is required"
    if (!formData.industry) newErrors.industry = "Please select an industry"
    if (!formData.website.trim()) newErrors.website = "Website URL is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.employeeCount)
      newErrors.employeeCount = "Please select employee count"
    if (!formData.description.trim())
      newErrors.description = "Company description is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    key: string,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const { [key]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      // Simulate API save - status pending for admin approval
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SectionHeader
          title="Company Registered"
          subtitle="Your company has been submitted for admin review."
        />
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Company Registration Submitted</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Your company <strong>{formData.name}</strong> has been registered with
            <strong>Pending</strong> status. An admin will review and approve your
            company within 24-48 hours. You'll be able to post jobs once approved.
          </p>
          <Link href="/dashboard/recruiter/company">
            <button className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
              Go to My Company
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SectionHeader
        title="Register Company"
        subtitle="Register your company to start posting jobs on HireLoop."
        action={
          <Link href="/dashboard/recruiter/company">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
            Company Information
          </h2>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={formData.name}
                onChange={e => handleChange("name", e.target.value)}
                placeholder="e.g. Acme Corp"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.name ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Industry / Category
            </label>
            <select
              value={formData.industry}
              onChange={e => handleChange("industry", e.target.value)}
              className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all ${
                errors.industry ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
              } text-white`}
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-xs text-red-400">{errors.industry}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={formData.website}
                onChange={e => handleChange("website", e.target.value)}
                placeholder="https://acme.com"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.website ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                }`}
              />
            </div>
            {errors.website && (
              <p className="text-xs text-red-400">{errors.website}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
            Location & Size
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  value={formData.location}
                  onChange={e => handleChange("location", e.target.value)}
                  placeholder="e.g. San Francisco, USA"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                    errors.location ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                  }`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-400">{errors.location}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Employee Count
              </label>
              <select
                value={formData.employeeCount}
                onChange={e => handleChange("employeeCount", e.target.value)}
                className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all ${
                  errors.employeeCount ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                } text-white`}
              >
                <option value="">Select employee count</option>
                {employeeCounts.map(count => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              {errors.employeeCount && (
                <p className="text-xs text-red-400">{errors.employeeCount}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
            Branding & Description
          </h2>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Company Logo (Image URL)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={formData.logo}
                onChange={e => handleChange("logo", e.target.value)}
                placeholder="https://example.com/logo.png"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  "border-white/10 bg-[#0a0a0a]/60"
                }`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Short Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={4}
              placeholder="Tell us about your company..."
              className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                errors.description ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-400">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-full py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 ${
              isSubmitting
                ? "bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:-translate-y-0.5 hover:shadow-purple-500/30"
            }`}
          >
            {isSubmitting ? "Registering..." : "Register Company"}
          </button>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Your company will be reviewed by an admin. Status:{" "}
            <span className="text-indigo-400 font-medium">Pending</span>
          </p>
        </div>
      </form>
    </div>
  )
}

