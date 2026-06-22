import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import PDFParser from 'pdf2json';
import { saveDocument, getDocuments } from '../data/repository.js';
import { fileURLToPath } from 'url';

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

function extractTextFromPDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(errData.parserError);
    });
    
    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });
    
    pdfParser.loadPDF(filePath);
  });
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
