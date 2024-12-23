'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { changePassword } from '@/app/actions/auth'

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const result = await changePassword(newPassword)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Password updated successfully')
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.error('Password update error:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    // Return a placeholder with the same structure but no interactivity
    return (
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <div className="text-sm font-medium">New Password</div>
          <div className="h-10 w-full rounded-md border border-input bg-background" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Confirm New Password</div>
          <div className="h-10 w-full rounded-md border border-input bg-background" />
        </div>
        <div className="h-9 w-24 rounded-md bg-primary opacity-50" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm New Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}
