'use client';

import React, { useState, useEffect } from 'react';

interface ZazzleVariant {
  newTitle: string;
  newDescription: string;
  newTags: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`text-[10px] font-bold px-3 py-1 rounded border transition-all ${copied ? 'bg-green-500 text-white border-green-600' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
};

export default function ZazzleSEOTool() {
  const [amazonData, setAmazonData] = useState('');
  const [etsyData, setEtsyData] = useState('');
  const [insightContext, setInsightContext] = useState('');
  
  const [results, setResults] = useState<ZazzleVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tự động khôi phục lịch sử Version 3.0
  useEffect(() => {
    const saved = localStorage.getItem('zazzle_history_v3.0');
    if (saved) {
      try { setResults(JSON.parse(saved) as ZazzleVariant[]); } catch (e) { console.error("Lỗi parse lịch sử"); }
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amazonData && !etsyData && !insightContext) {
        return setError('Hãy nhập ít nhất một trường dữ liệu (Amazon, Etsy hoặc Insight).');
    }
    setLoading(true); setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amazonData, etsyData, insightContext }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi server');

      if (data.variants) {
        const newHistory = [...data.variants, ...results].slice(0, 50);
        setResults(newHistory);
        localStorage.setItem('zazzle_history_v3.0', JSON.stringify(newHistory));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          ZAZZLE SEO <span className="text-emerald-600">NLP ARCHITECT</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
          Ver 3.0 • Powered by Gemini 2.5 Pro
        </p>
      </header>

      <form onSubmit={handleGenerate} className="bg-white rounded-[2rem] shadow-2xl p-8 mb-12 border border-slate-100">
        
        {/* Khối Data Insight Mạng */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-black text-emerald-800 uppercase mb-3">
            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">1</span> Insight Context / Bài viết nền
          </label>
          <textarea 
            placeholder="Dán nội dung bài blog, bài viết văn hóa, hoặc mô tả chi tiết ý nghĩa của thiết kế vào đây để AI tạo Storytelling Description..." 
            className="w-full h-40 p-5 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-emerald-100 outline-none text-sm transition-all shadow-inner leading-relaxed" 
            value={insightContext} 
            onChange={(e) => setInsightContext(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Khối Amazon Data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-orange-600 uppercase mb-3">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">2</span> Amazon Data
            </label>
            <textarea 
              placeholder="Dán nhiều Title và Description của các đối thủ trên Amazon vào đây..." 
              className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-orange-100 outline-none text-sm transition-all shadow-inner" 
              value={amazonData} 
              onChange={(e) => setAmazonData(e.target.value)} 
            />
          </div>

          {/* Khối Etsy Data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-orange-500 uppercase mb-3">
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">3</span> Etsy Data
            </label>
            <textarea 
              placeholder="Dán nhiều Title và Tags của các đối thủ trên Etsy vào đây..." 
              className="w-full h-48 p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-orange-100 outline-none text-sm transition-all shadow-inner" 
              value={etsyData} 
              onChange={(e) => setEtsyData(e.target.value)} 
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full py-5 rounded-3xl font-black text-white tracking-widest shadow-xl transition-all ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'}`}>
          {loading ? 'ĐANG TỔNG HỢP NGỮ NGHĨA (GEMINI 2.5 PRO)...' : 'PHÂN TÍCH DATA & TẠO SEO'}
        </button>
      </form>

      {error && <div className="bg-red-500 text-white p-4 rounded-2xl mb-12 font-bold text-center text-sm shadow-xl animate-pulse">{error}</div>}

      <div className="space-y-8">
        {results.map((variant, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase block mb-2 bg-emerald-50 inline-block px-2 py-1 rounded">Optimized Title</span>
                  <p className="text-xl font-black text-slate-900 leading-tight">{variant.newTitle}</p>
                </div>
                <CopyButton text={variant.newTitle} />
              </div>
              <div className="flex justify-between items-start gap-6 border-t border-slate-50 pt-6">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase block mb-2 bg-emerald-50 inline-block px-2 py-1 rounded">Storytelling Description</span>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium">{variant.newDescription}</p>
                </div>
                <CopyButton text={variant.newDescription} />
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl flex justify-between items-center gap-6 border border-slate-800 shadow-inner">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase block mb-2">Unique SEO Tags (Max 10)</span>
                  <p className="text-xs font-mono font-black text-white tracking-wide leading-relaxed">{variant.newTags}</p>
                </div>
                <CopyButton text={variant.newTags} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}