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
import { Input } from "@/components/ui/input"
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
        .from('contact_tags')
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
        .from('contact_tags')
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
        .from('contact_tags')
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
      <DialogContent className="w-[320px] bg-black border border-white/10 p-0">
        <DialogHeader className="px-4 py-3 border-b border-white/10">
          <DialogTitle className="text-sm font-medium text-white/90">Manage Tags</DialogTitle>
          <DialogDescription className="text-xs text-white/40">
            Create and manage tags for your contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Create new tag */}
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="flex-1 h-9 text-sm bg-black border-white/10 focus:border-blue-500"
            />
            <div className="relative">
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-9 h-9 p-1 bg-black border border-white/10 rounded-md cursor-pointer"
              />
            </div>
            <Button
              onClick={createTag}
              disabled={loading || !newTagName.trim()}
              className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List existing tags */}
          <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
            {tags.map((tag) => (
              <div 
                key={tag.id} 
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-black border border-white/10 hover:border-white/20 transition-colors"
              >
                {editingTag?.id === tag.id ? (
                  <>
                    <Input
                      value={editingTag.name}
                      onChange={(e) =>
                        setEditingTag({ ...editingTag, name: e.target.value })
                      }
                      className="flex-1 h-7 text-sm bg-black border-white/10 focus:border-blue-500"
                    />
                    <input
                      type="color"
                      value={editingTag.color}
                      onChange={(e) =>
                        setEditingTag({ ...editingTag, color: e.target.value })
                      }
                      className="w-7 h-7 p-1 bg-black border border-white/10 rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={updateTag}
                      disabled={loading}
                      className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTag(null)}
                      className="h-7 px-2 text-xs text-white/40 hover:text-white/60 hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm text-white/90">{tag.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTag(tag)}
                      className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-white/5"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTag(tag.id)}
                      disabled={loading}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-white/5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
