"use client"

import { FileManagerContent } from './FileManagerContent'

export default function FileManagerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">File Manager</h1>
      <FileManagerContent />
    </div>
  )
} 