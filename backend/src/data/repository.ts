import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'metadata.json');

export interface DocumentMeta {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadedAt: string;
  extractedText: string;
}

// Initialize db if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

export const getDocuments = (): DocumentMeta[] => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

export const saveDocument = (doc: DocumentMeta) => {
  const docs = getDocuments();
  docs.push(doc);
  fs.writeFileSync(dbPath, JSON.stringify(docs, null, 2));
};
