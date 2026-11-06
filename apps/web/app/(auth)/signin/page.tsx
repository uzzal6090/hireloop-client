
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import logoImage from "@/app/assest/logo.png"
import { authClient } from "@/lib/auth-client"

export default function SignIn() {
  const [passwordVisible, setPasswordVisible] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData.entries())

      await authClient.signIn.email({
        email: data.email as string,
        password: data.password as string,
        callbackURL: "/",
      })

      setLoading(false)
      router.push("/")
    } catch (err: unknown) {
      setLoading(false)
      const message =
        err instanceof Error ? err.message : "Sign in failed. Please try again."
      setError(message)
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
              Welcome back
            </h1>

            <p className="mt-1.5 text-xs text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

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
                  minLength={6}
                  autoComplete="current-password"
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-gray-400">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked
                  className="accent-purple-600"
                />
                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-purple-400 transition-colors hover:text-purple-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 active:translate-y-0 ${
                loading
                  ? "bg-gradient-to-r from-gray-600 via-gray-600 to-gray-600 hover:shadow-purple-500/20 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:-translate-y-0.5 hover:shadow-purple-500/30"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?

              <Link
                href="/signup"
                className="ml-1.5 font-semibold text-purple-400 transition-colors hover:text-purple-300"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
