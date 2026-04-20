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
    <button onClick={handleCopy} className={`text-sm font-semibold px-3 py-1 rounded border transition-colors ${copied ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'}`}>
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

  // Load lịch sử an toàn từ LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('zazzle_history_v2');
    if (saved) {
      try { setResults(JSON.parse(saved) as ZazzleVariant[]); } catch (e) { console.error("Lỗi load lịch sử"); }
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
        body: JSON.stringify({ imageBase64, textOnDesign, etsyInput, coreSubject, targetAudience, vibe, quantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi máy chủ không xác định');
      }

      const data = await response.json();
      if (data.variants) {
        const newHistory = [...data.variants, ...results].slice(0, 30);
        setResults(newHistory);
        localStorage.setItem('zazzle_history_v2', JSON.stringify(newHistory));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-black">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800 flex justify-center items-center gap-3">
        Zazzle SEO Architect <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full border border-blue-300 font-mono">v2.1 DIRECT</span>
      </h1>

      <form onSubmit={handleGenerate} className="bg-white shadow-xl rounded-2xl px-8 pt-6 pb-8 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processImage(e.dataTransfer.files[0]); }}
            className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${isDragging ? 'bg-blue-100 border-blue-500 scale-[1.02]' : 'bg-gray-50 border-gray-300'}`}
          >
            <p className="text-sm font-bold text-gray-600 mb-2">1. Hình ảnh thiết kế</p>
            <label className="cursor-pointer bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 px-4 rounded-lg transition-all text-sm">
              Kéo thả hoặc Chọn ảnh
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }} className="hidden" />
            </label>
            {imageBase64 && <img src={imageBase64} alt="Preview" className="mt-4 h-24 w-24 object-contain rounded border bg-white p-1" />}
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-gray-700 font-bold mb-2 text-sm text-center">2. Chữ in trên áo</label>
            <textarea placeholder="Gõ chính xác chữ trên design..." className="w-full h-24 p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={textOnDesign} onChange={(e) => setTextOnDesign(e.target.value)} />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2 text-sm">3. Nguồn cảm hứng Etsy (URL hoặc Text)</label>
          <input type="text" placeholder="Dán link sản phẩm Etsy để hệ thống tự cào keyword..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" value={etsyInput} onChange={(e) => setEtsyInput(e.target.value)} />
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><label className="block text-blue-900 font-bold mb-2 text-sm">4. Thông số Zazzle bắt buộc</label></div>
          <div>
            <input type="text" placeholder="Core Subject (VD: Funny Cat)" className="w-full p-2 border border-gray-300 rounded bg-white text-sm outline-none focus:border-blue-500" value={coreSubject} onChange={(e) => setCoreSubject(e.target.value)} required />
          </div>
          <div>
            <input type="text" placeholder="Audience (VD: Teacher, Mom)" className="w-full p-2 border border-gray-300 rounded bg-white text-sm outline-none focus:border-blue-500" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
          </div>
          <div>
            <input type="text" placeholder="Vibe (VD: Vintage, Retro)" className="w-full p-2 border border-gray-300 rounded bg-white text-sm outline-none focus:border-blue-500" value={vibe} onChange={(e) => setVibe(e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
          {loading ? 'ĐANG PHÂN TÍCH VÀ CÀO DỮ LIỆU...' : 'XUẤT BẢN SEO NIÊM YẾT'}
        </button>
      </form>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl mb-8 font-bold text-sm text-center">{error}</div>}

      <div className="space-y-8">
        {results.map((variant, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden relative transition-all hover:shadow-xl">
            {idx === 0 && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-3 py-1 font-black rounded-bl-lg">NEW</div>}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1"><span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Title</span><p className="text-sm font-bold leading-tight">{variant.newTitle}</p></div>
                <CopyButton text={variant.newTitle} />
              </div>
              <div className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1"><span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Description</span><p className="text-sm leading-relaxed text-gray-700">{variant.newDescription}</p></div>
                <CopyButton text={variant.newDescription} />
              </div>
              <div className="flex justify-between items-start gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex-1"><span className="text-[10px] font-black text-blue-300 uppercase block mb-1">Tags (10 Unique Tags)</span><p className="text-sm font-mono font-bold text-blue-900">{variant.newTags}</p></div>
                <CopyButton text={variant.newTags} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}