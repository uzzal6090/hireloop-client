
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import logoImage from "@/app/assest/logo.png"
import { authClient } from "@/lib/auth-client"

const RoleOption = ({ value, label, iconPath, checked, onChange }: {
  value: "admin" | "recruiter" | "seeker"
  label: string
  iconPath: string
  checked: boolean
  onChange: (v: "admin" | "recruiter" | "seeker") => void
}) => (
  <label
    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-medium transition-all ${
      checked
        ? "border-purple-500 bg-purple-500/10 text-white"
        : "border-white/10 text-gray-400 hover:border-purple-500/30 hover:text-white"
    }`}
  >
    <input
      type="radio"
      name="role"
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="hidden accent-purple-600"
    />
    <div className="flex flex-col items-center justify-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d={iconPath}></path>
      </svg>
      <span className="font-medium">{label}</span>
    </div>
  </label>
)

export default function SignUp() {
  const router = useRouter()

  const [passwordVisible, setPasswordVisible] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [successMessage, setSuccessMessage] = React.useState("")
  const [role, setRole] = React.useState<"admin" | "recruiter" | "seeker">("seeker")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setErrorMessage("")
    setSuccessMessage("")

    const formData = new FormData(e.currentTarget)

    const fullName = String(formData.get("fullName") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")

    if (fullName.length < 2) {
      setErrorMessage("Please enter your full name.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.")
      return
    }

    try {
      setIsLoading(true)

      const { data, error } = await (authClient.signUp.email as any)({
        name: fullName,
        email,
        password,
        callbackURL: "/",
        role,
      })

      if (error) {
        setErrorMessage(error.message || "Registration failed.")
        return
      }

      if (data) {
        setSuccessMessage("Account created successfully!")

        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrorMessage("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#0a0a0a] px-4 pt-20 pb-12 sm:pt-24 sm:pb-16">
      <div className="w-full max-w-[380px]">

        {/* Main Card */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-purple-500/20 bg-[#111111] px-6 py-7 shadow-[0_0_45px_rgba(139,92,246,0.12),0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-purple-500/35 sm:px-8 sm:py-8">

          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <Image
              src={logoImage}
              alt="HireLoop logo"
              width={36}
              height={36}
              className="h-10 w-auto object-contain"
            />

            
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create account
            </h1>

            <p className="mt-1.5 text-xs text-gray-400">
              Join HireLoop to find your dream job
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300"
              >
                Full name
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full rounded-full border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300"
              >
                Email address
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300"
              >
                Password
              </label>

              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>

                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-full border border-white/10 bg-[#0a0a0a]/60 py-3 pl-10 pr-11 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />

                {/* Toggle Password */}
                <button
                  type="button"
                  onClick={() => setPasswordVisible((prev) => !prev)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                >
                  {passwordVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.5 10.5 0 0 1 12 5c7 0 10 7 10 7a15 15 0 0 1-3.1 4.2M6.2 6.2C2.9 8.1 2 12 2 12s4 7 10 7a10 10 0 0 0 4-.8" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300"
              >
                I am a
              </label>

              <div className="grid grid-cols-3 gap-2">
                <RoleOption
                  value="admin"
                  label="Admin"
                  iconPath="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  checked={role === "admin"}
                  onChange={setRole}
                />
                <RoleOption
                  value="recruiter"
                  label="Recruiter"
                  iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7h6v6H9z"
                  checked={role === "recruiter"}
                  onChange={setRole}
                />
                <RoleOption
                  value="seeker"
                  label="Seeker"
                  iconPath="M22 7L10 13L2 7"
                  checked={role === "seeker"}
                  onChange={setRole}
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p role="alert" className="text-center text-xs text-red-400">
                {errorMessage}
              </p>
            )}

            {/* Success Message */}
            {successMessage && (
              <p role="status" className="text-center text-xs text-green-400">
                {successMessage}
              </p>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?

              <Link
                href="/signin"
                className="ml-1.5 font-semibold text-purple-400 transition-colors hover:text-purple-300"
              >
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
