'use client';

import { useState } from 'react';

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className={`text-sm font-semibold px-3 py-1 rounded border transition-colors ${
        copied ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
      }`}
    >
      {copied ? '✓ Đã Copy' : 'Copy'}
    </button>
  );
};

export default function ZazzleSEOTool() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [textOnDesign, setTextOnDesign] = useState('');
  const [etsyTitle1, setEtsyTitle1] = useState('');
  const [etsyTitle2, setEtsyTitle2] = useState('');
  const [coreSubject, setCoreSubject] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [vibe, setVibe] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImageBase64(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreSubject) {
      setError('Vui lòng nhập Chủ thể cốt lõi (Core Subject).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const etsyTitles = [etsyTitle1, etsyTitle2].filter(t => t.trim() !== '');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64, 
          textOnDesign, 
          etsyTitles, 
          coreSubject, 
          targetAudience, 
          vibe, 
          quantity 
        }),
      });

      if (!response.ok) {
        const textError = await response.text();
        throw new Error(`Lỗi máy chủ (${response.status}): ${textError.substring(0, 150)}...`);
      }

      const data = await response.json();

      if (data.variants) {
        setResults(prev => [...data.variants, ...prev]);
      } else {
        throw new Error('Dữ liệu trả về bị hỏng hoặc rỗng.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Zazzle Hybrid SEO Generator</h1>

      <form onSubmit={handleGenerate} className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-8 border border-gray-200">
        
        {/* Khối 1: Tải ảnh & Text trên áo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <label className="block text-blue-900 font-bold mb-3">1. Upload Ảnh (Tự động nén)</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors">
                + Chọn Hình Ảnh
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {imageBase64 && <span className="text-sm text-green-700 font-bold">✓ Đã tải ảnh</span>}
            </div>
            {imageBase64 && <img src={imageBase64} alt="Preview" className="mt-3 h-24 object-contain rounded border border-gray-300 shadow-sm bg-white" />}
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <label className="block text-blue-900 font-bold mb-2">2. Text in trên áo (OCR Bypass)</label>
            <input type="text" placeholder="Gõ chính xác chữ trên áo vào đây..." className="w-full p-2 border border-gray-300 rounded bg-white text-black font-medium placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={textOnDesign} onChange={(e) => setTextOnDesign(e.target.value)} />
          </div>
        </div>

        {/* Khối 2: Etsy Keywords */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-gray-800 font-bold mb-2">3. Mượn Keyword từ Etsy (Dán Title Etsy vào đây)</label>
          <div className="space-y-3">
            <input type="text" placeholder="Etsy Title 1..." className="w-full p-2 border border-gray-300 rounded bg-white text-black font-medium placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={etsyTitle1} onChange={(e) => setEtsyTitle1(e.target.value)} />
            <input type="text" placeholder="Etsy Title 2..." className="w-full p-2 border border-gray-300 rounded bg-white text-black font-medium placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={etsyTitle2} onChange={(e) => setEtsyTitle2(e.target.value)} />
          </div>
        </div>

        {/* Khối 3: Ma trận Zazzle */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <label className="block text-yellow-900 font-bold mb-4">4. Định hướng Zazzle (Bắt buộc)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-800">Core Subject *</label>
              <input type="text" placeholder="VD: Messy Bun..." className="w-full p-2 border border-gray-300 rounded mt-1 bg-white text-black font-medium placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none" value={coreSubject} onChange={(e) => setCoreSubject(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-800">Audience</label>
              <input type="text" placeholder="VD: Mom, Union..." className="w-full p-2 border border-gray-300 rounded mt-1 bg-white text-black font-medium placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-800">Vibe / Occasion</label>
              <input type="text" placeholder="VD: Labor Day..." className="w-full p-2 border border-gray-300 rounded mt-1 bg-white text-black font-medium placeholder-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none" value={vibe} onChange={(e) => setVibe(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-2">
            <label className="font-bold text-gray-800">Số lượng:</label>
            <input type="number" min="1" max="5" className="w-20 p-2 border border-gray-300 rounded text-center bg-white text-black font-bold outline-none" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <button type="submit" disabled={loading} className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-md ${loading ? 'opacity-50' : ''}`}>
            {loading ? 'Đang phân tích AI...' : 'Tạo Nội Dung SEO'}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-100 text-red-800 border border-red-300 p-4 rounded mb-6 font-bold whitespace-pre-wrap">{error}</div>}

      {/* HIỂN THỊ KẾT QUẢ */}
      <div className="space-y-6">
        {results.map((variant, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
            {index === 0 && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MỚI NHẤT</div>}
            
            <div className="mb-5 bg-gray-50 p-4 rounded border">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800 w-24">Title:</span>
                <p className="flex-1 text-black font-medium">{variant.newTitle}</p>
                <CopyButton text={variant.newTitle} />
              </div>
            </div>
            
            <div className="mb-5 bg-gray-50 p-4 rounded border">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800 w-24">Description:</span>
                <p className="flex-1 text-black text-justify pr-4">{variant.newDescription}</p>
                <CopyButton text={variant.newDescription} />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-blue-900 w-24">Tags:</span>
                <p className="flex-1 text-black font-mono text-sm leading-relaxed pr-4">{variant.newTags}</p>
                <CopyButton text={variant.newTags} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}