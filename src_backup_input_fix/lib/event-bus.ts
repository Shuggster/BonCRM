type EventCallback = (...args: any[]) => void

class EventBus {
  private events: { [key: string]: EventCallback[] } = {}

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  emit(event: string, ...args: any[]) {
    console.log('EventBus: emitting event:', event, args)
    if (!this.events[event]) return
    this.events[event].forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error('Error in event callback:', error)
      }
    })
  }
}

export const eventBus = new EventBus() 