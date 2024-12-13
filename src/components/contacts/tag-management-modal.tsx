"use client"

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2 } from 'lucide-react'
import { supabase, refreshSupabaseClient } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Tag {
  id: string
  name: string
  color: string
}

interface TagManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onTagsUpdated: () => void
}

export function TagManagementModal({ isOpen, onClose, onTagsUpdated }: TagManagementModalProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('*')
        .order('name')

      if (error) {
        console.error('Failed to fetch tags:', error.message)
        return
      }

      setTags(data || [])
    } catch (err) {
      console.error('Unexpected error fetching tags:', err)
    }
  }

  const handleCreateTag = async (tagData: { name: string; color: string }) => {
    setLoading(true)
    try {
      if (!tagData.name.trim()) {
        console.error('Tag name is required')
        return
      }

      // Simple insert without select
      const { error } = await supabase
        .from('contact_tags')
        .insert({
          name: tagData.name.trim(),
          color: tagData.color
        })

      if (error) {
        // Simple error logging
        console.error('Failed to create tag:', error.message)
        return
      }

      // Success - clear form and refresh
      setNewTagName('')
      setNewTagColor('#3B82F6')
      await fetchTags()
      onTagsUpdated()
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('contact_tags')
        .update({
          name: editingTag.name.trim(),
          color: editingTag.color
        })
        .eq('id', editingTag.id)

      if (error) throw error

      setEditingTag(null)
      fetchTags()
      onTagsUpdated()
    } catch (error) {
      console.error('Error updating tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all contacts.')) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('contact_tags')
        .delete()
        .eq('id', tagId)

      if (error) throw error

      fetchTags()
      onTagsUpdated()
    } catch (error) {
      console.error('Error deleting tag:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Create, edit, and delete tags for your contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Create new tag */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newTagName">New Tag Name</Label>
              <div className="flex gap-2">
                <Input
                  id="newTagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-10 w-10 rounded border border-input bg-background p-1"
                />
              </div>
            </div>
            <Button
              onClick={() => handleCreateTag({ name: newTagName, color: newTagColor })}
              disabled={loading || !newTagName.trim()}
              className="self-end"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing tags */}
          <div className="space-y-2">
            <Label>Existing Tags</Label>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 rounded-md border border-input p-2"
                >
                  {editingTag?.id === tag.id ? (
                    <>
                      <Input
                        value={editingTag.name}
                        onChange={(e) =>
                          setEditingTag({ ...editingTag, name: e.target.value })
                        }
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={editingTag.color}
                        onChange={(e) =>
                          setEditingTag({ ...editingTag, color: e.target.value })
                        }
                        className="h-8 w-8 rounded border border-input bg-background p-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpdateTag}
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTag(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1">{tag.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTag(tag)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
