"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Contact, ContactTag } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface AssignTagsModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
  onTagsUpdated: () => void
}

export function AssignTagsModal({ isOpen, onClose, contact, onTagsUpdated }: AssignTagsModalProps) {
  const [tags, setTags] = useState<ContactTag[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('id, name, color')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const toggleTag = async (tagId: string) => {
    if (!contact?.id || !tagId) {
      console.error('Missing required data:', { contactId: contact?.id, tagId })
      alert('Missing required data for tag operation')
      return
    }

    try {
      setLoading(true)
      
      const isTagged = contact.contact_tag_relations?.some(
        rel => rel.contact_tags.id === tagId
      )

      if (isTagged) {
        // Remove tag
        const { error: deleteError } = await supabase
          .from('contact_tag_relations')
          .delete()
          .eq('contact_id', contact.id)
          .eq('tag_id', tagId)

        if (deleteError) {
          console.error('Delete error:', deleteError)
          throw new Error(`Failed to remove tag: ${deleteError.message}`)
        }
      } else {
        // Add tag
        const { error: insertError } = await supabase
          .from('contact_tag_relations')
          .insert([{
            contact_id: contact.id,
            tag_id: tagId
          }])

        if (insertError) {
          console.error('Insert error:', insertError)
          throw new Error(`Failed to add tag: ${insertError.message}`)
        }
      }

      await onTagsUpdated()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Tag operation failed:', {
        error: err,
        message: errorMessage
      })
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[320px] bg-black border border-white/10 p-0">
        <DialogHeader className="px-4 py-3 border-b border-white/10">
          <DialogTitle className="text-sm font-medium text-white/90">Assign Tags</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="space-y-1">
            {tags.map((tag) => {
              const isTagged = contact.contact_tag_relations?.some(
                rel => rel.contact_tags.id === tag.id
              )

              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-white/10"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-white/90">{tag.name}</span>
                  </div>
                  {isTagged && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 