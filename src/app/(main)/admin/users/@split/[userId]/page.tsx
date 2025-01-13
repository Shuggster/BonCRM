"use client"

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SimpleUserForm } from '@/components/admin/UserManagement'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  department: string;
}

interface Props {
  params: {
    userId: string
  }
}

export default function UserDetailView({ params }: Props) {
  const router = useRouter()
  const { userId } = params
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      if (!userId) {
        setUser(null)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to load user')
        }

        setUser(data.user)
      } catch (error: any) {
        console.error('Error loading user:', error)
        setError(error.message)
        toast.error('Failed to load user', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [userId])

  const handleClose = () => {
    router.push('/admin/users')
  }

  return (
    <div className="w-[400px] shrink-0 border-l border-white/[0.08] bg-[#111111]/50 backdrop-blur-xl overflow-hidden h-full flex flex-col">
      <motion.div
        key="user-upper"
        className="flex-none"
        initial={{ y: "-100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="p-6">
            <h2 className="text-lg font-semibold">
              {loading ? 'Loading...' : error ? 'Error' : user ? 'Edit User' : 'User Not Found'}
            </h2>
          </div>
        </div>
      </motion.div>

      <motion.div
        key="user-lower"
        className="flex-1 min-h-0"
        initial={{ y: "100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button variant="outline" onClick={handleClose}>
                Go Back
              </Button>
            </div>
          </div>
        ) : user ? (
          <SimpleUserForm
            defaultValues={user}
            onSubmit={async (data) => {
              try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })

                if (!response.ok) {
                  const error = await response.json()
                  throw new Error(error.message || 'Failed to update user')
                }

                toast.success('User updated successfully')
              } catch (error: any) {
                toast.error('Failed to update user', {
                  description: error.message
                })
              }
            }}
            onCancel={handleClose}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400">User not found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
} 