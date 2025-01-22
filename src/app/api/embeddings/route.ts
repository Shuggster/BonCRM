import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('Generating embedding for text:', text.substring(0, 100) + '...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            "role": "system",
            "content": "You are a helpful assistant that converts text into semantic embeddings. Please analyze the following text and provide a detailed semantic representation."
          },
          {
            "role": "user",
            "content": text
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Deepseek API error:', error);
      return NextResponse.json(
        { error: `Failed to generate embedding: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log token usage for monitoring
    if (data.usage) {
      console.log('Token usage:', {
        prompt_tokens: data.usage.prompt_tokens,
        total_tokens: data.usage.total_tokens
      });
    }

    // Convert the chat response into a numerical embedding
    const EMBEDDING_SIZE = 768;
    const embeddingArray = new Array(EMBEDDING_SIZE).fill(0);
    const responseText = data.choices[0].message.content;
    const words = responseText.split(/\s+/);
    
    words.forEach((word, index) => {
      const hash = hashCode(word);
      const position = Math.abs(hash) % EMBEDDING_SIZE;
      embeddingArray[position] = hash / 2147483647; // Normalize to [-1, 1]
    });

    // Return the embedding in the expected format
    return NextResponse.json({
      data: [{
        embedding: embeddingArray.slice(0, EMBEDDING_SIZE)
      }]
    });

  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}

// Helper function to generate consistent hash codes
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
} 