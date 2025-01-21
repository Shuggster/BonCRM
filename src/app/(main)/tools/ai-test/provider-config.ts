export const AI_PROVIDER_CONFIG = {
  // Primary provider
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro',
    maxTokens: 2048
  },
  
  // Secondary provider
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    maxTokens: 2048
  },
  
  // Optional provider
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'mixtral-8x7b-32768',
    maxTokens: 2048
  }
}

export function getProviderConfig(providerType: string) {
  const config = AI_PROVIDER_CONFIG[providerType as keyof typeof AI_PROVIDER_CONFIG]
  if (!config?.apiKey) {
    throw new Error(`No API key found for provider: ${providerType}`)
  }
  return config
} 