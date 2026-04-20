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
    <button onClick={handleCopy} className={`text-sm font-semibold px-3 py-1 rounded border transition-all ${copied ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 shadow-sm'}`}>
      {copied ? '✓ Đã Copy' : 'Copy'}
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
  const [quantity, setQuantity] = useState(1);
  const [results, setResults] = useState<ZazzleVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zazzle_history_v2.1');
    if (saved) {
      try { setResults(JSON.parse(saved) as ZazzleVariant[]); } catch (e) { console.error("Lỗi đồng bộ lịch sử"); }
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
    if (!coreSubject) return setError('Trường "Core Subject" không được để trống.');
    setLoading(true); setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, textOnDesign, etsyInput, coreSubject, targetAudience, vibe, quantity }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi xử lý AI');

      if (data.variants) {
        const newHistory = [...data.variants, ...results].slice(0, 30);
        setResults(newHistory);
        localStorage.setItem('zazzle_history_v2.1', JSON.stringify(newHistory));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-slate-900">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black text-blue-900 flex justify-center items-center gap-2">
          Zazzle SEO Architect <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded tracking-tighter uppercase">v2.1 Stable</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Powered by Google Gemini 1.5 Flash</p>
      </header>

      <form onSubmit={handleGenerate} className="bg-white shadow-2xl rounded-3xl p-8 mb-10 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processImage(e.dataTransfer.files[0]); }}
            className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${isDragging ? 'bg-blue-50 border-blue-500 scale-105' : 'bg-slate-50 border-slate-200'}`}
          >
            <label className="cursor-pointer bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              CHỌN ẢNH THIẾT KẾ
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }} className="hidden" />
            </label>
            {imageBase64 && <img src={imageBase64} alt="Preview" className="mt-4 h-24 w-24 object-contain rounded-lg border-2 border-white shadow-md bg-white p-1" />}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-black text-slate-400 mb-2 uppercase tracking-tight">Văn bản trên thiết kế (OCR Helper)</label>
            <textarea placeholder="Nhập chính xác chữ in trên design..." className="flex-1 p-4 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-inner" value={textOnDesign} onChange={(e) => setTextOnDesign(e.target.value)} />
          </div>
        </div>

        <div className="mb-8">
          <label className="text-xs font-black text-slate-400 mb-2 uppercase tracking-tight">Đối thủ Etsy (Dán URL hoặc Title)</label>
          <input type="text" placeholder="https://www.etsy.com/listing/..." className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 shadow-inner" value={etsyInput} onChange={(e) => setEtsyInput(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <div className="md:col-span-3 text-xs font-black text-blue-900 uppercase">Thông số Zazzle cốt lõi</div>
          <input type="text" placeholder="Core Subject (VD: Cat)" className="p-3 border border-blue-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={coreSubject} onChange={(e) => setCoreSubject(e.target.value)} required />
          <input type="text" placeholder="Audience (VD: Teacher)" className="p-3 border border-blue-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
          <input type="text" placeholder="Vibe (VD: Vintage)" className="p-3 border border-blue-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={vibe} onChange={(e) => setVibe(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-white tracking-widest transition-all shadow-xl ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-black active:scale-95'}`}>
          {loading ? 'ĐANG CÀO DỮ LIỆU & PHÂN TÍCH...' : 'XUẤT BẢN SEO'}
        </button>
      </form>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-10 font-bold text-center border border-red-100 animate-pulse">{error}</div>}

      <div className="space-y-10">
        {results.map((variant, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden relative group">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Generated Title</span>
                  <p className="text-md font-black leading-tight text-slate-800">{variant.newTitle}</p>
                </div>
                <CopyButton text={variant.newTitle} />
              </div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Storytelling Description</span>
                  <p className="text-sm leading-relaxed text-slate-600 italic font-medium">"{variant.newDescription}"</p>
                </div>
                <CopyButton text={variant.newDescription} />
              </div>
              <div className="p-5 bg-slate-900 rounded-2xl flex justify-between items-center gap-4 border-2 border-blue-500/20 shadow-xl">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase block mb-1">Unique SEO Tags (Cleaned)</span>
                  <p className="text-xs font-mono font-bold text-white tracking-wider">{variant.newTags}</p>
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