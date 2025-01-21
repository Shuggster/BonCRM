import { AIService } from '../services/ai-service'
import { AI_ASSISTANT_CONFIG } from '../config'

describe('AIService', () => {
  let service: AIService

  beforeEach(() => {
    service = new AIService()
  })

  describe('Message Processing', () => {
    it('should process a message safely', async () => {
      const response = await service.processMessage('Hello')
      expect(response.message.content).toBeDefined()
      expect(response.message.role).toBe('assistant')
      expect(response.error).toBeUndefined()
    })

    it('should maintain conversation history', async () => {
      await service.processMessage('Hello')
      const messages = service.getMessages()
      expect(messages.length).toBeGreaterThan(1) // Including welcome message
      expect(messages[messages.length - 2].role).toBe('user')
      expect(messages[messages.length - 1].role).toBe('assistant')
    })
  })

  describe('File Processing', () => {
    it('should reject files when feature is disabled', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const response = await service.processFile(file)
      expect(response.message.content).toContain('disabled')
    })

    it('should reject unsafe files', async () => {
      // Override config for testing
      AI_ASSISTANT_CONFIG.features.fileAnalysis = true
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
      const response = await service.processFile(file)
      expect(response.error).toBe('File validation failed')
    })
  })

  describe('Conversation Management', () => {
    it('should clear conversation history', async () => {
      await service.processMessage('Hello')
      service.clearConversation()
      expect(service.getMessages().length).toBe(0)
    })
  })
}) 