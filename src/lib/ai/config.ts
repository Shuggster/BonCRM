import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const AI_CONFIG = {
    groq: {
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'mixtral-8x7b-32768'
    },
    deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-pro'
    }
}; 