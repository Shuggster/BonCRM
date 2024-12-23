"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DeleteContactModalProps {
  contactId: string | null
  contactName: string | null
  isOpen: boolean
  onClose: () => void
  onContactDeleted: () => void
}

export function DeleteContactModal({ 
  contactId, 
  contactName, 
  isOpen, 
  onClose, 
  onContactDeleted 
}: DeleteContactModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !contactId) return null

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error

      onContactDeleted()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-white">Delete Contact</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}

        <p className="text-gray-300 mb-6">
          Are you sure you want to delete {contactName}? This action cannot be undone.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-md transition-colors"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
} 