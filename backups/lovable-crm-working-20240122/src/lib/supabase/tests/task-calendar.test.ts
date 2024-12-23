import { taskCalendarService } from '../services/task-calendar'
import { taskService } from '../services/tasks'
import { calendarService } from '../services/calendar'
import { Session, User } from '@supabase/supabase-js'
import { RelationType } from '@/types/task-calendar'
import { Task } from '@/types/tasks'

// Mock session for testing
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString()
}

const mockSession: Session = {
  access_token: 'test-token',
  refresh_token: 'test-refresh-token',
  user: mockUser,
  expires_in: 3600,
  expires_at: 0,
  token_type: 'bearer'
}

describe('Task Calendar Integration Tests', () => {
  let taskId: string
  let eventId: string
  let relationId: string

  beforeEach(() => {
    // Reset IDs for each test
    taskId = 'test-task-id'
    eventId = 'test-event-id'
    relationId = 'test-relation-id'
  })

  describe('Task-Event Relations', () => {
    test('should create relation between task and event', async () => {
      const relation = await taskCalendarService.createRelation(
        taskId,
        eventId,
        'working_session' as RelationType,
        mockSession
      )

      expect(relation).toBeDefined()
      expect(relation.taskId).toBe(taskId)
      expect(relation.eventId).toBe(eventId)
      expect(relation.relationType).toBe('working_session')
    })

    test('should get task relations', async () => {
      const relations = await taskCalendarService.getTaskRelations(taskId, mockSession)
      
      expect(relations).toBeDefined()
      expect(Array.isArray(relations)).toBe(true)
      expect(relations.length).toBeGreaterThan(0)
      expect(relations[0].taskId).toBe(taskId)
    })

    test('should get event relations', async () => {
      const relations = await taskCalendarService.getEventRelations(eventId, mockSession)
      
      expect(relations).toBeDefined()
      expect(Array.isArray(relations)).toBe(true)
      expect(relations.length).toBeGreaterThan(0)
      expect(relations[0].eventId).toBe(eventId)
    })

    test('should get task with events', async () => {
      const taskWithEvents = await taskCalendarService.getTaskWithEvents(taskId, mockSession)
      
      expect(taskWithEvents).toBeDefined()
      expect(taskWithEvents.id).toBe(taskId)
      expect(taskWithEvents.relatedEvents).toBeDefined()
      expect(Array.isArray(taskWithEvents.relatedEvents)).toBe(true)
      expect(taskWithEvents.relatedEvents!.length).toBeGreaterThan(0)
      expect(taskWithEvents.relatedEvents![0].id).toBe(eventId)
    })

    test('should get event with task', async () => {
      const eventWithTask = await taskCalendarService.getEventWithTask(eventId, mockSession)
      
      expect(eventWithTask).toBeDefined()
      expect(eventWithTask.id).toBe(eventId)
      expect(eventWithTask.task).toBeDefined()
      expect(eventWithTask.task!.id).toBe(taskId)
    })

    test('should update task schedule status', async () => {
      await taskCalendarService.updateTaskScheduleStatus(
        taskId,
        'partially_scheduled',
        mockSession
      )

      const updatedTask = await taskCalendarService.getTaskWithEvents(taskId, mockSession)
      expect(updatedTask).toBeDefined()
      expect(updatedTask.id).toBe(taskId)
      expect(updatedTask.scheduleStatus).toBe('partially_scheduled')
    })

    test('should delete relation', async () => {
      // First, create a relation to delete
      const relation = await taskCalendarService.createRelation(
        taskId,
        eventId,
        'working_session' as RelationType,
        mockSession
      )

      // Then delete it
      await taskCalendarService.deleteRelation(relation.id, mockSession)
      
      // Verify it's deleted
      const relations = await taskCalendarService.getTaskRelations(taskId, mockSession)
      expect(relations).toBeDefined()
      expect(Array.isArray(relations)).toBe(true)
      expect(relations.length).toBe(0)
    })
  })
}) 