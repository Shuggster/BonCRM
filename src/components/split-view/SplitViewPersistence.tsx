import { useLayoutEffect } from 'react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'

export function SplitViewPersistence() {
  const { setContentAndShow } = useSplitViewStore()

  useLayoutEffect(() => {
    try {
      const savedState = localStorage.getItem('splitViewState')
      if (savedState) {
        const { upperCard, lowerCard, type } = JSON.parse(savedState)
        // Use requestAnimationFrame to ensure we're not updating during render
        requestAnimationFrame(() => {
          setContentAndShow(upperCard, lowerCard, type)
        })
      }
    } catch (error) {
      console.error('Failed to restore split view state:', error)
    }
  }, [setContentAndShow])

  return null
} 