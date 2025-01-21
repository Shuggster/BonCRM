'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'

interface FileProcessButtonProps {
  fileId: string
  filePath: string
  onProcessed?: () => void
}

export function FileProcessButton({ fileId, filePath, onProcessed }: FileProcessButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session } = useSession()

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      if (!session?.user?.id) throw new Error('No authenticated user')
      console.log('Starting file process:', { fileId, filePath })
      
      // 1. Download file from storage
      const supabase = createClientComponentClient()
      console.log('Downloading file from storage...')
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('files')
        .download(filePath)

      if (downloadError) {
        console.error('Download error:', downloadError)
        throw downloadError
      }
      if (!fileData) throw new Error('No file data received')
      
      console.log('File downloaded successfully:', {
        size: fileData.size,
        type: fileData.type
      })

      // 2. Create document record
      console.log('Creating document record...')
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: filePath.split('/').pop() || '',
          content: '', // Will be populated after processing
          metadata: {
            size: fileData.size,
            type: fileData.type,
            file_id: fileId,
            file_path: filePath
          },
          file_name: filePath.split('/').pop() || '',
          file_path: filePath,
          user_id: session.user.id
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      console.log('Document record created:', document)

      // 3. Convert file to base64 and send for processing
      console.log('Converting file to base64...')
      const fileBuffer = await fileData.arrayBuffer()
      const base64Content = Buffer.from(fileBuffer).toString('base64')

      console.log('Sending to processing endpoint...')
      const response = await fetch('/api/process/document', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`
        },
        body: JSON.stringify({ 
          documentId: document.id,
          fileContent: base64Content,
          metadata: {
            type: fileData.type,
            size: fileData.size,
            name: document.file_name,
            user_id: session.user.id,
            team_id: null,
            department: null
          }
        }),
      })

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Server error:', errorDetails)
        throw new Error(`Server returned ${response.status}: ${errorDetails.error}`)
      }

      console.log('Processing started successfully')
      toast.success('Document processing started')
      
      if (onProcessed) {
        onProcessed()
      }
      
    } catch (error) {
      console.error('Process error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handleProcess}
      disabled={isProcessing}
      className="p-2 rounded-lg hover:bg-white/[0.05] text-zinc-400 hover:text-blue-400 transition-colors disabled:opacity-50"
      title="Process"
    >
      <Sparkles className="h-4 w-4" />
    </button>
  )
} 