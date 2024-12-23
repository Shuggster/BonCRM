"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function TestPolicies() {
  const [results, setResults] = useState<any>({})
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Only check session, no redirects
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    console.log('Current session:', currentSession)
    setSession(currentSession)
  }

  const runTests = async () => {
    await checkSession()

    if (!session?.user) {
      setResults({ 
        error: 'No authenticated user found',
        message: 'Please ensure you are logged in'
      })
      return
    }

    console.log('Running tests with user:', session.user.id) // Debug log

    // Test 1: Create
    const createResult = await supabase
      .from('calendar_events')
      .insert({
        title: 'Test Event',
        description: 'Test Description',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        category: 'meeting',
        user_id: session.user.id
      })
      .select()
      .single()

    console.log('Create result:', createResult) // Debug log

    // Test 2: Read
    const readResult = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', session.user.id)
      .limit(1)

    // Test 3: Update (if create succeeded)
    let updateResult = null
    if (createResult.data?.id) {
      updateResult = await supabase
        .from('calendar_events')
        .update({ title: 'Updated Test Event' })
        .eq('id', createResult.data.id)
        .eq('user_id', session.user.id)
        .select()
    }

    // Test 4: Delete (if create succeeded)
    let deleteResult = null
    if (createResult.data?.id) {
      deleteResult = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', createResult.data.id)
        .eq('user_id', session.user.id)
    }

    setResults({
      user: session.user.id,
      create: createResult,
      read: readResult,
      update: updateResult,
      delete: deleteResult
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={runTests}>Test Policies</Button>
        <Button 
          variant="outline" 
          onClick={checkSession}
        >
          Check Auth
        </Button>
      </div>
      <div className="bg-white/5 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Current Session:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(session?.user || null, null, 2)}
        </pre>
      </div>
      <pre className="bg-white/5 p-4 rounded-lg overflow-auto max-h-[400px]">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  )
} 