import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({
    path: path.resolve(process.cwd(), '.env.test')
});

// Required environment variables for tests
const requiredEnvVars = [
    'NEXT_PUBLIC_AI_API_KEY',
    'NEXT_PUBLIC_DEEPSEEK_API_KEY',
    'NEXT_PUBLIC_GROQ_API_KEY',
    'NEXT_PUBLIC_GEMINI_API_KEY'
];

// Set default values for required environment variables in test mode
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        process.env[envVar] = 'test-key';
    }
});

// Configure longer timeout for AI provider tests
jest.setTimeout(30000);

// Mock fetch globally if not already mocked
if (!global.fetch) {
    global.fetch = jest.fn(() => 
        Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(''),
            body: null,
            bodyUsed: false,
            redirected: false,
            type: 'default',
            url: ''
        })
    ) as unknown as typeof fetch;
}

// Initialize test environment
console.log('🧪 AI Test Environment initialized');
console.log('✓ Environment variables loaded');
console.log('✓ Test mode enabled');

// Cleanup after tests
afterAll(() => {
    console.log('🧹 Cleaning up test environment');
    jest.clearAllMocks();
}); 