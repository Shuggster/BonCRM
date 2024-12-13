"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TagStatistic {
  id: string
  name: string
  color: string
  count: number
}

interface TagStatisticsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TagStatisticsModal({ isOpen, onClose }: TagStatisticsModalProps) {
  const [statistics, setStatistics] = useState<TagStatistic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchStatistics()
    }
  }, [isOpen])

  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)
    try {
      // First get all tags
      const { data: tags, error: tagsError } = await supabase
        .from('contact_tags')
        .select('id, name, color')

      if (tagsError) throw tagsError

      // Then get the count for each tag
      const statsPromises = (tags || []).map(async (tag) => {
        const { count, error: countError } = await supabase
          .from('contact_tag_relations')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id)

        if (countError) throw countError

        return {
          ...tag,
          count: count || 0
        }
      })

      const stats = await Promise.all(statsPromises)
      
      // Sort by count descending
      stats.sort((a, b) => b.count - a.count)
      
      setStatistics(stats)
    } catch (err) {
      console.error('Failed to fetch statistics:', err instanceof Error ? err.message : 'Unknown error')
      setError('Failed to load tag statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tag Statistics</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="text-center">Loading statistics...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : statistics.length === 0 ? (
            <div className="text-center text-gray-500">No tags found</div>
          ) : (
            <div className="space-y-4">
              {statistics.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span>{stat.name}</span>
                  </div>
                  <span className="font-medium">{stat.count} contacts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 