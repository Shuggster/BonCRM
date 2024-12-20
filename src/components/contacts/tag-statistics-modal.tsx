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
      <DialogContent className="sm:max-w-[500px] bg-[#0F1629] text-white border-white/10">
        <DialogHeader className="px-8 py-6 border-b border-white/10">
          <DialogTitle className="text-xl font-medium">Tag Statistics</DialogTitle>
        </DialogHeader>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
          ) : statistics.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No tags found</div>
          ) : (
            <div className="space-y-4">
              {statistics.map((stat) => {
                const percentage = Math.max(
                  5,
                  Math.round((stat.count / Math.max(...statistics.map(s => s.count))) * 100)
                )
                
                return (
                  <div
                    key={stat.id}
                    className="relative overflow-hidden p-4 rounded-lg bg-[#1C2333] border border-white/10 hover:border-white/20 transition-all group"
                  >
                    {/* Progress bar background */}
                    <div
                      className="absolute inset-0 bg-white/5 transition-all duration-300 group-hover:bg-white/10"
                      style={{
                        width: `${percentage}%`
                      }}
                    />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full ring-2 ring-white/10"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: stat.color + '20',
                            color: stat.color
                          }}
                        >
                          {stat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">
                          {stat.count} {stat.count === 1 ? 'contact' : 'contacts'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}