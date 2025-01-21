import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'

/**
 * Extracts text content from various file types
 */
export async function extractText(file: File | Buffer, fileName?: string, fileType?: string): Promise<string | null> {
  try {
    // If file is a Buffer, we're in server environment
    if (Buffer.isBuffer(file)) {
      console.log('Processing file in server environment:', fileName, fileType)
      
      // Handle PDF files
      if (fileType === 'application/pdf' || fileName?.endsWith('.pdf')) {
        console.log('Processing PDF file')
        const data = await pdfParse(file)
        console.log('Extracted text length:', data.text.length)
        return data.text
      }

      // Handle text files
      if (fileType === 'text/plain' || fileName?.endsWith('.txt')) {
        console.log('Processing text file')
        return file.toString('utf-8')
      }

      // Handle Markdown files
      if (fileType === 'text/markdown' || 
          fileName?.endsWith('.md') ||
          fileName?.endsWith('.markdown')) {
        console.log('Processing Markdown file')  
        return file.toString('utf-8')
      }

      // Handle Word documents
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileType === 'application/msword' ||
          fileName?.endsWith('.docx') ||
          fileName?.endsWith('.doc')) {
        
        console.log('Processing Word document')
        const result = await mammoth.extractRawText({ buffer: file })
        console.log('Extracted text length:', result.value.length)
        return result.value
      }
    } else {
      // Browser environment
      console.log('Extracting text from file:', file.name, file.type)

      // Handle Word documents
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword' ||
          file.name.endsWith('.docx') ||
          file.name.endsWith('.doc')) {
        
        console.log('Processing Word document')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        console.log('Extracted text length:', result.value.length)
        return result.value
      }

      // Handle text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        console.log('Processing text file')
        return await file.text()
      }

      // Handle Markdown files
      if (file.type === 'text/markdown' || 
          file.name.endsWith('.md') ||
          file.name.endsWith('.markdown')) {
        console.log('Processing Markdown file')  
        return await file.text()
      }

      // Handle PDF files
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        console.log('Processing PDF file')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await pdfParse(buffer)
        console.log('Extracted text length:', data.text.length)
        return data.text
      }
    }

    console.log('Unsupported file type')
    return null
  } catch (error) {
    console.error('Error extracting text:', error)
    throw error
  }
} 