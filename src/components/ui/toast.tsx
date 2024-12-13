import { useState, useEffect } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(current => [...current, { id, message, type }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }

  return { toasts, addToast, removeToast }
} 