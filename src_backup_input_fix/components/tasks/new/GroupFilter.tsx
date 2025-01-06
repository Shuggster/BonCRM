import { useState, useEffect } from 'react'
import { Check, FolderKanban, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TaskGroup } from '@/types/tasks'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface GroupFilterProps {
  selectedGroup: string | null
  onGroupChange: (group: string | null) => void
}

export function GroupFilter({ selectedGroup, onGroupChange }: GroupFilterProps) {
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('task_groups')
        .select('*')
        .order('name')

      if (!error && data) {
        setGroups(data)
      }
    }

    fetchGroups()
  }, [])

  const selectedGroupName = selectedGroup 
    ? groups.find(g => g.id === selectedGroup)?.name 
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`h-8 border-dashed gap-2 ${
            selectedGroup
              ? 'border-white/20 bg-white/5'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>{selectedGroupName || 'Group'}</span>
          {selectedGroup && (
            <X
              className="w-3 h-3 ml-2"
              onClick={(e) => {
                e.stopPropagation()
                onGroupChange(null)
              }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-[#1a1a1a] border border-white/[0.08]"
      >
        {groups.map((group) => (
          <DropdownMenuItem
            key={group.id}
            className="flex items-center gap-2 focus:bg-white/[0.02] focus:text-white"
            onClick={() => onGroupChange(group.id)}
          >
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span>{group.name}</span>
            </div>
            {selectedGroup === group.id && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
        {groups.length === 0 && (
          <div className="px-2 py-4 text-sm text-center text-zinc-500">
            No groups created yet
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 