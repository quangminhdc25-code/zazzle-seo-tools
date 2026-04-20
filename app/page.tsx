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
    <button onClick={handleCopy} className={`text-[10px] font-bold px-3 py-1 rounded border transition-all ${copied ? 'bg-green-500 text-white border-green-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
};

export default function ZazzleSEOTool() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [textOnDesign, setTextOnDesign] = useState('');
  const [etsyInput, setEtsyInput] = useState('');
  const [coreSubject, setCoreSubject] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [vibe, setVibe] = useState('');
  const [results, setResults] = useState<ZazzleVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tự động khôi phục lịch sử từ LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('zazzle_pro_history');
    if (saved) {
      try { setResults(JSON.parse(saved) as ZazzleVariant[]); } catch (e) { console.error("Lỗi parse lịch sử"); }
    }
  }, []);

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width, height = img.height;
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setImageBase64(canvas.toDataURL('image/jpeg', 0.8));
      };
      if (typeof reader.result === 'string') img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreSubject) return setError('Hãy nhập Core Subject.');
    setLoading(true); setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, textOnDesign, etsyInput, coreSubject, targetAudience, vibe }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi server');

      if (data.variants) {
        const newHistory = [...data.variants, ...results].slice(0, 50);
        setResults(newHistory);
        localStorage.setItem('zazzle_pro_history', JSON.stringify(newHistory));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          ZAZZLE SEO <span className="text-blue-600">ARCHITECT</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Enterprise Edition v2.1 Strict</p>
      </header>

      <form onSubmit={handleGenerate} className="bg-white rounded-[2rem] shadow-2xl p-8 mb-12 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processImage(e.dataTransfer.files[0]); }}
            className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${isDragging ? 'bg-blue-50 border-blue-600 scale-[1.02]' : 'bg-slate-50 border-slate-200'}`}
          >
            <label className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:scale-105 transition-transform shadow-lg">
              CHỌN HOẶC KÉO ẢNH
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }} className="hidden" />
            </label>
            {imageBase64 && <img src={imageBase64} alt="Preview" className="mt-6 h-28 w-28 object-contain rounded-2xl border-4 border-white shadow-xl bg-white" />}
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Text on Design</label>
              <textarea placeholder="Gõ chính xác chữ trên thiết kế..." className="w-full h-32 p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" value={textOnDesign} onChange={(e) => setTextOnDesign(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Etsy Inspiration (URL or Keywords)</label>
          <input type="text" placeholder="Dán link sản phẩm Etsy hoặc từ khóa đối thủ..." className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-100 outline-none text-sm shadow-inner" value={etsyInput} onChange={(e) => setEtsyInput(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-6 bg-slate-900 rounded-3xl">
          <input type="text" placeholder="Core Subject *" className="p-3 border-none rounded-xl bg-slate-800 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={coreSubject} onChange={(e) => setCoreSubject(e.target.value)} required />
          <input type="text" placeholder="Audience" className="p-3 border-none rounded-xl bg-slate-800 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
          <input type="text" placeholder="Vibe" className="p-3 border-none rounded-xl bg-slate-800 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={vibe} onChange={(e) => setVibe(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className={`w-full py-5 rounded-3xl font-black text-white tracking-widest shadow-2xl transition-all ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
          {loading ? 'ANALYZING DESIGN...' : 'GENERATE SEO CONTENT'}
        </button>
      </form>

      {error && <div className="bg-red-500 text-white p-4 rounded-2xl mb-12 font-bold text-center text-sm shadow-xl animate-bounce">{error}</div>}

      <div className="space-y-8">
        {results.map((variant, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase block mb-2">Title</span>
                  <p className="text-lg font-black text-slate-900 leading-tight">{variant.newTitle}</p>
                </div>
                <CopyButton text={variant.newTitle} />
              </div>
              <div className="flex justify-between items-start gap-6 border-t border-slate-50 pt-6">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase block mb-2">Description</span>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium">{variant.newDescription}</p>
                </div>
                <CopyButton text={variant.newDescription} />
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl flex justify-between items-center gap-6 border border-blue-100">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-blue-300 uppercase block mb-2">Unique Tags</span>
                  <p className="text-xs font-mono font-black text-blue-900 tracking-tight">{variant.newTags}</p>
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