"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, X } from "lucide-react"
import { logActivity } from "@/lib/activity-logger"

interface Tag {
  id: string
  name: string
  color: string
}

interface ContactTagsProps {
  contactId: string
  onTagsChange?: () => void
}

export function ContactTags({ contactId, onTagsChange }: ContactTagsProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3B82F6")

  useEffect(() => {
    fetchTags()
    fetchAvailableTags()
  }, [contactId])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tag_relations')
        .select(`
          tag_id,
          contact_tags (
            id,
            tag_name,
            color
          )
        `)
        .eq('contact_id', contactId)

      if (error) throw error

      setTags(data.map(item => ({
        id: item.contact_tags.id,
        name: item.contact_tags.tag_name,
        color: item.contact_tags.color
      })))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('id, tag_name, color')
        .order('tag_name')

      if (error) throw error

      setAvailableTags(data.map(tag => ({
        id: tag.id,
        name: tag.tag_name,
        color: tag.color
      })))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const addTag = async (tagId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('contact_tag_relations')
        .insert([{ contact_id: contactId, tag_id: tagId }])

      if (error) throw error

      const tagName = availableTags.find(t => t.id === tagId)?.name

      await logActivity(
        contactId,
        'tag_added',
        `Added tag: ${tagName}`,
        { tagId, tagName }
      )

      fetchTags()
      onTagsChange?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeTag = async (tagId: string) => {
    setLoading(true)
    try {
      const tagName = tags.find(t => t.id === tagId)?.name

      const { error } = await supabase
        .from('contact_tag_relations')
        .delete()
        .eq('contact_id', contactId)
        .eq('tag_id', tagId)

      if (error) throw error

      await logActivity(
        contactId,
        'tag_removed',
        `Removed tag: ${tagName}`,
        { tagId, tagName }
      )

      fetchTags()
      onTagsChange?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTag = async () => {
    if (!newTagName.trim()) return
    setLoading(true)
    try {
      // First check if tag already exists
      const { data: existingTag, error: searchError } = await supabase
        .from('contact_tags')
        .select('id')
        .ilike('tag_name', newTagName.trim())
        .single()

      let tagId;
      
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create new tag if it doesn't exist
        const { data: newTag, error: createError } = await supabase
          .from('contact_tags')
          .insert([{ 
            tag_name: newTagName.trim(), 
            color: newTagColor 
          }])
          .select()
          .single()

        if (createError) throw createError
        tagId = newTag.id;
      }

      // Create the relation
      const { error: relationError } = await supabase
        .from('contact_tag_relations')
        .insert([{ contact_id: contactId, tag_id: tagId }])

      if (relationError) throw relationError

      await logActivity(
        contactId,
        'tag_added',
        `Added tag: ${newTagName.trim()}`
      )

      setNewTagName("")
      setShowTagInput(false)
      await fetchTags()
      await fetchAvailableTags()
      onTagsChange?.()
    } catch (err: any) {
      console.error('Error creating tag:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="hover:opacity-75"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setShowTagInput(true)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          <Plus className="h-3 w-3" />
          Add Tag
        </button>
      </div>

      {showTagInput && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name..."
              className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="p-1 bg-gray-700 border border-gray-600 rounded"
            />
            <button
              onClick={createTag}
              disabled={loading || !newTagName.trim()}
              className="px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowTagInput(false)
                setNewTagName("")
              }}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
