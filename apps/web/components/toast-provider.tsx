"use client"

import type { ReactNode } from "react"
import { ToastProvider, ToastViewport } from "@workspace/ui/components/toast"

export function ToastProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ToastViewport />
      {children}
    </ToastProvider>
  )
}
