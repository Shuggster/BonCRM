"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { DocumentService } from '../services/document-service'
import { ProcessingState } from '../types'
import { Progress } from '@/components/ui/progress'

export function DocumentUpload() {
  const { data: session } = useSession()
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.id) return

    try {
      const documentService = new DocumentService()
      await documentService.uploadDocument(
        file,
        session.user.id,
        {
          isPrivate: false
        },
        setProcessing
      )
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".txt,.pdf,.docx,.json"
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        
        {processing.status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{processing.status}</span>
              <span>{processing.progress}%</span>
            </div>
            <Progress value={processing.progress} />
            {processing.error && (
              <p className="text-sm text-red-500">{processing.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 