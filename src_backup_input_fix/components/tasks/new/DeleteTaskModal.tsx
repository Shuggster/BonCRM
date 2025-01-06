import { useState } from 'react'
import { X } from 'lucide-react'

interface DeleteTaskModalProps {
  taskId: string
  taskTitle: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteTaskModal({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onConfirm
}: DeleteTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !taskId) return null

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (err: any) {
      console.error('Error deleting task:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Delete Task</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400">
            {error}
          </div>
        )}

        <p className="text-zinc-400 mb-6">
          Are you sure you want to delete "{taskTitle}"? This action cannot be undone.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
} 