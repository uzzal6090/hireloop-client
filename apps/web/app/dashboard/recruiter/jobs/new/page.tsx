"use client"

import { useState } from "react"
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  ChevronRight,
  X,
  ToggleRight,
  ToggleLeft,
  CheckCircle2,
} from "lucide-react"
import { SectionHeader, StatusBadge } from "../../../components/ui"
import Link from "next/link"

const jobCategories = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "DevOps",
  "Data",
  "Sales",
  "Customer Support",
  "HR",
  "Finance",
  "Other",
]

const jobTypes = ["Full-time", "Part-time", "Remote", "Contract", "Internship"]

const currencies = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "SGD"]

const company = {
  name: "Acme Corp",
  logo: "A",
  status: "Approved" as const,
  plan: "Growth" as const,
  activeJobs: 7,
  planLimit: 10,
}

export default function PostJobPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "Full-time",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    location: "",
    isRemote: false,
    deadline: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = ["Job Info", "Job Description", "Company & Review"]

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = "Job title is required"
      if (!formData.category) newErrors.category = "Please select a category"
      if (!formData.salaryMin.trim()) newErrors.salaryMin = "Min salary is required"
      if (!formData.salaryMax.trim()) newErrors.salaryMax = "Max salary is required"
      if (!formData.location.trim() && !formData.isRemote)
        newErrors.location = "Location is required (or toggle Remote)"
      if (!formData.deadline) newErrors.deadline = "Application deadline is required"
    }
    if (step === 1) {
      if (!formData.responsibilities.trim())
        newErrors.responsibilities = "Responsibilities are required"
      if (!formData.requirements.trim())
        newErrors.requirements = "Requirements are required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const { [key]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleToggleRemote = () => {
    setFormData(prev => ({ ...prev, isRemote: !prev.isRemote }))
    if (errors.location) {
      setErrors(prev => {
        const { location: _, ...rest } = prev
        return rest
      })
    }
  }

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(activeStep)) return

    if (company.activeJobs >= company.planLimit) {
      setErrors({
        ...errors,
        limit: `You've reached your plan limit (${company.activeJobs}/${company.planLimit} active jobs).`,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAtLimit = company.activeJobs >= company.planLimit

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SectionHeader
        title="Post a Job"
        subtitle="Create a new job listing for {company.name}."
        action={
          <Link href="/dashboard/recruiter/jobs">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              <X className="h-4 w-4" /> Cancel
            </button>
          </Link>
        }
      />

      {/* Company info banner */}
      {company.status !== "Approved" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <X className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Company Not Approved</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Your company must be approved by an admin before you can post jobs.
            </p>
          </div>
        </div>
      )}

      {isAtLimit && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <X className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Job Limit Reached</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              You've used {company.activeJobs} of {company.planLimit} active job posts.
              Upgrade your plan to post more jobs.
            </p>
          </div>
        </div>
      )}

      {company.status !== "Approved" && !isAtLimit ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
            {steps.map((step, idx) => (
              <div
                key={step}
                className={`flex items-center gap-2 ${
                  idx === activeStep
                    ? "text-purple-400"
                    : idx < activeStep
                    ? "text-emerald-400"
                    : "text-gray-500"
                }`}
              >
                {idx < activeStep ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                ) : idx === activeStep ? (
                  <div className="h-3 w-3 rounded-full bg-purple-400" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-gray-600" />
                )}
                <span>{step}</span>
                {idx < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-gray-600" />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Job Info */}
          {activeStep === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
                Job Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Job Title
                  </label>
                  <input
                    value={formData.title}
                    onChange={e => handleChange("title", e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                      errors.title ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                    }`}
                  />
                  {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Job Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => handleChange("category", e.target.value)}
                      className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all ${
                        errors.category ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                      } text-white`}
                    >
                      <option value="">Select category</option>
                      {jobCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-xs text-red-400">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Job Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={e => handleChange("type", e.target.value)}
                      className="w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all border-white/10 bg-[#0a0a0a]/60 text-white"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Min Salary
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        value={formData.salaryMin}
                        onChange={e => handleChange("salaryMin", e.target.value)}
                        type="number"
                        placeholder="0"
                        className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                          errors.salaryMin ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                        }`}
                      />
                    </div>
                    {errors.salaryMin && (
                      <p className="text-xs text-red-400">{errors.salaryMin}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Max Salary
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        value={formData.salaryMax}
                        onChange={e => handleChange("salaryMax", e.target.value)}
                        type="number"
                        placeholder="0"
                        className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                          errors.salaryMax ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                        }`}
                      />
                    </div>
                    {errors.salaryMax && (
                      <p className="text-xs text-red-400">{errors.salaryMax}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={e => handleChange("currency", e.target.value)}
                      className="w-full rounded-xl border py-3 pl-4 pr-4 text-sm outline-none transition-all border-white/10 bg-[#0a0a0a]/60 text-white"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Location
                    </label>
                    <button
                      onClick={handleToggleRemote}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        formData.isRemote
                          ? "bg-purple-500"
                          : "bg-gray-600"
                      }`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        formData.isRemote ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                    <span className={`text-sm ${formData.isRemote ? "text-emerald-400" : "text-white"} font-medium`}>
                      {formData.isRemote ? "Remote" : "Office Location"}
                    </span>
                  </div>
                  {!formData.isRemote && (
                    <>
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
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Application Deadline
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      value={formData.deadline}
                      onChange={e => handleChange("deadline", e.target.value)}
                      type="date"
                      className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${
                        errors.deadline ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                      }`}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-xs text-red-400">{errors.deadline}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Description */}
          {activeStep === 1 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
                Job Description
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Responsibilities
                  </label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={e => handleChange("responsibilities", e.target.value)}
                    rows={6}
                    placeholder="Describe key responsibilities..."
                    className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none ${
                      errors.responsibilities ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                    }`}
                  />
                  {errors.responsibilities && (
                    <p className="text-xs text-red-400">{errors.responsibilities}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Requirements
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={e => handleChange("requirements", e.target.value)}
                    rows={6}
                    placeholder="List required skills and qualifications..."
                    className={`w-full rounded-xl border py-3 pl-4 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none ${
                      errors.requirements ? "border-red-500" : "border-white/10 bg-[#0a0a0a]/60"
                    }`}
                  />
                  {errors.requirements && (
                    <p className="text-xs text-red-400">{errors.requirements}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Benefits (Optional)
                  </label>
                  <textarea
                    value={formData.benefits}
                    onChange={e => handleChange("benefits", e.target.value)}
                    rows={4}
                    placeholder="Health insurance, flexible hours, etc..."
                    className="w-full rounded-xl border py-3 pl-4 pr-4 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none border-white/10 bg-[#0a0a0a]/60"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {activeStep === 2 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
                Review & Publish
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white`}>
                    {company.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{formData.title}</h3>
                    <p className="text-xs text-gray-400">{company.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={company.plan} />
                      <span className="text-xs text-gray-500">
                        {company.activeJobs}/{company.planLimit} active jobs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Category
                    </p>
                    <p className="text-sm text-white">{formData.category}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Type
                    </p>
                    <p className="text-sm text-white">{formData.type}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Salary
                    </p>
                    <p className="text-sm text-white">
                      {formData.currency} {formData.salaryMin} - {formData.salaryMax}/yr
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Location
                    </p>
                    <p className="text-sm text-white">
                      {formData.isRemote ? "Remote" : formData.location}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Deadline
                    </p>
                    <p className="text-sm text-white">{formData.deadline}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Responsibilities
                  </p>
                  <p className="text-sm text-gray-300 whitespace-pre-line">
                    {formData.responsibilities}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Requirements
                  </p>
                  <p className="text-sm text-gray-300 whitespace-pre-line">
                    {formData.requirements}
                  </p>
                </div>

                {formData.benefits.trim() && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Benefits
                    </p>
                    <p className="text-sm text-gray-300 whitespace-pre-line">
                      {formData.benefits}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4 pt-6">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                Previous
              </button>
            )}
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Next"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isAtLimit}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Publishing..." : "Publish Job"}
              </button>
            )}
          </div>
        </form>
      ) : null}
    </div>
  )
}

