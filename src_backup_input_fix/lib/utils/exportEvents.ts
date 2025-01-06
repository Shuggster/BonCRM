import { CalendarEvent } from '@/types/calendar'
import { format } from 'date-fns'

export function exportEventsToCSV(events: CalendarEvent[], filename: string = 'events.csv') {
  // Define CSV headers
  const headers = [
    'Title',
    'Description',
    'Start Date',
    'End Date',
    'Category',
    'Priority'
  ]

  // Convert events to CSV rows
  const rows = events.map(event => [
    event.title,
    event.description || '',
    format(new Date(event.start), 'yyyy-MM-dd HH:mm:ss'),
    format(new Date(event.end), 'yyyy-MM-dd HH:mm:ss'),
    event.category,
    event.priority
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell)
        return cellStr.includes(',') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 