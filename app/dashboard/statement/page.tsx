'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API_BASE_URL from '@/lib/api';

interface Statement {
  id: string;
  month: string;
  year: number;
  download_url: string;
}

export default function StatementsPage() {
  const router = useRouter();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch statements from FastAPI backend
  useEffect(() => {
    async function fetchStatements() {
      try {
        const response = await fetch(`${API_BASE_URL}/statements`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStatements(data);
        }
      } catch (err) {
        console.error('Error fetching statements:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatements();
  }, []);

  const handleDownload = async (statementId: string, month: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/statements/${statementId}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Statement_${month}.pdf`;
      a.click();
    } catch (err) {
      alert('Failed to download statement.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition">
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-base font-semibold text-slate-800">Account Statements</h1>
        <div className="w-9" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading statements...</div>
      ) : statements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
          <p>No monthly statements available yet.</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {statements.map((stmt) => (
            <div key={stmt.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-800">{stmt.month} {stmt.year}</h4>
                  <p className="text-[10px] text-slate-400">PDF Document</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(stmt.id, stmt.month)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded-xl transition"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}