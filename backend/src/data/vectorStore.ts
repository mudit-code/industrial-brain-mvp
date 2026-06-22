import * as lancedb from '@lancedb/lancedb';
import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../lancedb_data');

let embedder: any = null;

export async function getEmbedder() {
  if (!embedder) {
    console.log('Initializing embedding model (Xenova/all-MiniLM-L6-v2)... This may take a moment on first run.');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model initialized.');
  }
  return embedder;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getEmbedder();
  // Generate embedding using mean pooling and L2 normalization
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

let db: lancedb.Connection | null = null;
export async function getDb() {
  if (!db) {
    db = await lancedb.connect(dbPath);
  }
  return db;
}

export interface DocumentChunk {
  vector: number[];
  text: string;
  originalName: string;
  chunkIndex: number;
  pageNumber: number;
  totalChunks: number;
}

export async function addChunksToVectorDB(chunks: DocumentChunk[]) {
  if (chunks.length === 0) return;
  const database = await getDb();
  
  const tableNames = await database.tableNames();
  if (tableNames.includes('document_chunks')) {
    const table = await database.openTable('document_chunks');
    await table.add(chunks);
    console.log(`Appended ${chunks.length} chunks to existing vector table.`);
  } else {
    await database.createTable('document_chunks', chunks);
    console.log(`Created new vector table with ${chunks.length} chunks.`);
  }
}

export async function searchRelevantChunks(queryVector: number[], limit: number = 5): Promise<any[]> {
  const database = await getDb();
  const tableNames = await database.tableNames();
  if (!tableNames.includes('document_chunks')) {
    console.warn('Vector table does not exist yet. Please upload documents first.');
    return [];
  }
  
  const table = await database.openTable('document_chunks');
  const results = await table.search(queryVector).limit(limit).toArray();
  return results;
}
