"use client"

import * as React from "react"
import type { ToastManagerAddOptions } from "@base-ui/react/toast"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"
import { AlertCircle, CheckCircle } from "lucide-react"

type ToastType = "default" | "success" | "error"

const DEFAULT_TIMEOUT = 4000

function ToastProvider({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Provider>) {
  return (
    <ToastPrimitive.Provider timeout={DEFAULT_TIMEOUT} limit={4} {...props}>
      {children}
    </ToastPrimitive.Provider>
  )
}

function ToastIcon({ type }: { type?: ToastType }) {
  if (type === "success") return <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
  if (type === "error") return <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
  return <AlertCircle className="h-5 w-5 shrink-0 text-gray-400" />
}

function toastTypeStyle(type?: ToastType) {
  if (type === "success") return "border-emerald-500/30 text-emerald-400"
  if (type === "error") return "border-red-500/30 text-red-400"
  return "border-white/10 text-white"
}

function ToastItem({ toast }: { toast: ToastPrimitive.Root.Props["toast"] }) {
  const type = (toast.type as ToastType | undefined) ?? "default"
  const titleColor = toastTypeStyle(type)

  return (
    <ToastPrimitive.Root
      toast={toast}
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-xl border bg-white/5 bg-clip-padding p-4 text-sm shadow-xl transition-all data-[state=starting]:animate-in data-[state=starting]:fade-in data-[state=starting]:slide-in-from-top-4 data-[state=ending]:animate-out data-[state=ending]:fade-out data-[state=ending]:slide-out-to-top-4",
        toastTypeStyle(type)
      )}
    >
      <ToastPrimitive.Content className="flex items-center gap-3 w-full min-w-0">
        <ToastIcon type={type} />
        <div className="flex flex-col leading-tight">
          {toast.title && (
            <ToastPrimitive.Title className={cn("font-medium leading-none", titleColor)}>
              {toast.title}
            </ToastPrimitive.Title>
          )}
          {toast.description && (
            <ToastPrimitive.Description className="text-xs text-gray-400 leading-relaxed truncate">
              {toast.description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close className="ml-auto shrink-0 text-gray-400 hover:text-white transition-colors" />
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  )
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  const { toasts } = ToastPrimitive.useToastManager()
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-5 right-5 z-[60] flex flex-col gap-2 w-80 pointer-events-none",
        className
      )}
      {...props}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </ToastPrimitive.Viewport>
  )
}

export function useToast() {
  const { add, close } = ToastPrimitive.useToastManager()
  const toast = React.useCallback(
    (options: ToastManagerAddOptions<object>) => {
      return add(options)
    },
    [add]
  )
  return { toast, dismiss: close }
}

export { ToastProvider, ToastViewport }
