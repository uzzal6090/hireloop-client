"use client"

import { useEffect, useState, useRef } from "react"
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
import { useSearchParams, useRouter } from "next/navigation"

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

interface Company {
  _id: string
  name: string
  industry: string | null
  website: string | null
  location: string | null
  companySize: string | null
  description: string | null
  logo: string | null
  foundedYear: number | null
  status: string
}

type FormMode = "create" | "edit"

interface FormData {
  name: string
  industry: string
  website: string
  location: string
  employeeCount: string
  description: string
  logo: string
  foundedYear: string
}

const initialForm: FormData = {
  name: "",
  industry: "",
  website: "",
  location: "",
  employeeCount: "",
  description: "",
  logo: "",
  foundedYear: "",
}

async function fetchMyCompanies(): Promise<Company[]> {
  const res = await fetch("/api/companies", { cache: "no-store" })
  if (!res.ok) {
    return []
  }
  const data = await res.json()
  return data.companies ?? []
}

async function fetchCompanyById(companyId: string): Promise<Company | null> {
  const res = await fetch(`/api/companies/${companyId}`, { cache: "no-store" })
  if (!res.ok) {
    return null
  }
  const data = await res.json()
  return data.company ?? null
}

export default function RegisterCompanyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceCreate = searchParams.get("new") === "true"
  const companyIdParam = searchParams.get("companyId")

  const [mode, setMode] = useState<FormMode>("create")
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const initialized = useRef(false)

  // Load companies list (separate from form initialization)
  useEffect(() => {
    let cancelled = false

    fetchMyCompanies()
      .then((cs) => {
        if (!cancelled) {
          setCompanies(cs)
          setCompaniesLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompaniesLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Initialize form mode and data - runs once on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Force-create mode: empty form, never auto-populate
    if (forceCreate) {
      setMode("create")
      setEditingCompanyId(null)
      setFormData(initialForm)
      return
    }

    // Edit specific company mode
    if (companyIdParam) {
      setMode("edit")
      setEditingCompanyId(companyIdParam)
      fetchCompanyById(companyIdParam).then((company) => {
        if (company) {
          setFormData({
            name: company.name,
            industry: company.industry ?? "",
            website: company.website ?? "",
            location: company.location ?? "",
            employeeCount: company.companySize ?? "",
            description: company.description ?? "",
            logo: company.logo ?? "",
            foundedYear: String(company.foundedYear ?? ""),
          })
        }
      })
      return
    }

    // Auto-detect: if companies exist, enter edit mode for the first one
    if (companies.length > 0) {
      const first = companies[0]
      if (!first) return
      setMode("edit")
      setEditingCompanyId(first._id)
      setFormData({
        name: first.name,
        industry: first.industry ?? "",
        website: first.website ?? "",
        location: first.location ?? "",
        employeeCount: first.companySize ?? "",
        description: first.description ?? "",
        logo: first.logo ?? "",
        foundedYear: String(first.foundedYear ?? ""),
      })
    }
  }, [forceCreate, companyIdParam, companies.length])

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
    if (formData.foundedYear.trim() !== "") {
      const yearNum = Number(formData.foundedYear.trim())
      if (!Number.isInteger(yearNum) || yearNum <= 0) {
        newErrors.foundedYear = "Founded Year must be a valid positive year"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const { [key]: _, ...rest } = prev
        return rest
      })
    }
    if (apiError) setApiError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)

    const payload = {
      name: formData.name.trim(),
      industry: formData.industry || undefined,
      website: formData.website.trim() || undefined,
      location: formData.location.trim() || undefined,
      companySize: formData.employeeCount || undefined,
      description: formData.description.trim() || undefined,
      logo: formData.logo.trim() || undefined,
      foundedYear: (() => {
        const raw = formData.foundedYear.trim()
        if (!raw) return null
        const num = Number(raw)
        return Number.isInteger(num) && num > 0 ? num : null
      })(),
    }

    try {
      let res: Response
      if (mode === "edit" && editingCompanyId) {
        res = await fetch(`/api/companies/${editingCompanyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        const serverErrors: string[] = Array.isArray(data.errors) ? data.errors : []
        if (serverErrors.length > 0) {
          const fieldMap: Record<string, string> = {
            name: "name",
            slug: "name",
            industry: "industry",
            website: "website",
            location: "location",
            companysize: "employeeCount",
            companySize: "employeeCount",
            description: "description",
            logo: "logo",
            foundedyear: "foundedYear",
          }
          const nextErrors: Record<string, string> = { ...errors }
          let mapped = false
          for (const err of serverErrors) {
            const lower = err.toLowerCase()
            let target: string | null = null
            for (const [field, formField] of Object.entries(fieldMap)) {
              if (lower.includes(field)) {
                target = formField
                break
              }
            }
            if (target) {
              nextErrors[target] = err
              mapped = true
            }
          }
          setErrors(nextErrors)
          if (!mapped) {
            setApiError(serverErrors.join(" "))
          }
        } else {
          setApiError(data.error || "Failed to save company. Please try again.")
        }
        setIsSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch {
      setApiError("Failed to save company. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    const isUpdate = mode === "edit"
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SectionHeader
          title={isUpdate ? "Company Updated" : "Company Registered"}
          subtitle={
            isUpdate
              ? "Your company details have been updated."
              : "Your company has been submitted for admin review."
          }
        />
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">
            {isUpdate ? "Company Details Updated" : "Company Registration Submitted"}
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            {isUpdate
              ? "Your company profile has been saved successfully."
              : `Your company <strong>{formData.name}</strong> has been registered with <strong>Pending</strong> status. An admin will review and approve your company within 24-48 hours. You'll be able to post jobs once approved.`}
          </p>
          <Link href="/dashboard/recruiter/company">
            <button className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
              Go to My Companies
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (companiesLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <SectionHeader
          title={
            mode === "edit" ? "Edit Company" : "Register Company"
          }
          subtitle={
            mode === "edit"
              ? "Update your company details."
              : "Register your company to start posting jobs on HireLoop."
          }
        />
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-gray-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading company data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {apiError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}
      <SectionHeader
        title={
          mode === "edit" ? "Edit Company" : "Register Company"
        }
        subtitle={
          mode === "edit"
            ? "Update your company details."
            : "Register your company to start posting jobs on HireLoop."
        }
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
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Acme Corp"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.name ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                }`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Industry / Category
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all ${
                errors.industry ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
              } text-white`}
            >
              <option value="">Select industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && <p className="text-xs text-red-400">{errors.industry}</p>}
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://acme.com"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.website ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                }`}
              />
            </div>
            {errors.website && <p className="text-xs text-red-400">{errors.website}</p>}
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
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. San Francisco, USA"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                    errors.location ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                  }`}
                />
              </div>
              {errors.location && <p className="text-xs text-red-400">{errors.location}</p>}
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Employee Count
              </label>
              <select
                value={formData.employeeCount}
                onChange={(e) => handleChange("employeeCount", e.target.value)}
                className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all ${
                  errors.employeeCount ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                } text-white`}
              >
                <option value="">Select employee count</option>
                {employeeCounts.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              {errors.employeeCount && (
                <p className="text-xs text-red-400">{errors.employeeCount}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Founded Year
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  value={formData.foundedYear}
                  onChange={(e) => handleChange("foundedYear", e.target.value)}
                  type="number"
                  placeholder="e.g. 2020"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                    errors.foundedYear ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                  }`}
                />
              </div>
              {errors.foundedYear && (
                <p className="text-xs text-red-400">{errors.foundedYear}</p>
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
                onChange={(e) => handleChange("logo", e.target.value)}
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
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              placeholder="Tell us about your company..."
              className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                errors.description ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
              }`}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
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
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : "Registering..."
              : mode === "edit"
                ? "Update Company"
                : "Register Company"}
          </button>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Your company will be reviewed by an admin. Status:{ " "}
            <span className="text-indigo-400 font-medium">Pending</span>
          </p>
        </div>
      </form>
    </div>
  )
}
