// TEST COMMENT - MODAL 3
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { cn } from "@/lib/utils"

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (group: Partial<TaskGroup>) => void
  group?: TaskGroup
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#F97316', // Orange
  '#22C55E', // Green
  '#6366F1', // Indigo
  '#A855F7', // Purple
  '#F43F5E', // Red
  '#14B8A6', // Teal
]

export function GroupModal({ isOpen, onClose, onSave, group }: GroupModalProps) {
  const [name, setName] = useState(group?.name || '')
  const [description, setDescription] = useState(group?.description || '')
  const [color, setColor] = useState(group?.color || predefinedColors[0])

  // Reset form when group changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(group?.name || '')
      setDescription(group?.description || '')
      setColor(group?.color || predefinedColors[0])
    }
  }, [isOpen, group])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      color
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-background p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{group ? 'Edit Group' : 'Create Group'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group description..."
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    color === c && "ring-2 ring-ring ring-offset-2 scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {group ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 