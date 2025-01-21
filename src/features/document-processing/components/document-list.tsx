"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FileText, Download, Trash2 } from 'lucide-react'
import { ProcessedDocument } from '../types'
import { formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function DocumentList() {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const { data: session } = useSession()
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('DocumentList mounted')
    console.log('Session in DocumentList:', session)
    
    if (!session?.user?.id) {
      console.log('No user session, skipping fetch')
      return
    }

    const fetchDocuments = async () => {
      try {
        console.log('Fetching documents for department:', session.user.department)
        
        const { data: files, error } = await supabase.storage
          .from('files')
          .list('sales', {
            sortBy: { column: 'name', order: 'desc' }
          })

        if (error) {
          console.error('Error fetching files:', error)
          return
        }

        console.log('Files found:', files)

        const docs: ProcessedDocument[] = files.map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(`sales/${file.name}`)

          return {
            id: file.id || file.name,
            title: file.name,
            content: '',
            metadata: {
              fileSize: file.metadata?.size || 0,
              fileType: file.metadata?.mimetype || 'unknown',
              fileName: file.name,
              uploadedBy: session.user.id,
              isPrivate: false,
              publicUrl,
              department: 'sales'
            },
            file_name: file.name,
            file_path: `sales/${file.name}`,
            user_id: session.user.id,
            department: 'sales',
            created_at: file.created_at || new Date().toISOString(),
            is_private: false
          }
        })

        console.log('Processed documents:', docs)
        setDocuments(docs)

      } catch (error) {
        console.error('Error in fetchDocuments:', error)
      }
    }

    fetchDocuments()

    // Set up storage subscription
    const channel = supabase
      .channel('storage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'storage',
          table: 'objects',
          filter: `bucket_id=eq.files`
        },
        (payload) => {
          console.log('Storage change detected:', payload)
          fetchDocuments()
        }
      )
      .subscribe((status) => {
        console.log('Storage subscription status:', status)
      })

    return () => {
      console.log('DocumentList unmounting, cleaning up subscription')
      channel.unsubscribe()
    }
  }, [session])

  const handleDownload = async (document: ProcessedDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(document.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.file_name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  const handleDelete = async (document: ProcessedDocument) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([document.file_path])

      if (storageError) throw storageError

      setDocuments(docs => docs.filter(d => d.id !== document.id))
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4" />
          <p>No documents found</p>
        </div>
      ) : (
        documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-medium">{doc.title}</h3>
              <p className="text-sm text-gray-500">
                {doc.metadata.fileType} • {formatBytes(doc.metadata.fileSize)}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(doc)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(doc)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
} 