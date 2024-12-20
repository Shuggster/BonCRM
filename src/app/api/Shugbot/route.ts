import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(req: Request) {
  const { message } = await req.json()

  // TODO: Implement AI processing logic here
  // For now, we'll just echo the message
  const response = `You said: ${message}`

  // Store the message in Supabase
  await supabase
    .from('messages')
    .insert({ user_message: message, bot_response: response })

  return NextResponse.json({ response })
}

