"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  MessageSquare, 
  Tag, 
  Mail, 
  Phone, 
  Edit, 
  Plus, 
  Clock,
  Activity
} from "lucide-react"

interface ContactActivity {
  id: string
  type: string
  description: string
  metadata: any
  created_at: string
}

interface ContactActivityProps {
  contactId: string
}

export function ContactActivity({ contactId }: ContactActivityProps) {
  const [activities, setActivities] = useState<ContactActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [contactId])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActivities(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note_added':
        return <MessageSquare className="h-4 w-4" />
      case 'tag_added':
      case 'tag_removed':
        return <Tag className="h-4 w-4" />
      case 'email_updated':
        return <Mail className="h-4 w-4" />
      case 'phone_updated':
        return <Phone className="h-4 w-4" />
      case 'contact_edited':
        return <Edit className="h-4 w-4" />
      case 'contact_created':
        return <Plus className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'note_added':
        return 'text-blue-400'
      case 'tag_added':
        return 'text-green-400'
      case 'tag_removed':
        return 'text-red-400'
      case 'email_updated':
      case 'phone_updated':
      case 'contact_edited':
        return 'text-yellow-400'
      case 'contact_created':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatActivityContent = (activity: ContactActivity) => {
    switch (activity.type) {
      case 'tag_added':
        return `Added tag: ${activity.metadata.tagName}`
      case 'tag_removed':
        return `Removed tag: ${activity.metadata.tagName}`
      case 'note_added':
        return 'Added a new note'
      case 'note_edited':
        return 'Updated a note'
      case 'note_deleted':
        return 'Deleted a note'
      default:
        return activity.description
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Clock className="h-5 w-5 animate-spin mx-auto mb-2" />
        Loading activity history...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-2 bg-red-500/10 border border-red-500 rounded text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <Activity className="h-5 w-5 mx-auto mb-2" />
          <p>No activity history yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[19px] w-px bg-gray-700" />
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} bg-gray-800 border border-gray-700 z-10`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-white">{formatActivityContent(activity)}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 