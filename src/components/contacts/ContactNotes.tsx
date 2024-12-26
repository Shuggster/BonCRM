'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"

interface Note {
  id: string
  content: string
  created_at: string
  user_id: string
}

interface ContactNotesProps {
  contactId: string
}

export function ContactNotes({ contactId }: ContactNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchNotes()
  }, [contactId])

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('contact_notes')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return
    }

    setNotes(data || [])
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('contact_notes')
        .insert([{
          contact_id: contactId,
          content: newNote.trim()
        }])

      if (error) throw error

      setNewNote('')
      await fetchNotes()
    } catch (err) {
      console.error('Error adding note:', err)
      alert('Failed to add note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/90">Notes</h3>
        </div>
        <div className="space-y-2">
          <textarea 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full h-24 px-3 py-2 text-white bg-black/40 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
            placeholder="Add a note..."
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={addNote}
            disabled={loading || !newNote.trim()}
          >
            Add Note
          </Button>
        </div>
      </div>

      {/* Existing Notes */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="p-3 rounded-lg bg-white/[0.03] space-y-2"
          >
            <p className="text-white/90 text-sm">{note.content}</p>
            <div className="text-xs text-white/40">
              {new Date(note.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-sm text-white/40 text-center py-2">
            No notes yet
          </div>
        )}
      </div>
    </div>
  )
} 