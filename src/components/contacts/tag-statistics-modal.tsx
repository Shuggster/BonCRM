"use client"

import { useState, useEffect } from "react"
import { Tag, BarChart2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface TagStatistics {
  id: string
  name: string
  color: string
  count: number
}

interface TagStatisticsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TagStatisticsModal({
  isOpen,
  onClose,
}: TagStatisticsModalProps) {
  const [statistics, setStatistics] = useState<TagStatistics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchStatistics()
    }
  }, [isOpen])

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tags')
        .select(`
          id,
          name,
          color,
          contact_tag_relations:contact_tag_relations(count)
        `)

      if (error) throw error

      const stats = data.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        count: tag.contact_tag_relations.length
      }))

      // Sort by usage count descending
      stats.sort((a, b) => b.count - a.count)
      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching tag statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Tag Statistics</h2>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading statistics...</div>
        ) : (
          <div className="space-y-4">
            {statistics.map(tag => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: tag.color + '20',
                      color: tag.color 
                    }}
                  >
                    {tag.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {tag.count} {tag.count === 1 ? 'contact' : 'contacts'}
                  </span>
                  <div 
                    className="w-24 h-2 rounded-full bg-gray-600 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(tag.count / Math.max(...statistics.map(s => s.count))) * 100}%`,
                        backgroundColor: tag.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 