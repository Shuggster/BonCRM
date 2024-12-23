export type EventCategory = 
  | 'default'
  | 'meeting'
  | 'call'
  | 'deadline'
  | 'task'
  | 'reminder'
  | 'personal'
  | 'work'
  | 'social'
  | 'holiday'

export const EVENT_CATEGORIES = {
  default: {
    label: 'Default',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500'
  },
  meeting: {
    label: 'Meeting',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500'
  },
  task: {
    label: 'Task',
    bgClass: 'bg-green-500',
    borderClass: 'border-green-500'
  },
  reminder: {
    label: 'Reminder',
    bgClass: 'bg-yellow-500',
    borderClass: 'border-yellow-500'
  },
  deadline: {
    label: 'Deadline',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500'
  }
} as const
