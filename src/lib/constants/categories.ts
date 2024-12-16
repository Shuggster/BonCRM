export const EVENT_CATEGORIES = {
  meeting: {
    label: 'Meeting',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-500'
  },
  call: {
    label: 'Call',
    bgClass: 'bg-green-500',
    textClass: 'text-green-500'
  },
  deadline: {
    label: 'Deadline',
    bgClass: 'bg-red-500',
    textClass: 'text-red-500'
  },
  task: {
    label: 'Task',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-500'
  },
  reminder: {
    label: 'Reminder',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-500'
  },
  default: {
    label: 'Event',
    bgClass: 'bg-gray-500',
    textClass: 'text-gray-500'
  }
} as const;
