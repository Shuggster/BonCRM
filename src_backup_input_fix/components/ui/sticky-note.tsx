"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StickyNote, X } from "lucide-react"

interface Note {
  id: string
  content: string
  position: { x: number; y: number }
}

export default function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadNotes = () => {
      try {
        const savedNotes = localStorage.getItem('dashboard-notes')
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes)
          if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
            const validNotes = parsedNotes.filter(note => 
              note && 
              typeof note.id === 'string' && 
              typeof note.content === 'string' && 
              typeof note.position === 'object' &&
              typeof note.position.x === 'number' &&
              typeof note.position.y === 'number'
            )
            if (validNotes.length > 0) {
              setNotes(validNotes)
            } else {
              localStorage.removeItem('dashboard-notes')
            }
          } else {
            localStorage.removeItem('dashboard-notes')
          }
        }
      } catch (e) {
        console.error('Error loading notes:', e)
        localStorage.removeItem('dashboard-notes')
      }
    }
    loadNotes()
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('dashboard-notes', JSON.stringify(notes))
  }, [notes, mounted])

  const addNote = () => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768
    
    const newNote: Note = {
      id: Math.random().toString(36).substring(7),
      content: '',
      position: { 
        x: Math.max(20, Math.min(viewportWidth - 260, viewportWidth * 0.4)),
        y: Math.max(20, Math.min(viewportHeight - 280, viewportHeight * 0.3))
      }
    }
    setNotes([...notes, newNote])
    setIsEditing(newNote.id)
  }

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content } : note
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
    setIsEditing(null)
  }

  const handleNoteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setIsEditing(id)
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="fixed right-8 bottom-8 z-[100] pointer-events-auto">
        <button
          type="button"
          onClick={addNote}
          className="sticky-note-button flex items-center gap-2 p-4 rounded-lg shadow-lg cursor-pointer bg-yellow-200 hover:bg-yellow-300 transition-colors"
        >
          <StickyNote className="w-5 h-5 text-yellow-900" />
          <span className="font-indie-flower text-lg text-yellow-900">Add Note</span>
        </button>
      </div>

      <div className="pointer-events-auto">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              drag
              dragMomentum={false}
              dragElastic={0}
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                x: note.position.x,
                y: note.position.y
              }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              onDragEnd={(e: any) => {
                const element = e.target as HTMLElement
                const rect = element.getBoundingClientRect()
                setNotes(prevNotes => prevNotes.map(n => 
                  n.id === note.id 
                    ? { ...n, position: { x: rect.left, y: rect.top } }
                    : n
                ))
              }}
              className="sticky-note fixed w-[240px] min-h-[240px] p-4 rounded-lg cursor-move"
              style={{ zIndex: isEditing === note.id ? 50 : 10 }}
            >
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNote(note.id)
                }}
                className="absolute top-2 right-2 text-yellow-800/50 hover:text-yellow-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
              
              <div 
                className="w-full h-full pt-4"
                onClick={(e) => handleNoteClick(e, note.id)}
              >
                {isEditing === note.id ? (
                  <textarea
                    autoFocus
                    className="w-full h-full min-h-[180px] bg-transparent border-none focus:outline-none text-yellow-900 font-indie-flower text-lg leading-relaxed placeholder-yellow-700/30"
                    value={note.content}
                    onChange={(e) => {
                      e.stopPropagation()
                      updateNote(note.id, e.target.value)
                    }}
                    onBlur={() => setIsEditing(null)}
                    placeholder="Write your note here..."
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div 
                    className="w-full h-full text-yellow-900 whitespace-pre-wrap font-indie-flower text-lg leading-relaxed"
                  >
                    {note.content || "Click to add note..."}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
