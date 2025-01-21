import { FileText, Image as ImageIcon, FileCode, File } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FileTypeInfo {
  icon: LucideIcon
  color: string
}

export function getFileTypeInfo(filename: string): FileTypeInfo {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  
  // Images
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename)) {
    return {
      icon: ImageIcon,
      color: 'text-blue-400'
    }
  }
  
  // Documents
  if (/\.(pdf|doc|docx)$/i.test(filename)) {
    return {
      icon: FileText,
      color: 'text-red-400'
    }
  }
  
  // Code files
  if (/\.(js|ts|jsx|tsx|py|java|cpp|c|html|css|json)$/i.test(filename)) {
    return {
      icon: FileCode,
      color: 'text-green-400'
    }
  }
  
  // Default
  return {
    icon: File,
    color: 'text-zinc-400'
  }
} 