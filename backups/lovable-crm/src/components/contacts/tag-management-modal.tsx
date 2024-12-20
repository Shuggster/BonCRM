"use client"

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
  const [loading, setLoading] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3B82F6")
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name')

      if (error) {
        console.error('Failed to fetch tags:', error.message)
        return
      }

      setTags(data || [])
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const createTag = async () => {
    if (!newTagName.trim() || !newTagColor) return

    try {
      const { error } = await supabase
        .from('tags')
        .insert([
          { 
            name: newTagName.trim(),
            color: newTagColor
          }
        ])

      if (error) throw error

      setNewTagName('')
      setNewTagColor('#3B82F6')
      fetchTags()
      onTagsUpdated()
    } catch (err) {
      console.error('Error creating tag:', err)
      if (err instanceof Error) {
        console.error('Error message:', err.message)
      }
    }
  }

  const updateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('tags')
        .update({ 
          name: editingTag.name.trim(),
          color: editingTag.color
        })
        .eq('id', editingTag.id)

      if (error) throw error

      setEditingTag(null)
      fetchTags()
      onTagsUpdated()
    } catch (err) {
      console.error('Error updating tag:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteTag = async (tagId: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (error) throw error

      fetchTags()
      onTagsUpdated()
    } catch (err) {
      console.error('Error deleting tag:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Create and manage tags for your contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create new tag */}
          <div className="space-y-4">
            <Label>Create New Tag</Label>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                className="flex-1"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="p-1 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
            <Button
              onClick={createTag}
              disabled={loading || !newTagName.trim()}
              className="self-end"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </Button>
          </div>

          {/* List existing tags */}
          <div className="space-y-4">
            <Label>Existing Tags</Label>
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2">
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
                        className="p-1 bg-gray-700 border border-gray-600 rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={updateTag}
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
                        onClick={() => deleteTag(tag.id)}
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
