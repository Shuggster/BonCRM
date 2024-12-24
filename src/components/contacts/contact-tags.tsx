"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ContactTagsProps {
  contactId?: string
  onTagsChange: (tags: string[]) => void
}

interface Tag {
  id: string
  name: string
  color: string
}

export function ContactTags({ contactId, onTagsChange }: ContactTagsProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTagInput, setShowTagInput] = useState(false)
  const [showTagSelect, setShowTagSelect] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3B82F6")

  useEffect(() => {
    if (contactId) {
      fetchTags()
    }
    fetchAvailableTags()
  }, [contactId])

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name')

      if (error) throw error
      setAvailableTags(data || [])
    } catch (err: any) {
      console.error('Error fetching available tags:', err)
      setError(err.message)
    }
  }

  const fetchTags = async () => {
    if (!contactId) return

    try {
      setLoading(true)
      setError(null)

      // Get contact's tags through the junction table
      const { data: relations, error: relationsError } = await supabase
        .from('contact_tag_relations')
        .select('tag_id')
        .eq('contact_id', contactId)

      if (relationsError) throw relationsError

      if (!relations?.length) {
        setTags([])
        return
      }

      // Get tag details
      const { data: tagDetails, error: tagsError } = await supabase
        .from('contact_tags')
        .select('id, name, color')
        .in('id', relations.map(r => r.tag_id))

      if (tagsError) throw tagsError

      setTags(tagDetails || [])
    } catch (err: any) {
      console.error('Error fetching tags:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addExistingTag = async (tag: Tag) => {
    try {
      setLoading(true)
      setError(null)

      if (contactId) {
        // Add relation to junction table
        const { error: relationError } = await supabase
          .from('contact_tag_relations')
          .insert({
            contact_id: contactId,
            tag_id: tag.id,
            created_at: new Date().toISOString()
          })

        if (relationError) throw relationError
      }

      const updatedTags = [...tags, tag]
      onTagsChange(updatedTags.map(t => t.id))
      setTags(updatedTags)
      setShowTagSelect(false)
    } catch (err: any) {
      console.error('Error adding tag:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTag = async () => {
    if (!newTagName.trim()) return

    try {
      setLoading(true)
      setError(null)

      // Create new tag
      const { data: newTag, error: createError } = await supabase
        .from('contact_tags')
        .insert([{ 
          name: newTagName.trim(), 
          color: newTagColor 
        }])
        .select('id, name, color')
        .single()

      if (createError) throw createError

      if (contactId) {
        // Add relation to junction table
        const { error: relationError } = await supabase
          .from('contact_tag_relations')
          .insert({
            contact_id: contactId,
            tag_id: newTag.id,
            created_at: new Date().toISOString()
          })

        if (relationError) throw relationError
      }

      const updatedTags = [...tags, newTag]
      onTagsChange(updatedTags.map(t => t.id))
      setTags(updatedTags)
      setAvailableTags([...availableTags, newTag])
      setShowTagInput(false)
      setNewTagName("")
    } catch (err: any) {
      console.error('Error creating tag:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeTag = async (tagId: string) => {
    try {
      setLoading(true)
      setError(null)

      if (contactId) {
        // Remove relation from junction table
        const { error: deleteError } = await supabase
          .from('contact_tag_relations')
          .delete()
          .eq('contact_id', contactId)
          .eq('tag_id', tagId)

        if (deleteError) throw deleteError
      }

      const updatedTags = tags.filter(t => t.id !== tagId)
      onTagsChange(updatedTags.map(t => t.id))
      setTags(updatedTags)
    } catch (err: any) {
      console.error('Error removing tag:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="w-4 h-4 rounded-full bg-gray-700 animate-pulse" />
        Loading tags...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm transition-colors"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="hover:opacity-75 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTagSelect(true)}
          className="h-7 px-2 border-dashed"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Tag
        </Button>
      </div>

      {showTagSelect && (
        <div className="space-y-2 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              {availableTags
                .filter(t => !tags.some(existingTag => existingTag.id === t.id))
                .map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => addExistingTag(tag)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm transition-colors hover:opacity-80"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                    <Plus className="h-3 w-3" />
                  </button>
                ))}
            </div>
            <div className="flex justify-between items-center border-t border-gray-700/50 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTagSelect(false)
                  setShowTagInput(true)
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Create New Tag
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagSelect(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTagInput && (
        <div className="space-y-2 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name..."
              className="flex-1 h-8 bg-[#1C2333] border-white/10 focus:border-blue-500"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-8 h-8 p-1 bg-[#1C2333] border border-white/10 rounded"
            />
            <Button
              onClick={createTag}
              disabled={loading || !newTagName.trim()}
              size="sm"
              className="h-8"
            >
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowTagInput(false)
                setNewTagName("")
              }}
              className="h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
