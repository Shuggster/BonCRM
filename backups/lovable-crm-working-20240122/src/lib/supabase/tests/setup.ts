import { createClient } from '@supabase/supabase-js'

// Database types (snake_case)
type DbTask = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: Date
  department: string
  user_id: string
  created_at: string
  updated_at: string
  scheduleStatus?: string
  lastScheduledAt?: string
  task_calendar_relations?: DbRelation[]
}

type DbEvent = {
  id: string
  title: string
  description: string
  start_time: Date
  end_time: Date
  category: string
  department: string
  user_id: string
  related_task_id?: string
  tasks?: DbTask
}

type DbRelation = {
  id: string
  task_id: string
  event_id: string
  relation_type: string
  created_at: string
  created_by: string
}

type MockStore = {
  tasks: DbTask[]
  calendar_events: DbEvent[]
  task_calendar_relations: DbRelation[]
}

// Mock data store
const mockStore: MockStore = {
  tasks: [
    {
      id: 'test-task-id',
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'medium',
      due_date: new Date(),
      department: 'sales',
      user_id: 'test-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scheduleStatus: 'not_scheduled',
      lastScheduledAt: new Date().toISOString()
    }
  ],
  calendar_events: [
    {
      id: 'test-event-id',
      title: 'Test Event',
      description: 'Test Description',
      start_time: new Date(),
      end_time: new Date(Date.now() + 3600000),
      category: 'meeting',
      department: 'sales',
      user_id: 'test-user-id',
      related_task_id: 'test-task-id'
    }
  ],
  task_calendar_relations: [
    {
      id: 'test-relation-id',
      task_id: 'test-task-id',
      event_id: 'test-event-id',
      relation_type: 'working_session',
      created_at: new Date().toISOString(),
      created_by: 'test-user-id'
    }
  ]
}

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    let currentQuery: any[] = []
    let currentTable: keyof MockStore = 'tasks'

    const queryBuilder = {
      select: jest.fn().mockImplementation((fields = '*') => {
        if (fields.includes('task_calendar_relations') && currentTable === 'tasks') {
          currentQuery = currentQuery.map(task => ({
            ...task,
            task_calendar_relations: mockStore.task_calendar_relations.filter(r => r.task_id === task.id)
          }))
        }
        if (fields.includes('tasks!calendar_events_related_task_id_fkey') && currentTable === 'calendar_events') {
          currentQuery = currentQuery.map(event => ({
            ...event,
            tasks: mockStore.tasks.find(t => t.id === event.related_task_id)
          }))
        }
        return queryBuilder
      }),
      insert: jest.fn().mockImplementation((data: any) => {
        const newData = Array.isArray(data) ? data : [data]
        const insertedData = newData.map(item => ({ ...item, id: 'new-id' }))
        currentQuery = insertedData
        return queryBuilder
      }),
      update: jest.fn().mockImplementation((data: any) => {
        currentQuery = currentQuery.map(item => ({ ...item, ...data }))
        if (currentTable && currentQuery.length) {
          const currentItem = currentQuery[0]
          switch (currentTable) {
            case 'tasks':
              mockStore.tasks = mockStore.tasks.map(item => {
                if (item.id === currentItem.id) {
                  // Convert snake_case to camelCase for specific fields
                  const updatedData = { ...data }
                  if (updatedData.schedule_status) {
                    updatedData.scheduleStatus = updatedData.schedule_status
                    delete updatedData.schedule_status
                  }
                  if (updatedData.last_scheduled_at) {
                    updatedData.lastScheduledAt = updatedData.last_scheduled_at
                    delete updatedData.last_scheduled_at
                  }
                  return { ...item, ...updatedData }
                }
                return item
              })
              break
            case 'calendar_events':
              mockStore.calendar_events = mockStore.calendar_events.map(item => 
                item.id === currentItem.id ? { ...item, ...data } : item
              )
              break
            case 'task_calendar_relations':
              mockStore.task_calendar_relations = mockStore.task_calendar_relations.map(item => 
                item.id === currentItem.id ? { ...item, ...data } : item
              )
              break
          }
        }
        return queryBuilder
      }),
      delete: jest.fn().mockImplementation(() => {
        if (currentTable && currentQuery.length) {
          const currentItem = currentQuery[0]
          switch (currentTable) {
            case 'tasks':
              mockStore.tasks = mockStore.tasks.filter(item => item.id !== currentItem.id)
              break
            case 'calendar_events':
              mockStore.calendar_events = mockStore.calendar_events.filter(item => item.id !== currentItem.id)
              break
            case 'task_calendar_relations':
              mockStore.task_calendar_relations = mockStore.task_calendar_relations.filter(item => item.id !== currentItem.id)
              break
          }
        }
        currentQuery = []
        return queryBuilder
      }),
      eq: jest.fn().mockImplementation((field: string, value: unknown) => {
        currentQuery = currentQuery.filter(item => {
          const typedItem = item as Record<string, unknown>
          return typedItem[field] === value
        })
        return queryBuilder
      }),
      in: jest.fn().mockImplementation((field: string, values: unknown[]) => {
        currentQuery = currentQuery.filter(item => {
          const typedItem = item as Record<string, unknown>
          return values.includes(typedItem[field])
        })
        return queryBuilder
      }),
      single: jest.fn().mockImplementation(() => ({
        then: (cb: (arg: { data: any, error: null }) => void) => 
          cb({ data: currentQuery[0] || null, error: null })
      })),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((cb: (arg: { data: any[], error: null }) => void) => 
        cb({ data: currentQuery, error: null })
      )
    }

    return {
      from: jest.fn((table: keyof MockStore) => {
        currentTable = table
        switch (table) {
          case 'tasks':
            currentQuery = [...mockStore.tasks]
            break
          case 'calendar_events':
            currentQuery = [...mockStore.calendar_events]
            break
          case 'task_calendar_relations':
            currentQuery = [...mockStore.task_calendar_relations]
            break
          default:
            currentQuery = []
        }
        return queryBuilder
      })
    }
  })
}))

// Configure test environment
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'