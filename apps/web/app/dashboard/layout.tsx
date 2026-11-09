import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { DashboardSidebar } from "../components/DashboardSidebar"
import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-sidebar">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center border-b border-white/10 bg-sidebar/80 backdrop-blur px-4 gap-3">
            <SidebarTrigger className="text-gray-400 hover:text-white transition-colors" />
            <div className="h-5 w-px bg-white/10" />
            <span className="text-sm text-gray-500 font-medium">HireLoop Dashboard</span>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
