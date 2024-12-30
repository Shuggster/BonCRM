'use client'

import { Calendar, CheckSquare, Clock, Tag, AlertCircle, Loader2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useTaskForm, TaskFormData } from './TaskFormContext'
import { FormCard, FormCardSection, formInputStyles } from '@/components/ui/form-card'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Save } from 'lucide-react'
import { MiniCalendar } from '@/components/calendar/mini-calendar'
import { Calendar as CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { TaskGroupModal } from './TaskGroupModal'
import { useState, useEffect } from 'react'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
  initialData?: Partial<TaskFormData>
}

interface FormInputLabelProps {
  label: React.ReactNode
  required?: boolean
}

interface CustomFormInputProps {
  label: React.ReactNode
  children: React.ReactNode
}

function FormInputLabel({ label, required }: FormInputLabelProps) {
  return (
    <div className="flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </div>
  )
}

function CustomFormInput({ label, children }: CustomFormInputProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white/70">{label}</div>
      {children}
    </div>
  )
}

export function SimpleTaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const { formData, updateField, isSubmitting, taskGroups, users, resetForm, error } = useTaskForm()
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTitleTouched, setIsTitleTouched] = useState(false)
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false)

  useEffect(() => {
    if (users.length > 0 || taskGroups.length > 0) {
      setIsLoading(false)
    }
  }, [users.length, taskGroups.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitAttempted(true)
    if (!formData.title.trim()) {
      return
    }
    try {
      await onSubmit(formData)
      resetForm()
      setIsTitleTouched(false)
      setIsSubmitAttempted(false)
    } catch (err) {
      console.error('Failed to submit task:', err)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('title', e.target.value)
    if (!isTitleTouched) {
      setIsTitleTouched(true)
    }
  }

  const shouldShowTitleError = (isTitleTouched || isSubmitAttempted) && !formData.title.trim()

  return (
    <div className="h-full flex flex-col rounded-b-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Upper Section */}
        <motion.div
          key="task-upper"
          className="flex-none"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              {/* Header */}
              <div className="p-6 pb-0">
                <h2 className="text-2xl font-semibold text-white">Add Task</h2>
              </div>

              <FormCardSection
                title="Basic Information"
                icon={<CheckSquare className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-6">
                  <CustomFormInput label={<FormInputLabel label="Title" required />}>
                    <div className="space-y-2">
                      <Input
                        value={formData.title}
                        onChange={handleTitleChange}
                        onBlur={() => setIsTitleTouched(true)}
                        className={cn(
                          formInputStyles,
                          shouldShowTitleError && 'border-red-500/50'
                        )}
                        placeholder="Enter task title"
                        required
                      />
                      {shouldShowTitleError && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Title is required
                        </div>
                      )}
                    </div>
                  </CustomFormInput>

                  <CustomFormInput label="Description">
                    <textarea
                      value={formData.description}
                      onChange={e => updateField('description', e.target.value)}
                      className={`${formInputStyles} w-full min-h-[120px] resize-none`}
                      placeholder="Enter task description (optional)"
                    />
                  </CustomFormInput>
                </div>
              </FormCardSection>

              <FormCardSection
                title="Task Details"
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <CustomFormInput label="Priority">
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => updateField('priority', value as 'low' | 'medium' | 'high')}
                      >
                        <SelectTrigger className="w-full bg-zinc-800/50 border-white/[0.08]">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-white/[0.08]">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </CustomFormInput>

                    <CustomFormInput label="Due Date">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal bg-[#111111] border-white/10',
                              !formData.due_date && 'text-white/60'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-white/70" />
                            {formData.due_date ? format(new Date(formData.due_date), 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <MiniCalendar
                            selectedDate={formData.due_date ? new Date(formData.due_date) : new Date()}
                            onDateSelect={(date) => updateField('due_date', date.toISOString().split('T')[0])}
                          />
                        </PopoverContent>
                      </Popover>
                    </CustomFormInput>
                  </div>

                  <CustomFormInput label="Task Group">
                    <div className="flex items-center gap-2">
                      <Select
                        value={formData.task_group_id || "no-group"}
                        onValueChange={(value) => updateField('task_group_id', value === 'no-group' ? null : value)}
                      >
                        <SelectTrigger className="w-full bg-zinc-800/50 border-white/[0.08]">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-white/[0.08]">
                          <SelectItem value="no-group">No group</SelectItem>
                          {taskGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: group.color }}
                                />
                                {group.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setIsGroupModalOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CustomFormInput>
                </div>
              </FormCardSection>
            </div>
          </div>
        </motion.div>

        {/* Lower Section */}
        <motion.div
          key="task-lower"
          className="flex-1 min-h-0"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px] pb-24" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              <FormCardSection
                title="Scheduling"
                icon={<Clock className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-6">
                  <CustomFormInput label="Status">
                    <select
                      value={formData.status || 'todo'}
                      onChange={e => updateField('status', e.target.value as 'todo' | 'in-progress' | 'completed')}
                      className={`w-full px-3 py-2 rounded-md text-white ${formInputStyles}`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </CustomFormInput>

                  <CustomFormInput label="Assigned To">
                    <Select
                      value={formData.assigned_to || 'unassigned'}
                      onValueChange={(value) => updateField('assigned_to', value === 'unassigned' ? null : value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={cn(
                        "w-full bg-[#111111] border-white/10",
                        isLoading && "opacity-50"
                      )}>
                        <SelectValue placeholder={isLoading ? "Loading users..." : "Unassigned"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-white/10">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {users.map((user) => (
                              <SelectItem 
                                key={user.id} 
                                value={user.id}
                              >
                                {user.name || user.email}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </CustomFormInput>
                </div>
              </FormCardSection>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-6 bg-[#111111] border-t border-white/10 flex justify-between items-center z-50 rounded-b-2xl">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-white/70 border-white/10 hover:bg-white/5"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
          type="button"
          className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </div>

      <TaskGroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
    </div>
  )
} 