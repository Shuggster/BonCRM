"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AvatarProps {
  url: string | null
  size?: "sm" | "md" | "lg"
  name: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base"
}

export function Avatar({ url, size = "md", name }: AvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (url) {
      downloadImage(url)
    }
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path)
      
      if (error) throw error
      
      const url = URL.createObjectURL(data)
      setImageUrl(url)
    } catch (error) {
      console.error('Error downloading image:', error)
      setError(true)
    }
  }

  if (!url || error) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gray-700 flex items-center justify-center text-gray-300`}
        title={name}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-700`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <User className="w-1/2 h-1/2" />
        </div>
      )}
    </div>
  )
} 