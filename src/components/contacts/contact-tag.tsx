import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ContactTagProps {
  tagId: string
  className?: string
}

interface TagDetails {
  id: string
  name: string
  color: string
}

export function ContactTag({ tagId, className }: ContactTagProps) {
  const [tag, setTag] = useState<TagDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('id, name, color')
          .eq('id', tagId)
          .maybeSingle()

        if (error) {
          console.error('Error fetching tag:', error)
          return
        }

        if (data) {
          setTag(data)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTag()
  }, [tagId])

  if (loading) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 animate-pulse">
        •••
      </span>
    )
  }

  if (!tag) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
        Unknown Tag
      </span>
    )
  }

  return (
    <div className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      "bg-white/[0.05] text-zinc-300",
      className
    )}>
      {tag.name}
    </div>
  )
}
