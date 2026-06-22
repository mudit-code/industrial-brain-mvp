# Industrial Brain MVP (Knowledge Copilot)

An AI-powered Industrial Knowledge Intelligence platform built to ingest heterogeneous documents and make their collective intelligence queryable, actionable, and continuously updated. It uses an advanced Semantic RAG (Retrieval-Augmented Generation) pipeline paired with deterministic structural parsing.

## Overview
This prototype specifically tackles the "Expert Knowledge Copilot" challenge. It allows users to upload technical PDFs (e.g., engineering problem statements, maintenance guides, user manuals) and converse with them. It bridges the gap between unstructured knowledge files and immediate operational intelligence.

## Architecture & Solution Approach
The architecture consists of a React frontend and a Node.js/Express backend that handles vectorization locally.

1. **Document Ingestion**: Extracts text entirely from PDFs using `pdf-parse` while tracking metadata (filename, page numbers, chunks).
2. **Local Semantic Embeddings**: Splits text into 500-1000 word chunks. It generates mathematical vector embeddings using the lightweight `Transformers.js` (`Xenova/all-MiniLM-L6-v2` model) entirely locally—no API costs or data leakage for embedding.
3. **Local Vector Database**: All embeddings and text chunks are stored locally using `LanceDB`. 
4. **Intent Detection & Deterministic Bypass**: A specialized router intercepts structural/ordinal queries (e.g., "how many pages", "What is the 3rd problem statement?", "what is the first line"). Instead of confusing the LLM, the system bypasses semantic search, parses the raw document arrays deterministically, and answers instantly with 100% precision.
5. **LLM Generation**: For conceptual queries ("Explain the architecture", "Summarize this manual"), the backend performs an L2 distance vector search in LanceDB to find the top 5 most relevant chunks. It feeds these chunks, strictly sorted in chronological order, to the **Groq Llama-3.1 API** to generate grounded answers with source citations.

## Tech Stack
- **Frontend**: React.js 
- **Backend**: Node.js, Express.js
- **Vector Database**: LanceDB (Local Serverless)
- **Local Embedding Engine**: Transformers.js (`all-MiniLM-L6-v2`)
- **LLM Integration**: Groq API (Llama 3.1)
- **File Parsing**: `pdf-parse`, `multer`

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- A Groq API Key

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Open the `.env` file in the `backend/` directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## How to Use the MVP

1. **Upload a Document**: Open the frontend in your browser. Use the UI to select and upload a PDF document (e.g., `Developer OS` or a `Hackathon Problem Statement` PDF).
2. **Wait for Processing**: The backend will extract the text, split it into chunks, generate local vector embeddings, and save it to the local LanceDB database. *(Note: The first ever run will take a few extra seconds as it downloads the 90MB local Xenova model.)*
3. **Ask Conceptual Questions**: Use the Copilot chat to ask semantic questions about the uploaded content.
   - *Example:* "Explain the architecture of Developer OS."
   - *Example:* "Summarize the safety protocol steps."
4. **Ask Structural Questions**: Test the deterministic query bypass by asking specific layout questions.
   - *Example:* "What is the uploaded filename?"
   - *Example:* "How many problem statements are there?"
   - *Example:* "What is the 5th problem statement?"
   - *Example:* "How many pages are in the document?"
   
The system will intelligently route conceptual questions to the LLM and structural questions to the raw data parser!
