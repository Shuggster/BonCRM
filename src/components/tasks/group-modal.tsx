"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TaskGroup } from "@/lib/supabase/services/task-groups"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (group: Partial<TaskGroup>) => Promise<void>
  group?: TaskGroup
}

const colorOptions = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
]

export function GroupModal({ isOpen, onClose, onSave, group }: GroupModalProps) {
  const [name, setName] = useState(group?.name || '')
  const [color, setColor] = useState(group?.color || colorOptions[0].value)

  useEffect(() => {
    if (isOpen) {
      setName(group?.name || '')
      setColor(group?.color || colorOptions[0].value)
    }
  }, [isOpen, group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      name,
      color
    })
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {group ? 'Edit Group' : 'Create Group'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>Color</Label>
            <div className="grid grid-cols-7 gap-2">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    color === option.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setColor(option.value)}
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
      </DialogContent>
    </Dialog>
  )
} 