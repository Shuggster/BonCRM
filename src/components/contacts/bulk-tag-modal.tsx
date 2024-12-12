"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Tag } from "lucide-react"

interface BulkTagModalProps {
  isOpen: boolean
  onClose: () => void
  selectedContactIds: string[]
  existingTags: Array<{ id: string; name: string; color: string }>
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
      if (mode === 'add') {
        // Create new tag relations
        const relations = selectedContactIds.flatMap(contactId =>
          selectedTags.map(tagId => ({
            contact_id: contactId,
            tag_id: tagId
          }))
        )
        
        const { error } = await supabase
          .from('contact_tag_relations')
          .upsert(relations, { onConflict: 'contact_id,tag_id' })
        
        if (error) throw error
      } else {
        // Remove tag relations
        const { error } = await supabase
          .from('contact_tag_relations')
          .delete()
          .in('contact_id', selectedContactIds)
          .in('tag_id', selectedTags)
        
        if (error) throw error
      }

      onComplete()
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'Add Tags' : 'Remove Tags'}
          </h2>
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

          <div className="space-y-2">
            {existingTags.map(tag => (
              <label
                key={tag.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    setSelectedTags(prev =>
                      e.target.checked
                        ? [...prev, tag.id]
                        : prev.filter(id => id !== tag.id)
                    )
                  }}
                  className="rounded border-gray-600"
                />
                <span
                  className="px-2 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: tag.color + '20',
                    color: tag.color 
                  }}
                >
                  {tag.name}
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedTags.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 