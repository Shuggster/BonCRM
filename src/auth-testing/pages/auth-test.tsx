"use client"

import { useState } from 'react'
import { useAuth } from '../context/auth-context'

export default function AuthTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user, signIn, signUp, signOut } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const { error } = await signUp(email, password)
      if (error) throw error
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Auth Testing Environment</h1>
        
        {/* Current auth state display */}
        <div className="mb-8 p-4 bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Current Auth State:</h2>
          <pre className="whitespace-pre-wrap overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Auth forms */}
        <div className="space-y-8">
          {!user ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 bg-gray-800 rounded border border-gray-700"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          )}

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-500/20 text-red-300 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
