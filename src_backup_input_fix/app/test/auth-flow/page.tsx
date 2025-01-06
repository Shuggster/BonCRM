'use client'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function TestAuthFlow() {
  const { data: session, status } = useSession()
  const [testData, setTestData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/test/auth-flow')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data')
        }
        
        setTestData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return <div className="p-4">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return <div className="p-4">Please log in to view this page</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Flow Test</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Session Info</h2>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      {testData && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Test Data</h2>
          <pre className="bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
