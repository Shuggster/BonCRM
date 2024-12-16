export const EVENT_CATEGORIES = {
  default: {
    label: 'Default',
    bgClass: 'bg-gray-500',
    borderClass: 'border-gray-500'
  },
  meeting: {
    label: 'Meeting',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500'
  },
  call: {
    label: 'Call',
    bgClass: 'bg-green-500',
    borderClass: 'border-green-500'
  },
  break: {
    label: 'Break',
    bgClass: 'bg-yellow-500',
    borderClass: 'border-yellow-500'
  },
  work: {
    label: 'Work',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500'
  },
  design: {
    label: 'Design',
    bgClass: 'bg-pink-500',
    borderClass: 'border-pink-500'
  },
  presentation: {
    label: 'Presentation',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500'
  },
  conference: {
    label: 'Conference',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500'
  },
  workshop: {
    label: 'Workshop',
    bgClass: 'bg-indigo-500',
    borderClass: 'border-indigo-500'
  },
  holiday: {
    label: 'Holiday',
    bgClass: 'bg-teal-500',
    borderClass: 'border-teal-500'
  }
} as const

export type EventCategory = keyof typeof EVENT_CATEGORIES
