"use client"

import { useEffect } from 'react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export function CategoryFilter({ selectedCategories = [], onChange }: CategoryFilterProps) {
  useEffect(() => {
    if (selectedCategories.length === 0) {
      onChange(Object.keys(EVENT_CATEGORIES))
    }
  }, [selectedCategories, onChange])

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      if (selectedCategories.length === 1) {
        onChange(Object.keys(EVENT_CATEGORIES))
      } else {
        onChange(selectedCategories.filter(c => c !== category))
      }
    } else {
      onChange([...selectedCategories, category])
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Categories</h3>
      <div className="space-y-1">
        {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => toggleCategory(key)}
            className={cn(
              "flex items-center w-full gap-2 px-2 py-1.5 text-sm",
              "transition-colors duration-200",
              selectedCategories.includes(key) ? "bg-white/5" : "hover:bg-white/5"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              category.bgClass
            )} />
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
