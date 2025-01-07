"use client"

import { useState, createContext, useContext } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users2 } from "lucide-react"
import { toast } from "sonner"
import { useUsers } from "@/hooks/useUsers"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface UserTeam {
  id: string;
  name: string;
  role: 'leader' | 'member';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  teams?: UserTeam[];
}

interface FormContextType {
  formData: {
    email: string;
    password: string;
    name: string;
    role: string;
    department: string;
  };
  setFormData: (data: Partial<FormContextType['formData']>) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string;
}

const FormContext = createContext<FormContextType | null>(null)

function FormProvider({ children, onSubmit, onCancel, initialData }: {
  children: React.ReactNode;
  onSubmit: (data: FormContextType['formData']) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<FormContextType['formData']>;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "operational",
    department: "accounts",
    ...initialData
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (err: any) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Error submitting form')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormContext.Provider value={{
      formData,
      setFormData: (data) => setFormData(prev => ({ ...prev, ...data })),
      handleSubmit,
      isLoading,
      error
    }}>
      {children}
    </FormContext.Provider>
  )
}

function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('Form components must be used within FormProvider')
  }
  return context
}

function TopSection() {
  const { formData, setFormData, isLoading } = useFormContext()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Details</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#111111] border border-white/10 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ email: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#111111] border border-white/10 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="password">Temporary Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ password: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#111111] border border-white/10 rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}

function BottomSection({ onCancel }: { onCancel: () => void }) {
  const { formData, setFormData, handleSubmit, isLoading, error } = useFormContext()

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="role">Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData({ role: value })} 
            disabled={isLoading}
          >
            <SelectTrigger className="w-full px-4 py-2 bg-[#111111] border border-white/10 rounded-lg">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select 
            value={formData.department} 
            onValueChange={(value) => setFormData({ department: value })} 
            disabled={isLoading}
          >
            <SelectTrigger className="w-full px-4 py-2 bg-[#111111] border border-white/10 rounded-lg">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="trade_shop">Trade Shop</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="flex gap-3">
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading}
            className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white h-10 rounded-lg font-medium transition-colors border border-white/[0.08]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1 border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function SplitForm({ onSubmit, onCancel, defaultValues }: {
  onSubmit: (data: FormContextType['formData']) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<FormContextType['formData']>;
}) {
  return (
    <FormProvider onSubmit={onSubmit} onCancel={onCancel} initialData={defaultValues}>
      <div className="h-[50%]">
        <motion.div
          key="upper"
          className="h-full"
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
          <TopSection />
        </motion.div>
      </div>
      <div className="h-[50%]">
        <motion.div
          key="lower"
          className="h-full"
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
          <BottomSection onCancel={onCancel} />
        </motion.div>
      </div>
    </FormProvider>
  )
}

export function UserManagement() {
  const { data: session } = useSession()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { users, isLoading: usersLoading, mutate: refreshUsers } = useUsers()

  const handleCreateUser = async (formData: FormContextType['formData']) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      if (data.success) {
        setSelectedUser(null)
        toast.success('User created successfully')
        setTimeout(() => refreshUsers(), 2000)
      } else {
        throw new Error(data.error || 'Failed to create user')
      }
    } catch (err: any) {
      console.error('Error creating user:', err)
      toast.error('Failed to create user', {
        description: err.message || 'Please try again'
      })
      throw err
    }
  }

  const handleUpdateUser = async (formData: FormContextType['formData']) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      if (data.success) {
        setSelectedUser(null)
        toast.success('User updated successfully')
        setTimeout(() => refreshUsers(), 2000)
      } else {
        throw new Error(data.error || 'Failed to update user')
      }
    } catch (err: any) {
      console.error('Error updating user:', err)
      toast.error('Failed to update user', {
        description: err.message || 'Please try again'
      })
      throw err
    }
  }

  // Main content - User list
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Users</h1>
            <Button
              onClick={() => setSelectedUser({})}
              className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
            >
              <Users2 className="w-4 h-4" />
              New User
            </Button>
          </div>

          <div className="rounded-md border border-white/[0.08]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Department</th>
                  <th className="p-4 text-left">Teams</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : users?.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-white/[0.08] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        user.role === 'admin' && "bg-blue-500/20 text-blue-400",
                        user.role === 'manager' && "bg-green-500/20 text-green-400",
                        user.role === 'operational' && "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{user.department}</td>
                    <td className="p-4">
                      {user.teams?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {user.teams.map(team => (
                            <span 
                              key={team.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {team.name} ({team.role})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No teams</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            className="fixed inset-y-0 right-0 w-[400px] bg-[#111111] border-l border-white/[0.08] shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <SplitForm
              onSubmit={selectedUser.id ? handleUpdateUser : handleCreateUser}
              onCancel={() => setSelectedUser(null)}
              defaultValues={selectedUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}