'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { TaskFormProvider, useTaskForm } from './TaskFormContext'
import type { Task } from '@/types/tasks'

interface QuickAddTaskProps {
  section: 'upper' | 'lower'
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  initialData?: Task
}

function TaskFormContent({ section = 'upper', initialData }: QuickAddTaskProps) {
  const { 
    formData, 
    updateField, 
    error,
    isSubmitting,
    handleSubmit,
    onClose,
    isFormActive 
  } = useTaskForm()

  return (
    <form onSubmit={handleSubmit} className={`relative ${!isFormActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {section === 'upper' ? (
        <div className={`relative rounded-t-2xl overflow-hidden transition-all duration-500 bg-card border-b border-white/[0.05] ${!isFormActive ? 'filter blur-[2px]' : ''}`}>
          <div className="p-6 pointer-events-auto">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
                <CheckSquare className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-white">
                  {initialData ? 'Edit Task' : 'Create New Task'}
                </h2>
                <p className="text-white/70 mt-1">
                  {initialData ? 'Update task details' : 'Add a new task to your list'}
                </p>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <div className="space-y-3">
                <Label className="text-sm text-white/70 flex items-center gap-2">
                  Title
                  <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className={`w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/20 ${!isFormActive ? 'opacity-50' : ''}`}
                  placeholder="Enter task title"
                  disabled={!isFormActive}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm text-white/70">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={`min-h-[100px] w-full rounded-md border bg-black px-4 py-3 text-sm shadow-sm placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-white/10 focus:border-white/20 ${!isFormActive ? 'opacity-50' : ''}`}
                  placeholder="Enter task description"
                  disabled={!isFormActive}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative rounded-b-2xl overflow-hidden transition-all duration-500 bg-card border-t border-white/[0.05] ${!isFormActive ? 'filter blur-[2px]' : ''}`}>
          <div className="p-6 pointer-events-auto">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm text-white/70">Priority</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <Button
                      key={p}
                      type="button"
                      onClick={() => updateField('priority', p)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        formData.priority === p
                          ? p === 'high' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : p === 'medium'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            : 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-black border-white/10 text-white/60 hover:border-white/20 hover:text-white/90'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-white/70">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !formData.due_date && 'text-white/40'
                      } bg-black border-white/10 hover:bg-white/5`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(new Date(formData.due_date), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border-white/10">
                    <Calendar
                      mode="single"
                      selected={formData.due_date ? new Date(formData.due_date) : undefined}
                      onSelect={(date) => updateField('due_date', date?.toISOString() || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className={`text-white/70 hover:text-white/90 bg-black border-white/10 hover:border-white/20 ${!isFormActive ? 'opacity-50' : ''}`}
                  disabled={!isFormActive}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || !isFormActive}
                  className={`bg-blue-500 hover:bg-blue-600 text-white ${!isFormActive ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      {initialData ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    initialData ? 'Update Task' : 'Create Task'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isFormActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="text-white/70 text-sm">Form activating...</div>
        </div>
      )}
    </form>
  )
}

export function QuickAddTask({ section, onClose, onSubmit, initialData }: QuickAddTaskProps) {
  const transformedInitialData = initialData ? {
    title: initialData.title,
    description: initialData.description || '',
    priority: initialData.priority,
    due_date: initialData.due_date
  } : undefined

  return (
    <TaskFormProvider onSubmit={onSubmit} onClose={onClose} initialData={transformedInitialData}>
      <TaskFormContent section={section} onClose={onClose} onSubmit={onSubmit} initialData={initialData} />
    </TaskFormProvider>
  )
}