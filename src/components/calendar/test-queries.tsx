'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CalendarEvent } from '@/types/calendar'

// Test queries for calendar functionality
export const testCalendarQueries = {
  createEvent: async (event: Partial<CalendarEvent>) => {
    const supabase = createClientComponentClient()
    console.log('Creating test event:', event)

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          title: event.title,
          description: event.description,
          start_time: event.start,
          end_time: event.end,
          category: event.category,
          priority: event.priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      console.log('Event created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  updateEvent: async (eventId: string, updates: Partial<CalendarEvent>) => {
    const supabase = createClientComponentClient()
    console.log('Updating test event:', { eventId, updates })

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: updates.title,
          description: updates.description,
          start_time: updates.start,
          end_time: updates.end,
          category: updates.category,
          priority: updates.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error
      console.log('Event updated successfully:', data)
      return data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  deleteEvent: async (eventId: string) => {
    const supabase = createClientComponentClient()
    console.log('Deleting test event:', eventId)

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      console.log('Event deleted successfully')
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  getEvents: async () => {
    const supabase = createClientComponentClient()
    console.log('Fetching test events')

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) throw error
      console.log('Events fetched successfully:', data)
      return data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  }
} 