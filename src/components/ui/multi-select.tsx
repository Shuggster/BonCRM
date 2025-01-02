'use client'

import * as React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(v => v !== value))
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-[40px] w-full flex-wrap items-center gap-1 rounded-md border border-white/10 bg-black p-1.5 text-sm focus-within:border-blue-500",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        {selected.length > 0 ? (
          selected.map(value => {
            const option = options.find(o => o.value === value)
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-sm"
              >
                {option?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-white/20"
                  onClick={(e) => removeOption(value, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )
          })
        ) : (
          <span className="text-white/50">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-black py-1 shadow-lg">
            {options.map(option => {
              const isSelected = selected.includes(option.value)
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-1.5 hover:bg-white/10",
                    isSelected && "bg-white/5"
                  )}
                  onClick={() => toggleOption(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
} 