import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/provider-factory';

interface ProviderStatus {
  available: boolean;
  error: string | null;
}

interface TestResults {
  success: boolean;
  gemini: ProviderStatus;
  timestamp: string;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Test endpoint hit');
  
  const results: TestResults = {
    success: true,
    gemini: { available: false, error: null },
    timestamp: new Date().toISOString()
  };

  try {
    console.log('Creating AI provider factory');
    const factory = AIProviderFactory.getInstance({
      gemini: { apiKey: process.env.GEMINI_API_KEY || '' }
    });

    try {
      console.log('Testing Gemini provider');
      const provider = factory.getProvider();
      results.gemini.available = await provider.isAvailable();
      console.log('Gemini provider available:', results.gemini.available);
    } catch (error) {
      console.error('Gemini provider error:', error);
      results.gemini.error = error instanceof Error ? error.message : 'Unknown error';
      results.success = false;
    }

    console.log('Returning results:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 