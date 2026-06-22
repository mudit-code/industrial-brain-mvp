import { Router } from 'express';
import { Groq } from 'groq-sdk';
import { getDocuments } from '../data/repository.js';

const router = Router();

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
    
    // Build context from documents
    const docs = getDocuments();
    let context = 'You are an Industrial Knowledge Copilot. Answer the user\'s questions professionally based ONLY on the following uploaded document context. If the answer is not present in the uploaded document context, explicitly say that the information is not available in the uploaded document. Do NOT invent facts or hallucinate.\n\n';
    
    if (docs.length > 0) {
      context += "--- UPLOADED DOCUMENTS CONTEXT ---\n";
      docs.forEach((doc: any) => {
        // Truncate text to avoid exceeding token limits on Groq free tier
        const MAX_CHARS = 10000; // Roughly 2500 tokens
        const text = doc.extractedText.length > MAX_CHARS 
          ? doc.extractedText.substring(0, MAX_CHARS) + '... [TRUNCATED]'
          : doc.extractedText;
        context += `Document Name: ${doc.originalName}\nContent:\n${text}\n\n`;
      });
      context += "----------------------------------\n\n";
    }

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
