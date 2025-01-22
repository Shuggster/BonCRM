"use client"

import * as XLSX from 'xlsx';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ExcelChunk {
  sheetName: string;
  content: string;
  preview: string;
  rowRange: string;
  length: number;
}

export class ExcelProcessor {
  private readonly CHUNK_SIZE = 1000;
  private supabase = createClientComponentClient();

  // Helper function to convert Excel column number to letter (e.g., 1 -> A, 27 -> AA)
  private columnToLetter(column: number): string {
    let temp, letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }

  // Helper function to format cell references
  private formatCellRef(row: number, col: number): string {
    return `${this.columnToLetter(col + 1)}${row + 1}`;
  }

  // Helper function to format cell range
  private formatRange(startRow: number, endRow: number, startCol: number, endCol: number): string {
    return `${this.formatCellRef(startRow, startCol)}:${this.formatCellRef(endRow, endCol)}`;
  }

  // Clean and format cell value
  private formatCellValue(cell: XLSX.CellObject | undefined): string {
    if (!cell || cell.v === undefined) return '';
    
    // Handle different types of cell values
    switch (cell.t) {
      case 'n': // number
        return cell.v.toString();
      case 'd': // date
        // Ensure cell.v is a valid date value
        if (cell.v instanceof Date) {
          return cell.v.toISOString();
        } else if (typeof cell.v === 'number') {
          // Excel stores dates as numbers, convert to Date
          return new Date(Math.round((cell.v - 25569) * 86400 * 1000)).toISOString();
        }
        return cell.v.toString();
      case 'b': // boolean
        return cell.v ? 'Yes' : 'No';
      case 'e': // error
        return '#ERROR';
      case 's': // string
      default:
        return cell.v.toString();
    }
  }

  // Create chunks from a worksheet
  private async createChunksFromSheet(worksheet: XLSX.WorkSheet): Promise<string[]> {
    const chunks: string[] = [];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const headers: string[] = [];
    let currentChunk = '';
    const CHUNK_SIZE = 5000; // Increased chunk size
    const ROWS_PER_BATCH = 50; // Process more rows per batch

    // Extract headers
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = this.formatCellRef(range.s.r, C);
      headers.push(this.formatCellValue(worksheet[cellRef]));
    }

    // Process rows in batches
    for (let R = range.s.r + 1; R <= range.e.r; R += ROWS_PER_BATCH) {
      const batchEndRow = Math.min(R + ROWS_PER_BATCH - 1, range.e.r);
      let batchContent = '';

      for (let currentRow = R; currentRow <= batchEndRow; currentRow++) {
        const rowValues = headers.map((header, C) => {
          const cellValue = this.formatCellValue(worksheet[this.formatCellRef(currentRow, C)]);
          return cellValue ? `${header}: ${cellValue}` : '';
        }).filter(Boolean);

        if (rowValues.length > 0) {
          batchContent += rowValues.join(' | ') + '\n';
        }
      }

      currentChunk += batchContent;

      // Create new chunk when size limit is reached
      if (currentChunk.length >= CHUNK_SIZE || R + ROWS_PER_BATCH > range.e.r) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = '';
      }
    }

    return chunks;
  }

  // Generate embedding with retry logic (reused from WordProcessor)
  private async generateEmbedding(text: string, retries = 3): Promise<number[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch('http://localhost:3002/api/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) {
          throw new Error(`Failed to generate embedding: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
      } catch (error) {
        console.error(`Embedding generation attempt ${attempt}/${retries} failed:`, error);
        if (attempt === retries) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Failed to generate embedding after retries');
  }

  // Helper function to wait between operations
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Process Excel file
  async processExcelFile(filePath: string, fileName: string, userId: string): Promise<void> {
    console.log('Processing Excel file:', fileName);
    console.log('User ID:', userId);
    console.log('File path:', filePath);

    try {
      // Download file from Supabase storage
      const { data: fileData, error: downloadError } = await this.supabase
        .storage
        .from('files')
        .download(`sales/${fileName}`);

      if (downloadError) throw downloadError;
      if (!fileData) throw new Error('No file data received');

      // Read Excel file
      const buffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // Process each sheet
      const allChunks: ExcelChunk[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const sheetChunks = await this.createChunksFromSheet(sheet);
        allChunks.push(...sheetChunks.map(content => ({
          sheetName,
          content,
          preview: content.slice(0, 100), // Assuming a preview of 100 characters
          rowRange: '1-50', // Assuming the first 50 rows are processed
          length: content.length
        })));
      }

      console.log(`Created ${allChunks.length} total chunks from ${workbook.SheetNames.length} sheets`);

      // Create document
      const { data: documentData, error: insertError } = await this.supabase
        .from('documents')
        .insert({
          title: fileName,
          content: JSON.stringify(workbook.SheetNames), // Store sheet names as content
          user_id: userId,
          file_name: fileName,
          file_path: `sales/${fileName}`,
          department: 'sales',
          is_private: false,
          metadata: {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            totalChunks: allChunks.length,
            sheetCount: workbook.SheetNames.length,
            sheets: workbook.SheetNames,
            fileSize: fileData.size,
            processedAt: new Date().toISOString()
          }
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!documentData) throw new Error('No document data received after insertion');

      const documentId = documentData.id;
      console.log('Created document with ID:', documentId);

      // Process chunks in batches with delays
      await this.processChunks(allChunks.map(chunk => chunk.content), documentId, userId);

      console.log('Successfully processed Excel file:', fileName);
      console.log('Created chunks:', allChunks.length);

    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  }

  private async processChunks(chunks: string[], documentId: string, userId: string) {
    const BATCH_SIZE = 5;
    console.log(`Processing ${chunks.length} chunks in batches of ${BATCH_SIZE}`);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (chunk, index) => {
        try {
          const embedding = await this.generateEmbedding(chunk);
          await this.supabase.from('document_chunks').insert({
            document_id: documentId,
            content: chunk,
            embedding,
            metadata: {
              batchIndex: i + index,
              totalChunks: chunks.length
            },
            user_id: userId
          });
        } catch (error) {
          console.error(`Error processing chunk ${i + index}:`, error);
          throw error;
        }
      }));

      if (i + BATCH_SIZE < chunks.length) {
        await this.sleep(2000); // 2 second delay between batches
      }
    }
  }
} 