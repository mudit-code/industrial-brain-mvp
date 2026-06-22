import { Router } from 'express';
import { Groq } from 'groq-sdk';
import { embedText, searchRelevantChunks } from '../data/vectorStore.js';
import { getDocuments } from '../data/repository.js';

const router = Router();

function parseProblemStatements(text: string): string[] {
  const parts = text.split(/(?=Problem Statement\s*\d*)/gi);
  return parts.filter(p => /Problem Statement/i.test(p.trim().substring(0, 30)));
}

const ordinals: Record<string, number> = {
  'first': 1, '1st': 1, '1': 1,
  'second': 2, '2nd': 2, '2': 2,
  'third': 3, '3rd': 3, '3': 3,
  'fourth': 4, '4th': 4, '4': 4,
  'fifth': 5, '5th': 5, '5': 5,
  'sixth': 6, '6th': 6, '6': 6,
  'seventh': 7, '7th': 7, '7': 7,
  'eighth': 8, '8th': 8, '8': 8,
  'ninth': 9, '9th': 9, '9': 9,
  'tenth': 10, '10th': 10, '10': 10
};

async function handleDeterministicQuery(query: string, docs: any[]): Promise<string | null> {
  const lowerQuery = query.toLowerCase();
  if (docs.length === 0) return null;
  
  // Aggregate text from all documents
  const allText = docs.map(doc => doc.extractedText || '').join('\n\n--- NEXT DOCUMENT ---\n\n');
  const allFilenames = docs.map(doc => doc.originalName).join(', ');
  
  if (lowerQuery.includes('first line')) {
     const lines = allText.trim().split('\n').filter((l: string) => l.trim().length > 0 && !l.includes('--- NEXT DOCUMENT ---'));
     if (lines.length > 0) return `The first line is: "${lines[0]}"`;
  }
  
  if (lowerQuery.includes('last line')) {
     const lines = allText.trim().split('\n').filter((l: string) => l.trim().length > 0 && !l.includes('--- NEXT DOCUMENT ---'));
     if (lines.length > 0) return `The last line is: "${lines[lines.length - 1]}"`;
  }
  
  if (lowerQuery.includes('how many pages')) {
     const pagesMatch = allText.match(/--- PAGE \d+ ---/g);
     const numPages = pagesMatch ? pagesMatch.length : docs.length;
     return `There are ${numPages} total pages across all uploaded documents.`;
  }
  
  if (lowerQuery.includes('how many problem statements')) {
     const statements = parseProblemStatements(allText);
     return `There are ${statements.length} problem statements across all documents.`;
  }
  
  if (lowerQuery.includes('filename')) {
     return `The uploaded filenames are: ${allFilenames}`;
  }

  if (lowerQuery.includes('how many chunks')) {
     try {
       const dummyVector = Array(384).fill(0);
       const res = await searchRelevantChunks(dummyVector, 1);
       if (res && res.length > 0) {
         return `There are ${res[0].totalChunks} chunks in the document.`;
       }
     } catch(e) {}
     return `I'm not sure how many chunks are in the document.`;
  }
  
  // Robust Intent Detection for Ordinals
  const ordinalMatch = lowerQuery.match(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|\d+)\b/i);
  const isProblemStatementQuery = lowerQuery.includes('problem statement') || lowerQuery.includes('problem');
  const isConceptual = lowerQuery.match(/\b(explain|summarize|compare|describe|maintenance|compliance)\b/i);

  if (isProblemStatementQuery && ordinalMatch && !isConceptual) {
      const matchedString = ordinalMatch[1];
      if (!matchedString) return null;
      const ordinal = matchedString.toLowerCase();
      const statements = parseProblemStatements(allText);
      
      let index = -1;
      if (ordinal === 'last') {
          index = statements.length - 1;
      } else {
          index = ordinals[ordinal] ? ordinals[ordinal] - 1 : parseInt(ordinal) - 1;
      }
      
      if (index >= 0 && index < statements.length) {
          const statement = statements[index];
          if (statement) {
              return `Here is the requested problem statement:\n\n${statement.trim()}`;
          }
      } else if (statements.length > 0) {
          return `I could not find problem statement ${matchedString} in the document. The document only has ${statements.length} problem statements.`;
      }
  }
  
  return null;
}

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return res.status(500).json({ 
      error: 'API Key Missing',
      details: 'Please add your Groq API Key (GROQ_API_KEY) to the backend `.env` file to enable the AI Knowledge Copilot.' 
    });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const groq = new Groq({ apiKey });
    const docs = getDocuments();

    // Check for deterministic query bypass
    const deterministicResponse = await handleDeterministicQuery(message, docs);
    if (deterministicResponse) {
       console.log('Answered via deterministic rule bypass.');
       return res.json({ response: deterministicResponse });
    }
    
    console.log(`Generating embedding for query: "${message}"`);
    const queryVector = await embedText(message);
    
    console.log(`Searching LanceDB for relevant chunks...`);
    let relevantChunks = await searchRelevantChunks(queryVector, 5);
    
    // Sort chunks sequentially
    relevantChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
    
    let context = 'You are a document-grounded assistant.\n\nAnswer ONLY from the supplied retrieved context.\n\nDo not hallucinate.\n\nIf the answer is not present in the retrieved context, explicitly say that it could not be found.\n\nIf multiple retrieved chunks belong to the same document, treat them as sequential context.\n\nEvery answer should end with something similar to:\nSource: [Filename]\nPage: X\nChunk: Y\n\n';
    
    if (relevantChunks.length > 0) {
      context += "--- RETRIEVED DOCUMENT CONTEXT ---\n";
      relevantChunks.forEach((chunk: any) => {
        context += `Source: ${chunk.originalName}\nChunk: ${chunk.chunkIndex}\nPage: ${chunk.pageNumber}\nContent:\n${chunk.text}\n\n`;
      });
      context += "----------------------------------\n\n";
    } else {
      context += "No relevant document context found.\n\n";
    }

    console.log('--- Semantic RAG Debug Info ---');
    console.log(`Vector Search Results count: ${relevantChunks.length}`);
    relevantChunks.forEach((c: any, i: number) => {
       console.log(`[Result ${i+1}] Retrieved chunk id: ${c.chunkIndex}, Page: ${c.pageNumber}, Similarity Score: ${c._distance}`);
    });
    console.log('-------------------------------');

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant',
    });

    const reply = response.choices[0]?.message?.content || 'No response generated.';
    res.json({ response: reply });

  } catch (error: any) {
    console.error('AI Service Error (Groq):', error);
    res.status(500).json({ error: 'Failed to generate response', details: error.message || String(error) });
  }
});

export default router;
