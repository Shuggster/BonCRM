import { NextResponse } from "next/server"
import { AIProviderFactory } from '@/lib/ai/provider-factory'

interface ProviderStatus {
  available: boolean;
  error: string | null;
}

interface TestResults {
  success: boolean;
  gemini: ProviderStatus;
  timestamp: string;
}

export async function GET() {
  const results: TestResults = {
    success: true,
    gemini: { available: false, error: null },
    timestamp: new Date().toISOString()
  };

  try {
    const factory = AIProviderFactory.getInstance();
    
    // Test Gemini
    try {
      const provider = factory.getProvider();
      results.gemini.available = await provider.isAvailable();
    } catch (error) {
      results.gemini.error = error instanceof Error ? error.message : 'Unknown error';
      results.success = false;
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge'; 