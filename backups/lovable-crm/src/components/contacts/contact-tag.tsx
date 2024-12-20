import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ContactTagProps {
  tagId: string
}

interface TagDetails {
  id: string
  tag_name: string
  color: string
}

export function ContactTag({ tagId }: ContactTagProps) {
  const [tag, setTag] = useState<TagDetails | null>(null)

  useEffect(() => {
    const fetchTag = async () => {
      const { data, error } = await supabase
        .from('contact_tags')
        .select('id, tag_name, color')
        .eq('id', tagId)
        .single()

      if (error) {
        console.error('Error fetching tag:', error)
        return
      }

      if (data) {
        setTag(data)
      }
    }

    fetchTag()
  }, [tagId])

  if (!tag) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
        {tagId}
      </span>
    )
  }

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color
      }}
    >
      {tag.tag_name}
    </span>
  )
}
