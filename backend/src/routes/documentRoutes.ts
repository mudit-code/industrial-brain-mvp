import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { saveDocument, getDocuments } from '../data/repository.js';
import { fileURLToPath } from 'url';
import { embedText, addChunksToVectorDB } from '../data/vectorStore.js';
import type { DocumentChunk } from '../data/vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/', (req, res) => {
  const docs = getDocuments();
  // Don't send extracted text to frontend to save bandwidth
  const safeDocs = docs.map(({ extractedText, ...rest }: any) => rest);
  res.json(safeDocs);
});

function render_page(pageData: any) {
  let render_options = {
      normalizeWhitespace: false,
      disableCombineTextItems: false
  }

  return pageData.getTextContent(render_options)
  .then(function(textContent: any) {
      let lastY, text = '';
      for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY){
              text += item.str;
          } else {
              text += '\n' + item.str;
          }
          lastY = item.transform[5];
      }
      return `\n--- PAGE ${pageData.pageIndex + 1} ---\n${text}\n`;
  });
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer, { pagerender: render_page });
  return data.text;
}

function chunkTextWithPages(text: string, originalName: string): Omit<DocumentChunk, 'vector'>[] {
  const chunks: Omit<DocumentChunk, 'vector'>[] = [];
  const parts = text.split(/(?=--- PAGE \d+ ---)/);
  
  let chunkIndex = 0;
  for (const part of parts) {
    if (part.trim().length === 0) continue;
    
    // Extract page number
    const pageMatch = part.match(/--- PAGE (\d+) ---/);
    const pageNumber = pageMatch && pageMatch[1] ? parseInt(pageMatch[1], 10) : 1;
    
    // Clean text
    const cleanText = part.replace(/--- PAGE \d+ ---/, '').trim();
    if (cleanText.length === 0) continue;
    
    // Split into ~500 word chunks with 50 word overlap
    const words = cleanText.split(/\s+/);
    let currentChunkWords: string[] = [];
    
    for (const word of words) {
      currentChunkWords.push(word);
      if (currentChunkWords.length >= 500) {
        chunks.push({
          text: currentChunkWords.join(' '),
          originalName,
          chunkIndex: chunkIndex++,
          pageNumber,
          totalChunks: 0 // placeholder
        });
        currentChunkWords = currentChunkWords.slice(-50);
      }
    }
    
    if (currentChunkWords.length > 50 || (chunks.length === 0 && currentChunkWords.length > 0)) {
       chunks.push({
          text: currentChunkWords.join(' '),
          originalName,
          chunkIndex: chunkIndex++,
          pageNumber,
          totalChunks: 0 // placeholder
        });
    }
  }
  
  // Set correct totalChunks
  const total = chunks.length;
  return chunks.map(c => ({ ...c, totalChunks: total }));
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('Upload Error: No file provided in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let extractedText = `[Simulated Content for ${req.file.originalname}] This document contains technical specifications, maintenance procedures, and asset logs relevant to industrial operations.`;

    // Try to extract real text if PDF
    if (req.file.mimetype === 'application/pdf') {
      try {
        const text = await extractTextFromPDF(filePath);
        if (text && text.trim().length > 0) {
          extractedText = text;
          console.log(`Successfully extracted ${text.length} characters from ${req.file.originalname}`);
          
          console.log('Chunking document...');
          const docChunks = chunkTextWithPages(extractedText, req.file.originalname);
          console.log(`Created ${docChunks.length} chunks. Generating embeddings...`);
          
          const finalChunks: DocumentChunk[] = [];
          for (const chunk of docChunks) {
              const vector = await embedText(chunk.text);
              finalChunks.push({
                  ...chunk,
                  vector
              });
          }
          
          console.log(`Embeddings generated. Inserting into LanceDB...`);
          await addChunksToVectorDB(finalChunks);
        } else {
          console.warn(`Extracted text from ${req.file.originalname} was empty. Using simulated content.`);
        }
      } catch (parseErr) {
        console.error(`Failed to parse PDF ${req.file.originalname}, falling back to simulated text. Error:`, parseErr);
      }
    } else {
      console.log(`Uploaded file ${req.file.originalname} is not a PDF (mimetype: ${req.file.mimetype}). Skipping text extraction.`);
    }

    const newDoc = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      extractedText
    };

    saveDocument(newDoc);
    console.log(`Document ${newDoc.originalName} saved successfully with ID ${newDoc.id}`);
    
    // Return without text
    const { extractedText: _, ...safeDoc } = newDoc;
    res.json(safeDoc);
  } catch (err) {
    console.error('Upload Process Error:', err);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

export default router;
