"use client"

import { useState, useRef } from "react"
import { User, Upload, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Avatar } from "./avatar"

interface AvatarUploadProps {
  url: string | null
  name: string
  onUpload: (url: string) => void
}

export function AvatarUpload({ url, name, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      
      // Validate file type
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
        throw new Error('Invalid file type. Please upload an image file.')
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 2MB.')
      }

      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert(error.message || 'Error uploading avatar!')
    } finally {
      setUploading(false)
    }
  }

  async function removeAvatar() {
    try {
      setUploading(true)

      if (url) {
        const { error } = await supabase.storage
          .from('avatars')
          .remove([url])

        if (error) throw error
      }

      onUpload('')
    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Error removing avatar!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar url={url} size="lg" name={name} />
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {url && (
          <button
            type="button"
            onClick={removeAvatar}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
        accept="image/*"
      />
    </div>
  )
} 