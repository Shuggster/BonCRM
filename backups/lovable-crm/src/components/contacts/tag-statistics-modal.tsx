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
      // Get all tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name')

      if (tagsError) throw tagsError

      // Get counts for each tag from contacts
      const statsPromises = (tags || []).map(async (tag) => {
        const { count, error: countError } = await supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .contains('tags', [tag.id])

        if (countError) {
          console.error('Error getting count for tag:', tag.name, countError.message)
          return { ...tag, count: 0 }
        }

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
            <div className="space-y-3">
              {statistics.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span
                      className="px-2 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: stat.color + '20',
                        color: stat.color
                      }}
                    >
                      {stat.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {stat.count} {stat.count === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}