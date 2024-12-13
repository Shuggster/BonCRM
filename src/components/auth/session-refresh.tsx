'use client'

import { useEffect } from 'react'

export default function SessionRefresh() {
  useEffect(() => {
    // Temporarily disable session refresh
    return () => {}
  }, [])

  return null
}
