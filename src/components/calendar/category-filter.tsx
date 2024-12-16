"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

export function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoryChange([...selectedCategories, category])
    }
  }

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
        {selectedCategories.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onCategoryChange([])}
          >
            Clear filters
          </motion.button>
        )}
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "relative group transition-all duration-200",
                  selectedCategories.includes(key) ? "bg-white/10" : "bg-white/5",
                  "hover:bg-white/15 border-white/10"
                )}
                onClick={() => toggleCategory(key)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      category.bgClass
                    )}
                  />
                  <span className="text-xs">{category.label}</span>
                </div>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
