'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { TaskFormProvider, useTaskForm, type TaskFormData } from './TaskFormContext'
import type { Task } from '@/types/tasks'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<TaskFormData>
}

interface TaskFormSectionsProps {
  onCancel: () => void
}

function TopSection() {
  const { formData, updateField } = useTaskForm()
  
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Enter task title"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Enter task description"
        />
      </div>
    </div>
  )
}

function BottomSection({ onCancel }: TaskFormSectionsProps) {
  const { formData, updateField, handleSubmit, isSubmitting, error } = useTaskForm()
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map((priority) => (
              <Button
                key={priority}
                type="button"
                variant={formData.priority === priority ? 'default' : 'outline'}
                onClick={() => updateField('priority', priority)}
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.due_date ? format(new Date(formData.due_date), 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.due_date ? new Date(formData.due_date) : undefined}
                onSelect={(date) => updateField('due_date', date?.toISOString() || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

export function SimpleTaskForm(props: TaskFormProps) {
  return (
    <TaskFormProvider onSubmit={props.onSubmit} initialData={props.initialData}>
      <div className="h-full">
        <TopSection />
        <BottomSection onCancel={props.onCancel} />
      </div>
    </TaskFormProvider>
  )
}

export function useTaskFormSections({ onCancel }: TaskFormSectionsProps) {
  return {
    TopSection,
    BottomSection: () => <BottomSection onCancel={onCancel} />
  }
} 