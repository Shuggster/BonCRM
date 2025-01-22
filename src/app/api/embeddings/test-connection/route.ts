import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    // Using the OpenAI-compatible endpoint format
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Send a small test request using the chat completions endpoint
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Test connection to Deepseek API"}
        ],
        stream: false
      })
    });

    // Get rate limit information from headers
    const rateLimitTotal = response.headers.get('x-ratelimit-limit');
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        error: `API request failed: ${error}`,
        status: response.status,
        rateLimits: {
          total: rateLimitTotal,
          remaining: rateLimitRemaining,
          reset: rateLimitReset
        }
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: 'connected',
      rateLimits: {
        total: rateLimitTotal,
        remaining: rateLimitRemaining,
        reset: rateLimitReset
      },
      response: data
    });

  } catch (error: any) {
    console.error('Error testing Deepseek connection:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test connection' },
      { status: 500 }
    );
  }
} 