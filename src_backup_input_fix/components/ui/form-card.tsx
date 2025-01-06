import { motion } from 'framer-motion'
import { Button } from './button'
import { ReactNode } from 'react'

interface FormCardProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  onCancel?: () => void
  width?: string
  showActions?: boolean
  isSubmitting?: boolean
  submitText?: string
  cancelText?: string
  className?: string
}

interface FormCardSectionProps {
  children: ReactNode
  title?: string
  icon?: ReactNode
  className?: string
}

export function FormCardSection({ children, title, icon, className = '' }: FormCardSectionProps) {
  return (
    <div className={`rounded-xl p-6 border border-white/[0.05] relative overflow-hidden ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export function FormCard({
  children,
  onSubmit,
  onCancel,
  width = "480px",
  showActions = true,
  isSubmitting = false,
  submitText = "Save Changes",
  cancelText = "Cancel",
  className = ''
}: FormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`h-full w-[${width}] rounded-3xl overflow-hidden bg-[#111111] ${className}`}
    >
      <div className="relative h-full">
        <div className="relative h-full z-10 overflow-y-auto no-scrollbar">
          <form onSubmit={onSubmit} className="space-y-6 p-6">
            {children}

            {showActions && (
              <div className="flex justify-end gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="ghost"
                    className="text-white/70 hover:text-white/90"
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05] hover:bg-zinc-800/50 text-white px-4 h-10 rounded-lg font-medium transition-colors"
                >
                  {isSubmitting ? 'Saving...' : submitText}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  )
}

// Input wrapper component for consistent styling
export function FormInput({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-white/70">{label}</label>}
      {children}
    </div>
  )
}

// Common styles for form inputs
export const formInputStyles = "bg-black border-white/10 focus:border-white/20" 