// AI Assistant Configuration
export const AI_ASSISTANT_CONFIG = {
  features: {
    fileAnalysis: false,  // Disabled by default
    chat: true,           // Basic chat enabled
    voiceInput: false,    // Disabled by default
  },
  safety: {
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    allowedFileTypes: ['text/plain', 'application/json'],
    maxTokens: 1000,
  },
  ui: {
    position: {
      default: { bottom: 20, right: 20 },
    },
    theme: {
      primary: 'purple',
      background: 'black',
    }
  }
}

// Strict type checking for configuration
export type AIAssistantConfig = typeof AI_ASSISTANT_CONFIG

// Safe feature checking
export const isFeatureEnabled = (feature: keyof typeof AI_ASSISTANT_CONFIG.features): boolean => {
  return AI_ASSISTANT_CONFIG.features[feature] || false
}

// File safety checking
export const isFileSafe = (file: File): boolean => {
  return (
    file.size <= AI_ASSISTANT_CONFIG.safety.maxFileSize &&
    AI_ASSISTANT_CONFIG.safety.allowedFileTypes.includes(file.type)
  )
} 