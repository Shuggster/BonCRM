"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Toast as ToastType } from "@/hooks/use-toast"

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
}

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 rounded-md p-4 shadow-lg",
      toast.type === 'success' && "bg-green-500 text-white",
      toast.type === 'error' && "bg-red-500 text-white",
      toast.type === 'default' && "bg-gray-800 text-white"
    )}>
      {toast.message}
      <button 
        onClick={() => onClose(toast.id)}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => children 