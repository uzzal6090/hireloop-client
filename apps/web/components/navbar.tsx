"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import logoImage from "@/app/assest/logo.png"
import { Button } from "@workspace/ui/components/button"

const navbarLinks = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/company", label: "Company" },
  { href: "/pricing", label: "Pricing" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0a]/60">
      <div className="relative h-20 px-4 lg:px-8">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 10%, #2a2a2a 15%, #1a1a1a 20%, #1a1a1a 30%, #2a2a2a 35%, #1a1a1a 40%, #1a1a1a 50%, #2a2a2a 55%, #1a1a1a 60%, #1a1a1a 70%, #2a2a2a 75%, #1a1a1a 80%, #1a1a1a 90%, #2a2a2a 95%, #1a1a1a 100%)",
          }}
        />
        <div className="relative flex h-full items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <Link href="/" className="flex items-center">
              <Image
                src={logoImage}
                alt="hireloop logo"
                width={40}
                height={40}
                className="h-9 w-auto lg:h-11 lg:w-auto"
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-gray-700 mx-2" />
            <Link
              href="/signin"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Button
              className="ml-2 px-6 py-2.5 text-sm font-medium rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-indigo-500/30 transition-all"
            >
              Get Started
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="rounded-full p-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
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

      {isOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0a0a0a]">
          <div className="px-4 py-4 space-y-2">
            {navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-4 bg-gray-700 mx-4" />
            <Link
              href="/signin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Button
              className="w-full px-4 py-2.5 text-sm font-medium rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
