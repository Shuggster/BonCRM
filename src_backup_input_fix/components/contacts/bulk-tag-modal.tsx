"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Tag } from "lucide-react"

interface BulkTagModalProps {
  isOpen: boolean
  onClose: () => void
  selectedContactIds: string[]
  existingTags: Array<{ id: string; name: string; color: string; count?: number }>
  onComplete: () => void
}

export function BulkTagModal({
  isOpen,
  onClose,
  selectedContactIds,
  existingTags,
  onComplete,
}: BulkTagModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (selectedTags.length === 0) return

    setLoading(true)
    try {
      // Get the current contacts
      const { data: contacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id, tags')
        .in('id', selectedContactIds)

      if (fetchError) throw fetchError

      // Update each contact's tags
      for (const contact of contacts) {
        let newTags = [...(contact.tags || [])]
        
        if (mode === 'add') {
          // Add new tags that don't exist
          selectedTags.forEach(tagId => {
            if (!newTags.includes(tagId)) {
              newTags.push(tagId)
            }
          })
        } else {
          // Remove selected tags
          newTags = newTags.filter(tagId => !selectedTags.includes(tagId))
        }

        const { error: updateError } = await supabase
          .from('contacts')
          .update({ tags: newTags })
          .eq('id', contact.id)

        if (updateError) throw updateError
      }

      onComplete()
      onClose()
    } catch (error: any) {
      console.error('Error:', error.message || error)
      alert('Failed to update tags: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {mode === 'add' ? 'Add Tags' : 'Remove Tags'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 px-3 py-2 rounded ${
                mode === 'add' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Add Tags
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`flex-1 px-3 py-2 rounded ${
                mode === 'remove' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Remove Tags
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {existingTags.map(tag => (
              <label
                key={tag.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag.id)
                        ? prev.filter(t => t !== tag.id)
                        : [...prev, tag.id]
                    )
                  }}
                  className="h-4 w-4 rounded border-gray-600"
                />
                <span
                  className="flex-1 px-2 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
                {tag.count !== undefined && (
                  <span className="text-xs text-gray-400">
                    {tag.count}
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedTags.length === 0 || loading}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : mode === 'add' ? 'Add Tags' : 'Remove Tags'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 