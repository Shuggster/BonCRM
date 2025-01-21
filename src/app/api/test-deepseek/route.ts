import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.deepseek.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-5979089cbf82455d9768da34ecd68cb8'
      },
      body: JSON.stringify({
        input: "This is a test message",
        model: "deepseek-base"
      })
    });

    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response body:', data);

    if (!response.ok) {
      return NextResponse.json({ 
        error: `API returned ${response.status}`,
        details: data
      }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true,
      data: JSON.parse(data)
    });
  } catch (error) {
    console.error('Error testing Deepseek API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 });
  }
} 