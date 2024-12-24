export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'default'
  duration: number
} 