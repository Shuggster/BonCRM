"use client"

import { useState } from 'react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export function CategoryFilter({ selectedCategories = [], onChange }: CategoryFilterProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category))
    } else {
      onChange([...selectedCategories, category])
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Categories</h3>
      <div className="space-y-2">
        {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => toggleCategory(key)}
            className={cn(
              "flex items-center w-full gap-2 px-2 py-1.5 rounded-md text-sm",
              "transition-colors duration-200",
              selectedCategories.includes(key) ? category.bgClass + '/20' : 'hover:bg-white/5'
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
