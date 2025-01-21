import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Ping endpoint hit');
  return NextResponse.json({ message: 'pong' });
} 