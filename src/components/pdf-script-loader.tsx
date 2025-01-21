import Script from 'next/script'
import { useEffect, useState } from 'react'

export function PDFScriptLoader() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if PDF.js is already loaded
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      setIsLoaded(true)
      return
    }
  }, [])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Configure worker after main script loads
          if (typeof window !== 'undefined') {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            setIsLoaded(true)
          }
        }}
      />
    </>
  )
} 