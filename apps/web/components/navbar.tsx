"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import logoImage from "@/app/assest/logo.png"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { signOut, useSession } from "@/lib/auth-client"
import { LogOut, Mail, ChevronDown } from "lucide-react"

const navbarLinks = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/company", label: "Company" },
  { href: "/pricing", label: "Pricing" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = React.useState(false)

  const userMenuTriggerRef = React.useRef<HTMLButtonElement>(null)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const user = session?.user

  // Close dropdowns on route change
  React.useEffect(() => {
    setIsUserMenuOpen(false)
    setIsMobileUserMenuOpen(false)
  }, [pathname])

  // Click outside to close desktop user dropdown
  const handleClickOutside = React.useCallback(
    (event: MouseEvent) => {
      if (
        userMenuTriggerRef.current &&
        !userMenuTriggerRef.current.contains(event.target as Node)
      ) {
        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(event.target as Node)
        ) {
          setIsUserMenuOpen(false)
        }
      }
    },
    []
  )

  // Escape key to close dropdowns
  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false)
        setIsMobileUserMenuOpen(false)
      }
    },
    []
  )

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleClickOutside, handleKeyDown])

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    setIsMobileUserMenuOpen(false)
    try {
      await signOut()
    } catch (err) {
      console.error("Sign out failed:", err)
    }
    router.push("/")
  }

  const renderAvatar = (size: "sm" | "lg" = "sm") => {
    if (!user) return null
    const isLg = size === "lg"
    const classes = cn(
      "rounded-full object-cover",
      isLg ? "h-10 w-10" : "h-9 w-9"
    )
    const fallbackClasses = cn(
      "flex items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white",
      isLg ? "h-10 w-10 shrink-0" : "h-9 w-9"
    )
    const label = user.name || "User"

    if (user.image) {
      return (
        <Image
          src={user.image}
          alt={label}
          width={isLg ? 40 : 36}
          height={isLg ? 40 : 36}
          className={classes}
          unoptimized
        />
      )
    }
    return (
      <div className={fallbackClasses}>
        {user.name?.charAt(0).toUpperCase() || "U"}
      </div>
    )
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="relative w-full border-b border-white/10 bg-[#171717]/75 backdrop-blur-md">

        {/* Subtle Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 10%, #2a2a2a 15%, #1a1a1a 20%, #1a1a1a 30%, #2a2a2a 35%, #1a1a1a 40%, #1a1a1a 50%, #2a2a2a 55%, #1a1a1a 60%, #1a1a1a 70%, #2a2a2a 75%, #1a1a1a 80%, #1a1a1a 90%, #2a2a2a 95%, #1a1a1a 100%)",
          }}
        />

        {/* Navbar Content */}
        <div className="relative mx-auto w-full px-5 sm:px-8 lg:px-12">
          <div className="flex h-20 w-full items-center justify-between">

            {/* Logo */}
            <div className="flex h-full shrink-0 items-center">
              <Link href="/" className="inline-flex h-full items-center">
                <Image
                  src={logoImage}
                  alt="HireLoop Logo"
                  width={40}
                  height={40}
                  priority
                  className="block h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden h-full items-center lg:flex">

              <div className="flex h-full items-center gap-8">
                {navbarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex h-full items-center text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mx-7 h-5 w-px shrink-0 bg-gray-600/70" />

              {/* Guest Actions */}
              {!user ? (
                <div className="flex h-full items-center gap-5">
                  <Link
                    href="/signin"
                    className="inline-flex h-full items-center text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  >
                    Sign In
                  </Link>

                  <Link href="/signup" className="inline-flex items-center">
                    <Button
                      className="h-11 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    ref={userMenuTriggerRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsUserMenuOpen((prev) => !prev)
                    }}
                    className="flex h-full items-center gap-3"
                    aria-label="User profile menu"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    {renderAvatar("sm")}

                    <span className="max-w-32 truncate text-sm font-medium text-white">
                      {user.name}
                    </span>

                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                        isUserMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Desktop User Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      ref={userMenuRef}
                      className={cn(
                        "absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#171717]/95 backdrop-blur-md shadow-2xl p-2 z-50 text-left",
                        "transition-all duration-200 ease-out"
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        {/* User Info Header */}
                        <div className="flex items-center gap-3 px-3 py-2">
                          {renderAvatar("lg")}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white leading-tight">
                              {user.name}
                            </p>
                            {user.email && (
                              <p className="text-xs text-gray-400 truncate leading-none">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="my-1.5 h-px w-full bg-white/10" />

                        {/* Sign Out */}
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors active:bg-white/5"
                          aria-label="Sign out"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex h-full items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="relative border-t border-white/10 bg-[#171717]/95 backdrop-blur-md lg:hidden">
            <div className="space-y-2 px-5 py-4 sm:px-8">

              {navbarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px w-full bg-white/10" />

              {!user ? (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full"
                  >
                    <Button
                      className="h-11 w-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/30"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMobileUserMenuOpen((prev) => !prev)
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="User profile menu"
                    aria-expanded={isMobileUserMenuOpen}
                  >
                    {renderAvatar("lg")}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-medium text-white">
                        {user.name}
                      </span>
                      {user.email && (
                        <p className="block truncate text-xs text-gray-400 leading-none">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                        isMobileUserMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isMobileUserMenuOpen && (
                    <div className="px-3 py-2">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors active:bg-red-500/20"
                        aria-label="Sign out"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
