"use client"

import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { FileUpload } from "@/components/FileUpload"

export default function FileUploadDemo() {
  const { toast } = useToast()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">File Upload Demo</h1>
      <FileUpload
        onUploadSuccess={(file) => {
          toast({
            description: `Successfully uploaded ${file.name}`,
            variant: "default",
          })
        }}
        onUploadError={(error) => {
          toast({
            description: error.message || "Failed to upload file",
            variant: "destructive",
          })
        }}
      />
      <Toaster />
    </div>
  )
} 