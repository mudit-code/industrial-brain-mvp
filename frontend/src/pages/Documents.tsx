import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      setUploading(true);
      try {
        await axios.post('http://localhost:3000/api/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await fetchDocuments();
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Knowledge Base</h1>
        <p className="text-slate-400 mt-1">Upload technical manuals and operational data for the AI Copilot.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="card-panel border-dashed border-2 border-industrial-600 hover:border-industrial-accent transition-colors bg-industrial-900/50 flex flex-col items-center justify-center py-16 cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.txt,.docx"
            />
            <div className="w-16 h-16 rounded-full bg-industrial-800 flex items-center justify-center mb-4 group-hover:bg-industrial-700 transition-colors">
              {uploading ? <Loader2 size={32} className="text-industrial-accent animate-spin" /> : <UploadCloud size={32} className="text-industrial-secondary" />}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{uploading ? 'Uploading and Indexing...' : 'Click or Drag & Drop Documents'}</h3>
            <p className="text-slate-400 mb-6">Supports PDF, TXT, DOCX</p>
            <button className="btn-primary" disabled={uploading}>Select Files</button>
          </div>

          <div className="card-panel">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-industrial-700 pb-4">Uploaded Documents ({documents.length})</h3>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No documents uploaded yet. Upload a manual to enable RAG.</p>
              ) : documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-industrial-900 border border-industrial-700">
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{doc.originalName}</p>
                      <p className="text-xs text-slate-500">{(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded recently</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Indexed
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-panel">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-industrial-700 pb-4">Knowledge Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Storage Used</p>
              <div className="w-full bg-industrial-900 rounded-full h-2">
                <div className="bg-industrial-secondary h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 text-right">4.5 GB / 10 GB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
