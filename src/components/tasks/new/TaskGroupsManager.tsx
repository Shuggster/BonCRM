import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import type { TaskGroup } from '@/types/tasks'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface TaskGroupsManagerProps {
  taskGroups: TaskGroup[]
  onGroupsChange: () => void
}

export function TaskGroupsManager({ taskGroups, onGroupsChange }: TaskGroupsManagerProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#71717a')
  const supabase = createClientComponentClient()

  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#ec4899', // pink
  ]

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    try {
      const { data: newGroup, error } = await supabase
        .from('task_groups')
        .insert([{
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          color: selectedColor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setNewGroupName('')
      setNewGroupDescription('')
      setSelectedColor('#71717a')
      onGroupsChange()
    } catch (error) {
      console.error('Error creating task group:', error)
    }
  }

  const handleUpdateGroup = async (groupId: string, newName: string, newDescription?: string) => {
    try {
      const updateData: any = {
        name: newName.trim(),
        updated_at: new Date().toISOString()
      }
      
      if (newDescription !== undefined) {
        updateData.description = newDescription.trim() || null
      }

      const { error } = await supabase
        .from('task_groups')
        .update(updateData)
        .eq('id', groupId)

      if (error) throw error

      setIsEditing(null)
      onGroupsChange()
    } catch (error) {
      console.error('Error updating task group:', error)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? Tasks in this group will become ungrouped.')) {
      return
    }

    try {
      // First update all tasks in this group to have no group
      await supabase
        .from('tasks')
        .update({ task_group_id: null })
        .eq('task_group_id', groupId)

      // Then delete the group
      const { error } = await supabase
        .from('task_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      onGroupsChange()
    } catch (error) {
      console.error('Error deleting task group:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name..."
          className="flex-1"
        />
        <Textarea
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
          placeholder="Group description (optional)..."
          className="flex-1"
          rows={3}
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
            className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Group
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {taskGroups.map(group => (
          <div
            key={group.id}
            className="flex flex-col gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-white/[0.08]"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              {isEditing === group.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    defaultValue={group.name}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const description = (e.currentTarget.parentElement?.querySelector('[data-description-input]') as HTMLTextAreaElement)?.value
                        handleUpdateGroup(group.id, e.currentTarget.value, description)
                      } else if (e.key === 'Escape') {
                        setIsEditing(null)
                      }
                    }}
                  />
                  <Textarea
                    data-description-input
                    defaultValue={group.description || ''}
                    placeholder="Group description (optional)..."
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        const name = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)?.value
                        handleUpdateGroup(group.id, name, e.currentTarget.value)
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const name = (e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement)?.value
                        const description = (e.currentTarget.parentElement?.parentElement?.querySelector('[data-description-input]') as HTMLTextAreaElement)?.value
                        handleUpdateGroup(group.id, name, description)
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-zinc-400 mt-1">{group.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsEditing(group.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 