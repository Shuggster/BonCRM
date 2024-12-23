import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ContactTagProps {
  tagId: string
}

interface TagDetails {
  id: string
  name: string
  color: string
}

export function ContactTag({ tagId }: ContactTagProps) {
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
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color
      }}
    >
      {tag.name}
    </span>
  )
}
