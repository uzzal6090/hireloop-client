import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";
import { NavbarWrapper } from "@/components/navbar-wrapper"
import { ensureIndexesInitialized } from "@/lib/db/indexes"

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Initialize MongoDB indexes once per server runtime instance.
// Skipped during Next.js build phases; failures are logged but do not fail page rendering.
if (typeof window === "undefined" && !process.env.NEXT_PHASE?.includes("build")) {
  ensureIndexesInitialized().catch((err) => {
    console.error("Failed to initialize MongoDB indexes:", err)
  })
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased dark", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <NavbarWrapper />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
