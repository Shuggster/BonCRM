"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Pencil, Trash2, Save, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Note {
  id: string
  content: string
  created_at: string
  updated_at: string
}

interface ContactNotesProps {
  contactId: string
}

export function ContactNotes({ contactId }: ContactNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { session } = useAuth()

  useEffect(() => {
    fetchNotes()
  }, [contactId])

  const fetchNotes = async () => {
    try {
      console.log('Fetching notes for contact:', contactId) // Debug log
      const { data, error } = await supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notes:', error)
        throw error
      }
      
      console.log('Fetched notes:', data) // Debug log
      setNotes(data || [])
    } catch (err: any) {
      console.error('Error in fetchNotes:', err)
      setError(err.message)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('contact_notes')
        .insert([{
          contact_id: contactId,
          content: newNote,
          user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000' // Use actual user ID if available
        }])

      if (error) throw error

      setNewNote("")
      fetchNotes()
    } catch (err: any) {
      console.error('Error adding note:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateNote = async (noteId: string) => {
    if (!editContent.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('contact_notes')
        .update({ content: editContent, updated_at: new Date().toISOString() })
        .eq('id', noteId)

      if (error) throw error

      setEditingNoteId(null)
      fetchNotes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('contact_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      fetchNotes()
    } catch (err: any) {
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

      <div className="space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          onClick={addNote}
          disabled={loading || !newNote.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-md transition-colors"
        >
          {loading ? "Adding..." : "Add Note"}
        </button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No notes yet</p>
            <p className="text-sm mt-1">Add a note to keep track of important information</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-700/50 rounded-lg">
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNote(note.id)}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white whitespace-pre-wrap">{note.content}</p>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id)
                          setEditContent(note.content)
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(note.created_at).toLocaleString()}
                    {note.updated_at !== note.created_at && " (edited)"}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 